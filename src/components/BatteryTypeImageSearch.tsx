import { useEffect, useRef, useState } from "react";
import {
  api,
  BatteryType,
  getFeedItem,
  isMock,
  batteryTypeError,
} from "../modules/batteryApi";
export function BatteryTypeImageSearch({
  onResults,
}: {
  onResults: (items: BatteryType[] | null) => void;
}) {
  const worker = useRef<Worker>();
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [threshold, setThreshold] = useState(0.63),
    [topK, setTopK] = useState(3);
  useEffect(() => () => worker.current?.terminate(), []);
  async function search(file?: File) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setStatus("Изображение должно быть не более 10 МБ");
      return;
    }
    setBusy(true);
    setStatus("Чтение описаний аккумуляторов…");
    let url = "";
    try {
      const captions = (await api.get("/battery_type/descriptions")).data;
      url = URL.createObjectURL(file);
      worker.current ??= new Worker(
        new URL("../modules/clip.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.current.onmessage = async (e) => {
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
          const items = await Promise.all(
            e.data.results.map((r: { id: number }) => getFeedItem(r.id)),
          );
          onResults(items.filter((i): i is BatteryType => i !== null));
          setStatus(
            "Найдено: " +
              items.length +
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
      worker.current.postMessage({ image: url, captions, threshold, topK });
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
        этого каталога.
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
        disabled={busy || isMock}
        onChange={(e) => void search(e.target.files?.[0])}
      />
      <button
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
