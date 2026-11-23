import "./GridPage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BatteryType,
  api,
  batteryTypeError,
  isMock,
  isNative,
} from "../modules/batteryApi";
import { BatteryCard } from "../components/BatteryCard";
import { CapacityFilter } from "../components/CapacityFilter";
import {
  useBatteryType,
  useBatteryDispatch,
  setCapacity,
  setPage,
  loadBatteryTypePage,
} from "../modules/store";
import { BatteryTypeImageSearch } from "../components/BatteryTypeImageSearch";
export default function GridPage() {
  const { minCapacity, page, user } = useBatteryType(),
    dispatch = useBatteryDispatch();
  const [input, setInput] = useState(minCapacity),
    [items, setItems] = useState<BatteryType[]>([]),
    [visual, setVisual] = useState<BatteryType[] | null>(null),
    [total, setTotal] = useState(0),
    [loading, load] = useState(false),
    [error, fail] = useState(""),
    [refresh, update] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    load(true);
    fail("");
    dispatch(loadBatteryTypePage({ min: minCapacity, page }))
      .unwrap()
      .then((r) => {
        if (active) {
          setItems(r.items);
          setTotal(r.total);
        }
      })
      .catch((e) => {
        if (active) fail(batteryTypeError(e));
      })
      .finally(() => {
        if (active) load(false);
      });
    return () => {
      active = false;
    };
  }, [minCapacity, page, refresh]);
  async function remove(id: number) {
    try {
      await api.delete("/battery_type/" + id);
      update((i) => i + 1);
    } catch (e) {
      fail(batteryTypeError(e));
    }
  }
  return (
    <div className="gridPage">
      <header className="appHeader">
        <div className="brand">battery_type</div>
        <h1>Типы аккумуляторов</h1>
        <p>Ёмкость и напряжение для подбора источника питания</p>
      </header>
      <CapacityFilter
        value={input}
        setValue={setInput}
        loading={loading}
        onSubmit={() => {
          dispatch(setCapacity(input));
          setVisual(null);
          update((i) => i + 1);
        }}
      />
      <BatteryTypeImageSearch onResults={setVisual} />
      <button onClick={() => update((i) => i + 1)}>Обновить каталог</button>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p>Загрузка…</p>
      ) : (
        <>
          <p style={{ padding: 16 }}>Найдено: {visual?.length ?? total}</p>
          <div className="grid">
            {(visual ?? items).map((item) => (
              <div key={item.id}>
                <BatteryCard
                  {...item}
                  onClick={() => navigate("/battery_type/feed/" + item.id)}
                />
                {user && item.isMine === 1 && !isNative && !isMock && (
                  <button onClick={() => void remove(item.id)}>
                    Удалить {item.modelName}
                  </button>
                )}
              </div>
            ))}
          </div>
          {!visual && (
            <div className="pagination">
              <button
                disabled={page <= 1}
                onClick={() => dispatch(setPage(page - 1))}
              >
                Назад
              </button>
              <span>
                Страница {page} из {Math.max(1, Math.ceil(total / 24))}
              </span>
              <button
                disabled={page * 24 >= total}
                onClick={() => dispatch(setPage(page + 1))}
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
