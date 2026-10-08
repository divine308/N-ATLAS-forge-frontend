import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./pages/Projects";
import Forge from "./pages/Forge/Forge";
import LandingPage from "./pages/LandingPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#151922]">
        <div className="loading-line">
          RESTORING SESSION...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/landingpage"
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route
        path="/landingpage"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =====================================================
          PROTECTED WORKSPACE
      ===================================================== */}

      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:projectId/forge"
        element={
          <ProtectedRoute>
            <Forge />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          DEFAULT ROUTE
      ===================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/projects"
            replace
          />
        }
      />

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/projects"
            replace
          />
        }
      />
    </Routes>
  );
}