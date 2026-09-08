import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import AppLayout from "./components/layout/AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
}
