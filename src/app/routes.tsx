import { Routes, Route } from "react-router-dom";
import Desktop from "../app/Desktop";
import YachtsApp from "../app/YachtsApp";
import YachtDetailPage from "../pages/YachtDetailPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/desktop" element={<Desktop />} />

      <Route path="/apps/yachts" element={<YachtsApp />} />
      <Route path="/apps/yachts/:id" element={<YachtDetailPage />} />
    </Routes>
  );
}
