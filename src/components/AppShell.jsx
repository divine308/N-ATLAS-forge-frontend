import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Command,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

import ForgeSidebar from "./ForgeSidebar";
import Signal from "./Signal";
import { useAuth } from "../context/AuthContext";

export default function AppShell({
  children,
  active,
  setActive,
  project,
  natlasOnline = false
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="forge-app">
      <div className="noise" />

      <header className="mobile-header">
        <button
          onClick={() => setMobileOpen(true)}
          className="icon-button"
        >
          <Menu size={19} />
        </button>

        <div className="font-display text-sm font-bold">
          N-ATLAS / FORGE
        </div>

        <Signal
          active={natlasOnline}
          label={natlasOnline ? "N-ATLAS" : "LOCAL"}
        />
      </header>

      {mobileOpen && (
        <div className="mobile-drawer">
          <div className="flex items-center justify-between border-b border-stone-800 p-5">
            <div className="font-display font-bold">
              N-ATLAS / FORGE
            </div>

            <button
              className="icon-button"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <ForgeSidebar
            active={active}
            setActive={(id) => {
              setActive(id);
              setMobileOpen(false);
            }}
            project={project}
            onLogout={handleLogout}
          />
        </div>
      )}

      <ForgeSidebar
        active={active}
        setActive={setActive}
        project={project}
        onLogout={handleLogout}
      />

      <main className="forge-main">
        <div className="forge-topbar">
          <button
            className="back-button"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft size={14} />
            Projects
          </button>

          <div className="topbar-center">
            <Command size={13} />

            <span>
              {project?.name || "N-ATLAS Forge"}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Signal
              active={natlasOnline}
              label={natlasOnline ? "N-ATLAS CONNECTED" : "DEV MODE"}
            />

            <span className="hidden font-mono text-[9px] tracking-[0.12em] text-stone-600 lg:block">
              CTRL / K
            </span>
          </div>
        </div>

        <div className="forge-content">
          {children}
        </div>
      </main>
    </div>
  );
}