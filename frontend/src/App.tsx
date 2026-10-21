import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import AppLayout from "./components/layout/AppLayout";
import RequireAuth from "./components/guards/RequireAuth";
import RequireRole from "./components/guards/RequireRole";
import { AuthProvider } from "./provider/AuthProvider";
import { ThemeProvider } from "./provider/ThemeProvider";
import { RequestWizardProvider } from "./provider/WixardRequestProvider";
import type { UserRole } from "./types";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Accounts = lazy(() => import("./pages/Accounts"));
const DocumentManager = lazy(() => import("./pages/DocumentManager"));
const AllRequest = lazy(() => import("./pages/AllRequest"));
const NewRequest = lazy(() => import("./pages/NewRequest"));
const MyRequest = lazy(() => import("./pages/MyRequest"));
const Logs = lazy(() => import("./pages/Logs"));
const Notifications = lazy(() => import("./pages/Notifications"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const SectorPage = lazy(() => import("./pages/SectorPage"));
const SectorRequestReview = lazy(() => import("./pages/SectorRequestReview"));

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
                {/* Sector & Office Workspace Routes */}
                <Route
                  path="/sectors/:sectorId/:divisionId?/:officeId?"
                  element={
                    <RequireRole allowedRoles={STAFF_ROLES}>
                      <SectorPage />
                    </RequireRole>
                  }
                />
                <Route
                  path="/sectors/:sectorId/:divisionId/:officeId/requests/:requestId"
                  element={
                    <RequireRole allowedRoles={STAFF_ROLES}>
                      <SectorRequestReview />
                    </RequireRole>
                  }
                />

                {/* Legacy Workspace Route Redirects */}
                <Route
                  path="/windows"
                  element={<Navigate to="/sectors/ovpaa/colleges" replace />}
                />
                <Route
                  path="/windows/:collegeId"
                  element={<Navigate to="/sectors/ovpaa/colleges" replace />}
                />
                <Route
                  path="/windows/:collegeId/requests/:requestId"
                  element={<Navigate to="/sectors/ovpaa/colleges" replace />}
                />
                <Route
                  path="/administration"
                  element={<Navigate to="/sectors/oup/governance" replace />}
                />
                <Route
                  path="/human-resource"
                  element={<Navigate to="/sectors/ovpaf/admin-services/hrmo" replace />}
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
