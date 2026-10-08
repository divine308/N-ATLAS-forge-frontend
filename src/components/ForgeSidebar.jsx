import { useState } from "react";
import {
  Activity,
  Code2,
  Database,
  FlaskConical,
  FolderOpen,
  GitCompareArrows,
  LogOut,
  Menu,
  Play,
  Settings2,
  TerminalSquare,
  TestTube2,
  X
} from "lucide-react";
import {
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";

const items = [
  {
    id: "overview",
    label: "Overview",
    icon: TerminalSquare
  },
  {
    id: "code",
    label: "Code",
    icon: Code2
  },
  {
    id: "playground",
    label: "Playground",
    icon: Play
  },
  {
    id: "crash",
    label: "Crash Test",
    icon: TestTube2
  },
  {
    id: "datasets",
    label: "Datasets",
    icon: Database
  },
  {
    id: "evaluations",
    label: "Evaluation",
    icon: FlaskConical
  },
  {
    id: "failures",
    label: "Failures",
    icon: Activity
  },
  {
    id: "compare",
    label: "Compare",
    icon: GitCompareArrows
  },
  {
    id: "sdk",
    label: "Ship",
    icon: Code2
  }
];

export default function ForgeSidebar({
  active,
  setActive,
  project,
  onLogout
}) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [, setSearchParams] = useSearchParams();

  const [mobileOpen, setMobileOpen] = useState(false);

  /*
   * Change Forge section while preserving the CURRENT project.
   *
   * Example:
   *
   * /projects/123/forge?section=overview
   *
   * becomes
   *
   * /projects/123/forge?section=playground
   *
   * NEVER another project.
   */
  function handleWorkspaceNavigation(id) {
    if (!projectId) {
      if (id === "overview") {
        setMobileOpen(false);
        navigate("/projects");
      }

      return;
    }

    /*
     * Update the URL directly so the project ID remains
     * part of the route.
     */
    setSearchParams({
      section: id
    });

    /*
     * Keep the parent's active state in sync if Forge
     * provides setActive.
     */
    if (typeof setActive === "function") {
      setActive(id);
    }

    /*
     * Close the mobile drawer after selecting a section.
     */
    setMobileOpen(false);
  }

  function handleProjectsNavigation() {
    setMobileOpen(false);
    navigate("/projects");
  }

  return (
    <>
      {/* =====================================================
          MOBILE MENU BUTTON
      ===================================================== */}

      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#353C4A] bg-[#151922] text-[#AEB5C5] shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition hover:border-[#4A536A] hover:bg-[#1C222D] hover:text-[#E1E4EA] md:hidden"
        >
          <Menu
            size={18}
            strokeWidth={1.6}
          />
        </button>
      )}

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed left-0 top-0 z-[80] flex h-[100dvh] w-[270px] max-w-[86vw] shrink-0 flex-col border-r border-[#2C3240] bg-[#151922] shadow-[20px_0_50px_rgba(0,0,0,0.3)] transition-transform duration-200 ease-out md:static md:z-auto md:h-screen md:w-[238px] md:max-w-none md:translate-x-0 md:shadow-none ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* ===================================================
            BRAND
        =================================================== */}

        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[#2C3240] px-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#353C4A] bg-[#151922] font-mono text-[10px] font-semibold tracking-[0.08em] text-[#8C9AFF]">
            NF
          </div>

          <div className="min-w-0 flex-1 pl-4 pt-16 md:pl-0 md:pt-0">
            <div className="font-display text-sm font-bold tracking-[-0.03em] text-[#E1E4EA]">
              N-ATLAS
            </div>

            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
              Forge
            </div>
          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-transparent text-[#697183] transition hover:border-[#353C4A] hover:bg-[#1C222D] hover:text-[#D5D8E0] md:hidden"
          >
            <X
              size={17}
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* ===================================================
            ACTIVE PROJECT
        =================================================== */}

        <div className="shrink-0 border-b border-[#2C3240] px-5 py-5">
          <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#697183]">
            Active project
          </div>

          <div className="mt-2 truncate text-sm text-[#AEB5C5]">
            {project?.name || "All Projects"}
          </div>
        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5">
          {/* Return to project index */}
          <button
            type="button"
            onClick={handleProjectsNavigation}
            className={`group mb-5 flex w-full items-center gap-3 border px-3 py-2.5 text-left font-mono text-[11px] transition ${
              !projectId
                ? "border-[#41496A] bg-[#252B43] text-[#EEF0FF]"
                : "border-transparent text-[#697183] hover:border-[#303746] hover:bg-[#181D27] hover:text-[#D5D8E0]"
            }`}
          >
            <FolderOpen
              size={15}
              strokeWidth={1.5}
              className={
                !projectId
                  ? "text-[#7888FF]"
                  : "text-[#596174] group-hover:text-[#778093]"
              }
            />

            <span>Projects</span>

            {!projectId && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#7181FF] shadow-[0_0_8px_rgba(113,129,255,0.65)]" />
            )}
          </button>

          <div className="mb-3 px-2 font-mono text-[8px] uppercase tracking-[0.18em] text-[#697183]">
            Workspace
          </div>

          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const selected = active === item.id;

              /*
               * On /projects there is no project.
               *
               * Overview is still useful because it returns
               * to /projects.
               *
               * Other Forge sections require a project.
               */
              const disabled =
                !projectId &&
                item.id !== "overview";

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    handleWorkspaceNavigation(
                      item.id
                    )
                  }
                  className={`group flex w-full items-center gap-3 border px-3 py-2.5 text-left font-mono text-[11px] transition ${
                    disabled
                      ? "cursor-not-allowed border-transparent text-[#414856] opacity-50"
                      : selected
                        ? "border-[#41496A] bg-[#252B43] text-[#EEF0FF]"
                        : "border-transparent text-[#858D9D] hover:border-[#303746] hover:bg-[#181D27] hover:text-[#D5D8E0]"
                  }`}
                >
                  <Icon
                    size={15}
                    strokeWidth={1.5}
                    className={
                      disabled
                        ? "text-[#414856]"
                        : selected
                          ? "text-[#7888FF]"
                          : "text-[#596174] group-hover:text-[#778093]"
                    }
                  />

                  <span>{item.label}</span>

                  {selected && !disabled && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#7181FF] shadow-[0_0_8px_rgba(113,129,255,0.65)]" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ===================================================
            BOTTOM CONTROLS
        =================================================== */}

        <div className="shrink-0 border-t border-[#2C3240] bg-[#151922] px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
         <button
  type="button"
  onClick={() => {
    if (!projectId) {
      return;
    }

    setSearchParams({
      section: "configuration"
    });

    if (typeof setActive === "function") {
      setActive("configuration");
    }

    setMobileOpen(false);
  }}
  disabled={!projectId}
  className={`group flex w-full items-center gap-3 border px-3 py-2.5 font-mono text-[11px] transition ${
    !projectId
      ? "cursor-not-allowed border-transparent text-[#414856] opacity-50"
      : active === "configuration"
        ? "border-[#41496A] bg-[#252B43] text-[#EEF0FF]"
        : "border-transparent text-[#697183] hover:border-[#303746] hover:bg-[#181D27] hover:text-[#AEB5C5]"
  }`}
>
  <Settings2
    size={15}
    strokeWidth={1.5}
    className={
      !projectId
        ? "text-[#414856]"
        : active === "configuration"
          ? "text-[#7888FF]"
          : "text-[#596174] group-hover:text-[#778093]"
    }
  />

  <span>Configuration</span>

  {active === "configuration" && projectId && (
    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#7181FF] shadow-[0_0_8px_rgba(113,129,255,0.65)]" />
  )}
</button>

          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);

              if (typeof onLogout === "function") {
                onLogout();
              }
            }}
            className="group flex w-full items-center gap-3 border border-transparent px-3 py-2.5 font-mono text-[11px] text-[#697183] transition hover:border-[#3F3035] hover:bg-[#181D27] hover:text-[#C88B91]"
          >
            <LogOut
              size={15}
              strokeWidth={1.5}
              className="text-[#596174] group-hover:text-[#C06C76]"
            />

            <span>Disconnect</span>
          </button>
        </div>
      </aside>
    </>
  );
}