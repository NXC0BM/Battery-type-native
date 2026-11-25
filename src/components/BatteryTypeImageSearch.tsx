import { useEffect, useRef, useState } from "react";
import {
  BatteryType,
  isMock,
  batteryTypeError,
} from "../modules/batteryApi";
import { useSelector } from "react-redux";
import { RootState, useBatteryDispatch } from "../modules/store";
import { cacheTextVectors } from "../modules/clipCache";
export function BatteryTypeImageSearch({
  items,
  disabled,
  onResults,
}: {
  items: BatteryType[];
  disabled: boolean;
  onResults: (items: BatteryType[] | null) => void;
}) {
  const worker = useRef<Worker>();
  const imageUrl = useRef("");
  const dispatch = useBatteryDispatch();
  const textVectors = useSelector((s: RootState) => s.clip.textVectors);
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [threshold, setThreshold] = useState(0.63),
    [topK, setTopK] = useState(3);
  useEffect(() => () => {
    worker.current?.terminate();
    if (imageUrl.current) URL.revokeObjectURL(imageUrl.current);
  }, []);
  async function search(file?: File) {
    if (!file || disabled || busy) return;
    if (file.size > 10 * 1024 * 1024) {
      setStatus("Изображение должно быть не более 10 МБ");
      return;
    }
    setBusy(true);
    setStatus("Чтение описаний аккумуляторов…");
    let url = "";
    try {
      // Only the already loaded pagination page is eligible, including duplicate texts.
      const candidates = items.filter(i => i.shortDescriptionEn?.trim());
      const captions = candidates.map(i => ({ id: i.id, description: i.shortDescriptionEn! }));
      if (!captions.length) throw new Error("На текущей странице нет английских описаний");
      url = URL.createObjectURL(file);
      imageUrl.current = url;
      worker.current ??= new Worker(
        new URL("../modules/clip.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.current.onmessage = (e) => {
        if (e.data.textVectors) {
          dispatch(cacheTextVectors(e.data.textVectors));
          return;
        }
        if (e.data.status) {
          setStatus(e.data.status);
          return;
        }
        URL.revokeObjectURL(url);
        if (e.data.error) {
          setStatus(e.data.error);
          setBusy(false);
          return;
        }
        try {
          const found = e.data.results.map((r: { id: number }) =>
            candidates.find(i => i.id === r.id),
          ).filter((i: BatteryType | undefined): i is BatteryType => i !== undefined);
          onResults(found);
          setStatus(
            "Найдено: " +
              found.length +
              ". Близость (1 + cos) / 2: " +
              e.data.scores
                .slice(0, topK)
                .map((s: { score: number }) => s.score.toFixed(3))
                .join(", "),
          );
        } catch (error) {
          setStatus(batteryTypeError(error));
        } finally {
          setBusy(false);
        }
      };
      worker.current.onerror = (e) => {
        URL.revokeObjectURL(url);
        setStatus(e.message);
        setBusy(false);
      };
      worker.current.postMessage({ image: url, captions, textVectors, threshold, topK });
    } catch (e) {
      if (url) URL.revokeObjectURL(url);
      setStatus(batteryTypeError(e));
      setBusy(false);
    }
  }
  return (
    <section className="clipSearch">
      <h2 style={{ fontSize: 18 }}>Найти аккумулятор по изображению</h2>
      <p>
        Близость = (1 + cos) / 2. Порог 0,63, TopK 3 — начальные параметры для
        текущей страницы. Сравнивается загруженная картинка с английскими описаниями карточек.
      </p>
      <label>
        Порог{" "}
        <input
          aria-label="Порог CLIP"
          type="number"
          min="0.4"
          max="0.9"
          step="0.01"
          value={threshold}
          onChange={(e) =>
            setThreshold(Math.max(0.4, Math.min(0.9, +e.target.value)))
          }
        />
      </label>
      <label>
        TopK{" "}
        <input
          aria-label="TopK"
          type="number"
          min="1"
          max="20"
          value={topK}
          onChange={(e) => setTopK(Math.max(1, Math.min(20, +e.target.value)))}
        />
      </label>
      <input
        aria-label="Изображение аккумулятора"
        type="file"
        accept="image/*"
        disabled={busy || disabled || isMock}
        onChange={(e) => void search(e.target.files?.[0])}
      />
      <button
        disabled={busy}
        onClick={() => {
          onResults(null);
          setStatus("");
        }}
      >
        Сбросить поиск
      </button>
      <p role="status">{status}</p>
    </section>
  );
}
