import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import AppLayout from "./components/layout/AppLayout";
import Signup from "./pages/Signup";
import { ThemeProvider } from "./provider/ThemeProvider";
import { AuthProvider } from "./provider/AuthProvider";
import RequireAuth from "./components/RequireAuth";
import Accounts from "./pages/Accounts";
import RequireRole from "./components/RequireRole";
import DocumentManager from "./pages/DocumentManager";
import Windows from "./pages/Windows";
import AllRequest from "./pages/AllRequest";
import NewRequest from "./pages/NewRequest";
import MyRequest from "./pages/MyRequest";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/" element={<Home />} />
              <Route path="/new-request" element={<NewRequest />} />
              <Route path="/my-request" element={<MyRequest />} />
              <Route
                path="/dashboard"
                element={
                  <RequireRole allowedRoles={["admin", "staff"]}>
                    <Dashboard />
                  </RequireRole>
                }
              />
              <Route
                path="/accounts"
                element={
                  <RequireRole allowedRoles={["admin"]}>
                    <Accounts />
                  </RequireRole>
                }
              />
              <Route
                path="/document-manager"
                element={
                  <RequireRole allowedRoles={["admin", "staff"]}>
                    <DocumentManager />
                  </RequireRole>
                }
              />
              <Route
                path="/windows"
                element={
                  <RequireRole allowedRoles={["admin", "staff"]}>
                    <Windows />
                  </RequireRole>
                }
              />
              <Route
                path="/all-request"
                element={
                  <RequireRole allowedRoles={["admin", "staff"]}>
                    <AllRequest />
                  </RequireRole>
                }
              />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
