import { useState } from "react";
import { api, batteryTypeError, isMock } from "../modules/batteryApi";
import { useBatteryDispatch, useBatteryType, setUser } from "../modules/store";
export function LoginPage() {
  const [username, name] = useState(""),
    [password, pass] = useState(""),
    [error, fail] = useState("");
  const { user } = useBatteryType(),
    dispatch = useBatteryDispatch();
  async function submit(register = false) {
    try {
      fail("");
      if (register) await api.post("/users/register", { username, password });
      dispatch(
        setUser({
          ...(await api.post("/users/login", { username, password })).data,
          username,
        }),
      );
    } catch (e) {
      fail(batteryTypeError(e));
    }
  }
  return (
    <section className="formPage">
      <h1>Учётная запись</h1>
      {isMock ? (
        <p>Демонстрация каталога без сервера</p>
      ) : user ? (
        <>
          <p>Выполнен вход: {user.username}</p>
          <button
            onClick={async () => {
              try {
                await api.post("/users/logout");
                dispatch(setUser(null));
              } catch (e) {
                fail(batteryTypeError(e));
              }
            }}
          >
            Выйти
          </button>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label>
            Логин
            <input
              required
              value={username}
              onChange={(e) => name(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            Пароль
            <input
              required
              type="password"
              value={password}
              onChange={(e) => pass(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button>Войти</button>
          <button type="button" onClick={() => void submit(true)}>
            Зарегистрироваться
          </button>
        </form>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
