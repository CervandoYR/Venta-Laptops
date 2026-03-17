import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardHome } from "./pages/DashboardHome";
import { StudentsPage } from "./pages/StudentsPage";
import { LeadsPage } from "./pages/LeadsPage";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="leads" element={<LeadsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

