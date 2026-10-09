import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import AppLayout from "./components/layout/AppLayout";
import Signup from "./pages/Signup";
import { ThemeProvider } from "./provider/ThemeProvider";
import { AuthProvider } from "./provider/AuthProvider";
import { ProfileProvider } from "./provider/ProfileProvider";
import { WindowViewProvider } from "./provider/WindowViewProvider";
import RequireAuth from "./components/RequireAuth";
import Accounts from "./pages/Accounts";
import RequireRole from "./components/RequireRole";
import DocumentManager from "./pages/DocumentManager";
import Windows from "./pages/Windows";
import AllRequest from "./pages/AllRequest";
import NewRequest from "./pages/NewRequest";
import MyRequest from "./pages/MyRequest";
import { Toaster } from "sonner";
import { DocumentProvider } from "./provider/DocumentProvider";
import { RequestProvider } from "./provider/RequestProvider";
import Logs from "./pages/Logs";
import Notifications from "./pages/Notifications";
import HumanResource from "./pages/HumanResource";
import Administration from "./pages/Administration";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <DocumentProvider>
          <RequestProvider>
            <ProfileProvider>
              <Toaster />
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
                    <Route path="/new-request/:id?" element={<NewRequest />} />
                    <Route path="/my-request" element={<MyRequest />} />
                    <Route path="/notifications" element={<Notifications />} />
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
                          <WindowViewProvider>
                            <Windows />
                          </WindowViewProvider>
                        </RequireRole>
                      }
                    />
                    <Route
                      path="/administration"
                      element={
                        <RequireRole allowedRoles={["admin", "staff"]}>
                          <Administration />
                        </RequireRole>
                      }
                    />
                    <Route
                      path="/human-resource"
                      element={
                        <RequireRole allowedRoles={["admin", "staff"]}>
                          <HumanResource />
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

                    <Route
                      path="/logs"
                      element={
                        <RequireRole allowedRoles={["admin"]}>
                          <Logs />
                        </RequireRole>
                      }
                    />
                  </Route>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Routes>
              </BrowserRouter>
            </ProfileProvider>
          </RequestProvider>
        </DocumentProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
