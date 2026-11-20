import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import AppLayout from "./components/layout/AppLayout";
import RequireAuth from "./components/guards/RequireAuth";
import RequireRole from "./components/guards/RequireRole";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import { AuthProvider } from "./provider/AuthProvider";
import { SystemSettingsProvider } from "./provider/SystemSettingsProvider";
import { ThemeProvider } from "./provider/ThemeProvider";
import { RequestWizardProvider } from "./provider/WizardRequestProvider";
import { SectorsVisibilityProvider } from "./provider/SectorsVisibilityProvider";
import {
  ADMIN_ROLES,
  canAccessAccounts,
  REQUESTER_ROLES,
  STAFF_ROLES,
} from "./lib/navigation/role-access";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Accounts = lazy(() => import("./pages/Accounts"));
const DocumentManager = lazy(() => import("./pages/DocumentManager"));
const AllRequest = lazy(() => import("./pages/AllRequest"));
const AssignedRequests = lazy(() => import("./pages/AssignedRequests"));
const NewRequest = lazy(() => import("./pages/NewRequest"));
const MyRequest = lazy(() => import("./pages/MyRequest"));
const Logs = lazy(() => import("./pages/Logs"));
const Notifications = lazy(() => import("./pages/Notifications"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const SectorPage = lazy(() => import("./pages/SectorPage"));
const SectorRequestReview = lazy(() => import("./pages/SectorRequestReview"));
const ClaimVerification = lazy(() => import("./pages/ClaimVerification"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
      <SystemSettingsProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <Routes>
              <Route
                element={
                  <RequireAuth>
                    <SectorsVisibilityProvider>
                      <AppLayout />
                    </SectorsVisibilityProvider>
                  </RequireAuth>
                }
              >
                <Route path="/home" element={<Home />} />

                <Route
                  path="/new-request/:id?"
                  element={
                    <RequireRole allowedRoles={REQUESTER_ROLES}>
                      <RequestWizardProvider>
                        <NewRequest />
                      </RequestWizardProvider>
                    </RequireRole>
                  }
                />
                <Route
                  path="/my-request"
                  element={
                    <RequireRole allowedRoles={REQUESTER_ROLES}>
                      <MyRequest />
                    </RequireRole>
                  }
                />
                <Route path="/notifications" element={<Notifications />} />
                <Route
                  path="/requests/claim"
                  element={
                    <RequireRole allowedRoles={STAFF_ROLES}>
                      <ClaimVerification />
                    </RequireRole>
                  }
                />
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
                    <RequireRole
                      allowedRoles={ADMIN_ROLES}
                      checkAccess={canAccessAccounts}
                    >
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
                  path="/requests/my"
                  element={<Navigate to="/my-request" replace />}
                />
                <Route
                  path="/requests/new"
                  element={<Navigate to="/new-request" replace />}
                />
                <Route
                  path="/documents"
                  element={<Navigate to="/document-manager" replace />}
                />
                <Route
                  path="/requests/assigned"
                  element={<Navigate to="/assigned-request" replace />}
                />
                <Route
                  path="/requests/all"
                  element={<Navigate to="/all-request" replace />}
                />
                <Route
                  path="/assigned-request"
                  element={
                    <RequireRole allowedRoles={STAFF_ROLES}>
                      <AssignedRequests />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
      </ThemeProvider>
      </SystemSettingsProvider>
    </AuthProvider>
  );
}
