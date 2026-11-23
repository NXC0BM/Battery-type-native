import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import GridPage from "./pages/GridPage";
import { FeedPage } from "./pages/FeedPage";
import { LoginPage } from "./pages/LoginPage";
import { AddPage } from "./pages/AddPage";
import { isNative } from "./modules/batteryApi";
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/battery_type" replace />} />
          <Route path="/battery_type" element={<GridPage />} />
          <Route path="/battery_type/feed" element={<FeedPage />} />
          <Route path="/battery_type/feed/:id" element={<FeedPage />} />
          {!isNative && (
            <>
              <Route path="/users/login" element={<LoginPage />} />
              <Route path="/battery_type/draft" element={<AddPage />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/battery_type" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
