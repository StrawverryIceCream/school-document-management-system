import { lazy, Suspense } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import AppLayout from "./components/layout/AppLayout";
import RequireAuth from "./components/guards/RequireAuth";
import RequireRole from "./components/guards/RequireRole";
import { AuthProvider } from "./provider/AuthProvider";
import { ThemeProvider } from "./provider/ThemeProvider";
import { WindowViewProvider } from "./provider/WindowViewProvider";
import { RequestWizardProvider } from "./provider/WixardRequestProvider";
import type { UserRole } from "./types";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Accounts = lazy(() => import("./pages/Accounts"));
const DocumentManager = lazy(() => import("./pages/DocumentManager"));
const Windows = lazy(() => import("./pages/Windows"));
const AllRequest = lazy(() => import("./pages/AllRequest"));
const NewRequest = lazy(() => import("./pages/NewRequest"));
const MyRequest = lazy(() => import("./pages/MyRequest"));
const Logs = lazy(() => import("./pages/Logs"));
const Notifications = lazy(() => import("./pages/Notifications"));
const HumanResource = lazy(() => import("./pages/HumanResource"));
const Administration = lazy(() => import("./pages/Administration"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const WindowRequestReview = lazy(() => import("./pages/WindowRequestReview"));

const STAFF_ROLES: UserRole[] = ["admin", "staff"];
const ADMIN_ROLES: UserRole[] = ["admin"];

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route
                element={
                  <RequireAuth>
                    <AppLayout />
                  </RequireAuth>
                }
              >
                <Route path="/home" element={<Home />} />

                <Route
                  path="/new-request/:id?"
                  element={
                    <RequestWizardProvider>
                      <NewRequest />
                    </RequestWizardProvider>
                  }
                />
                <Route path="/my-request" element={<MyRequest />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireRole allowedRoles={STAFF_ROLES}>
                      <Dashboard />
                    </RequireRole>
                  }
                />
                <Route
                  path="/accounts"
                  element={
                    <RequireRole allowedRoles={ADMIN_ROLES}>
                      <Accounts />
                    </RequireRole>
                  }
                />
                <Route
                  path="/document-manager"
                  element={
                    <RequireRole allowedRoles={STAFF_ROLES}>
                      <DocumentManager />
                    </RequireRole>
                  }
                />
                <Route
                  path="/windows"
                  element={
                    <RequireRole allowedRoles={STAFF_ROLES}>
                      <WindowViewProvider>
                        <Outlet />
                      </WindowViewProvider>
                    </RequireRole>
                  }
                >
                  <Route index element={<Windows />} />
                  <Route path=":collegeId" element={<Windows />} />
                  <Route
                    path=":collegeId/requests/:requestId"
                    element={<WindowRequestReview />}
                  />
                </Route>
                <Route
                  path="/administration"
                  element={
                    <RequireRole allowedRoles={STAFF_ROLES}>
                      <Administration />
                    </RequireRole>
                  }
                />
                <Route
                  path="/human-resource"
                  element={
                    <RequireRole allowedRoles={STAFF_ROLES}>
                      <HumanResource />
                    </RequireRole>
                  }
                />
                <Route
                  path="/all-request"
                  element={
                    <RequireRole allowedRoles={STAFF_ROLES}>
                      <AllRequest />
                    </RequireRole>
                  }
                />
                <Route
                  path="/logs"
                  element={
                    <RequireRole allowedRoles={ADMIN_ROLES}>
                      <Logs />
                    </RequireRole>
                  }
                />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/" element={<LandingPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
