import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  BatteryType,
  getFeedItem,
  api,
  batteryTypeError,
  isMock,
  isNative,
} from "../modules/batteryApi";
import { BatteryTypeModel } from "../components/BatteryTypeModel";
import { AttributesList } from "../components/AttributesList";
import { useBatteryType } from "../modules/store";
export function FeedPage() {
  const { id } = useParams();
  const [params] = useSearchParams(),
    navigate = useNavigate();
  const { user } = useBatteryType();
  const [item, setItem] = useState<BatteryType | null>(),
    [error, fail] = useState("");
  const next = params.get("next") === "true" && !isNative;
  const step = params.get("step");
  useEffect(() => {
    let active = true;
    setItem(undefined);
    fail("");
    getFeedItem(id ? Number(id) : undefined, next)
      .then((v) => {
        if (active) setItem(v);
      })
      .catch((e) => {
        if (active) fail(batteryTypeError(e));
      });
    return () => {
      active = false;
    };
  }, [id, next, step]);
  useEffect(() => {
    if (!item?.id || isMock || isNative) return;
    let active = true;
    const timer = setInterval(() => {
      getFeedItem(item.id, false)
        .then((v) => {
          if (active) setItem((old) => (v ? { ...old, ...v } : old));
        })
        .catch((e) => {
          if (active) fail(batteryTypeError(e));
        });
    }, 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [item?.id]);
  async function like() {
    if (!item) return;
    try {
      setItem(
        (
          await api.post("/battery_type/" + item.id + "/like", {
            like: item.isLiked ? 0 : 1,
          })
        ).data,
      );
    } catch (e) {
      fail(batteryTypeError(e));
    }
  }
  return (
    <section className="formPage">
      <h1>Лента аккумуляторов</h1>
      {error && <p role="alert">{error}</p>}
      {item === undefined ? (
        <p>Загрузка…</p>
      ) : !item ? (
        <p>Нет опубликованных аккумуляторов</p>
      ) : (
        <>
          <BatteryTypeModel
            url={item.modelUrl}
            x={item.rotationX}
            y={item.rotationY}
          />
          <h2>{item.modelName}</h2>
          <p>{item.shortDescription}</p>
          <p>
            {item.capacityMah ?? "—"} мА·ч · {item.nominalVoltageV ?? "—"} В
          </p>
          <AttributesList attributes={item.attributes} />
          {!isNative && (
            <>
              <button disabled={!user || isMock} onClick={() => void like()}>
                {item.isLiked ? "Убрать лайк" : "Поставить лайк"} ♥{" "}
                {item.likesCount}
              </button>
              <button
                onClick={() =>
                  navigate("/battery_type/feed?next=true&step=" + Date.now())
                }
              >
                Далее
              </button>
              <p>
                Позиция {item.feedPosition ?? "—"} в наборе{" "}
                {item.feedBatch ?? "—"}
              </p>
            </>
          )}
          <button onClick={() => navigate("/battery_type")}>
            Вернуться к списку
          </button>
        </>
      )}
    </section>
  );
}
