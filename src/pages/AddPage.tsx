import { useEffect, useState } from "react";
import {
  api,
  BatteryType,
  batteryTypeError,
  isMock,
} from "../modules/batteryApi";
export function AddPage() {
  const [draft, setDraft] = useState<BatteryType | null>(null),
    [error, fail] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!isMock)
      api
        .get("/battery_type/draft")
        .then((r) => setDraft(r.data))
        .catch((e) => fail(batteryTypeError(e)));
  }, []);
  async function submit(form: HTMLFormElement) {
    setBusy(true);
    fail("");
    try {
      const fields = new FormData(form);
      if (!draft) {
        setDraft((await api.post("/battery_type", fields)).data);
      } else {
        await api.put("/battery_type/" + draft.id + "/publish", {
          shortDescription: fields.get("shortDescription"),
          shortDescriptionEn: fields.get("shortDescriptionEn"),
          capacityMah: Number(fields.get("capacityMah")),
          nominalVoltageV: Number(fields.get("nominalVoltageV")),
          attributes: [],
        });
        setDraft(null);
        form.reset();
        fail("Тип аккумулятора опубликован");
      }
    } catch (e) {
      fail(batteryTypeError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="formPage">
      <h1>Добавление аккумулятора</h1>
      {isMock ? (
        <p>В mock-режиме добавление недоступно</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(e.currentTarget);
          }}
          key={draft?.id ?? "new"}
        >
          {!draft ? (
            <>
              <label>
                Модель
                <input name="modelName" required maxLength={100} />
              </label>
              <label>
                Изображение
                <input name="image" type="file" accept="image/*" />
              </label>
              <label>
                Модель 3D (.glb/.gltf)
                <input name="model" type="file" accept=".glb,.gltf" />
              </label>
              <button disabled={busy}>Создать черновик</button>
            </>
          ) : (
            <>
              <p>{draft.modelName}</p>
              <label>
                Описание
                <textarea name="shortDescription" required maxLength={255} />
              </label>
              <label>
                Описание на английском (50–100 символов)
                <textarea
                  name="shortDescriptionEn"
                  required
                  minLength={50}
                  maxLength={100}
                />
              </label>
              <label>
                Ёмкость, мА·ч
                <input name="capacityMah" type="number" min="1" required />
              </label>
              <label>
                Напряжение, В
                <input
                  name="nominalVoltageV"
                  type="number"
                  min="0.01"
                  max="99.99"
                  step="0.01"
                  required
                />
              </label>
              <table>
                <thead>
                  <tr>
                    <th>Характеристика</th>
                    <th>Значение</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.attributes?.map((a) => (
                    <tr key={a.name}>
                      <td>{a.name}</td>
                      <td>{a.value || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button disabled={busy}>Опубликовать</button>
            </>
          )}
        </form>
      )}
      {error && <p role="status">{error}</p>}
    </section>
  );
}
