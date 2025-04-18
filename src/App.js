import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import WarehouseDashboard from "./pages/WarehouseDashboard";
import SalesDashboard from "./pages/SalesDashboard";

export default function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/warehouse" />} />
          <Route path="/warehouse" element={<WarehouseDashboard />} />
          <Route path="/sales" element={<SalesDashboard />} />
        </Routes>
      </Router>
  );
}
