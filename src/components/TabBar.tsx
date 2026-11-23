import "./TabBar.css";
import { useLocation, useNavigate } from "react-router-dom";
import { isNative, isMock } from "../modules/batteryApi";
export function TabBar() {
  const navigate = useNavigate(),
    location = useLocation();
  return (
    <nav className="tabBar">
      {[
        ["/battery_type", "Плитка"],
        ["/battery_type/feed", "Лента"],
        ...(!isNative
          ? [
              ["/battery_type/draft", "Добавление"],
              ["/users/login", "Вход"],
            ]
          : []),
      ].map(([route, label]) => (
        <button
          key={route}
          className={
            "tabBarItem " +
            (location.pathname === route ? "tabBarItemActive" : "")
          }
          disabled={isMock && (label === "Добавление" || label === "Вход")}
          onClick={() => navigate(route)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
