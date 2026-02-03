import { Routes, Route } from "react-router-dom";
import Desktop from "../app/Desktop";
import YachtsApp from "../app/YachtsApp";
import YachtDetailPage from "../pages/YachtDetailPage";
import TasksApp from "../app/TasksApp"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/desktop" element={<Desktop />} />
      <Route path="/apps/yachts" element={<YachtsApp />} />
      <Route path="/apps/yachts/:id" element={<YachtDetailPage />} />
      <Route path="/apps/tasks" element={<TasksApp />} />
    </Routes>
  );
}
