import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Boxes,
  Plus,
  RefreshCw,
  Trash2,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client";
import Signal from "../components/Signal";
import EmptyState from "../components/EmptyState";
import ForgeSidebar from "../components/ForgeSidebar";

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const [deletingProject, setDeletingProject] =
    useState(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    description: ""
  });

  async function loadProjects() {
    setLoading(true);
    setError("");

    try {
      const data = await api.projects.list();

      setProjects(
        Array.isArray(data)
          ? data
          : data.projects || []
      );
    } catch (err) {
      setError(
        err?.message || "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function createProject(event) {
    event.preventDefault();

    setError("");

    try {
      const project = await api.projects.create(form);

      setProjects((current) => [
        project,
        ...current
      ]);

      setForm({
        name: "",
        description: ""
      });

      setShowCreate(false);

      /*
       * Immediately enter the project that was just created.
       * The project ID becomes persistent in the URL.
       */
      navigate(
        `/projects/${project.id}/forge?section=overview`
      );
    } catch (err) {
      setError(
        err?.message || "Unable to create project."
      );
    }
  }

  async function deleteProject() {
    if (!deletingProject?.id || deleteLoading) {
      return;
    }

    setDeleteLoading(true);
    setError("");

    try {
      await api.projects.delete(
        deletingProject.id
      );

      setProjects((current) =>
        current.filter(
          (project) =>
            project.id !== deletingProject.id
        )
      );

      setDeletingProject(null);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to delete project."
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  /*
   * The PROJECTS page is the project index.
   *
   * Overview/Command always returns here.
   *
   * We NEVER select the first project automatically.
   */
  function handleSidebarNavigation(id) {
    if (id === "overview") {
      navigate("/projects");
      return;
    }

    /*
     * There is no active project on this page.
     * The user must explicitly click a project card.
     */
  }

  return (
    <div className="h-screen overflow-hidden bg-[#151922] font-sans text-[#E6E8EF] selection:bg-[#7181FF] selection:text-white">
      <div className="noise" />

      <div className="relative flex h-screen min-h-0 w-full">
        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <ForgeSidebar
          active="overview"
          setActive={handleSidebarNavigation}
          project={null}
          onLogout={undefined}
        />

        {/* =====================================================
            MAIN WORKSPACE
        ===================================================== */}

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#151922]">
          {/* ===================================================
              TOP BAR
          =================================================== */}

          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-[#2C3240] bg-[#151922] px-5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#7181FF] shadow-[0_0_10px_rgba(113,129,255,0.8)]" />

              <div>
                <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#E6E8EF]">
                  Workspace
                </div>

                <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#6F7789]">
                  Project index / 001
                </div>
              </div>
            </div>

            <Signal
              active
              label="FORGE ONLINE"
            />
          </header>

          {/* ===================================================
              WORKSPACE CONTENT
          =================================================== */}

          <div className="w-full px-5 pb-20 pt-8 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1500px]">
              {/* =================================================
                  WORKSPACE HEADER
              ================================================= */}

              <section className="border-b border-[#303642] pb-10">
                <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                  <div className="min-w-0">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#6F7789]">
                        N-ATLAS / Forge
                      </span>

                      <span className="h-px w-8 bg-[#3B4251]" />

                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7181FF]">
                        Projects
                      </span>
                    </div>

                    <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.9] tracking-[-0.065em] text-[#F0F1F5] sm:text-6xl lg:text-7xl">
                      Build something
                      <br />
                      worth testing.
                    </h1>

                    <p className="mt-6 max-w-2xl text-sm leading-7 text-[#858D9D]">
                      N-ATLAS Forge is the laboratory around
                      the model — experiment, evaluate, expose
                      failure, compare versions and ship with
                      evidence.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="group flex h-10 shrink-0 items-center gap-2 self-start rounded-[2px] border border-[#454D61] bg-[#252B3B] px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#E7E9F0] transition hover:border-[#59637C] hover:bg-[#2A3144] lg:self-auto"
                  >
                    <Plus
                      size={14}
                      className="text-[#8492FF]"
                    />

                    New project

                    <ArrowUpRight
                      size={14}
                      className="text-[#77839B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </button>
                </div>
              </section>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="mt-8 border border-[#543B47] bg-[#211923] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#C89FAF]">
                  <span className="mr-3 text-[#AD6F8A]">
                    ERROR
                  </span>

                  {error}
                </div>
              )}

              {/* =================================================
                  PROJECT INDEX
              ================================================= */}

              <section className="mt-10">
                <div className="mb-5 flex items-center justify-between border-b border-[#2C3240] pb-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#858D9D]">
                      Project index
                    </div>

                    <span className="font-mono text-[9px] text-[#4E5667]">
                      /
                    </span>

                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6576F0]">
                      {projects.length}{" "}
                      {projects.length === 1
                        ? "project"
                        : "projects"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={loadProjects}
                    className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border border-[#343B49] bg-[#181D27] text-[#697183] transition hover:border-[#4A536A] hover:bg-[#202633] hover:text-[#AEB5C5]"
                    title="Refresh"
                  >
                    <RefreshCw
                      size={13}
                      className={
                        loading
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>
                </div>

                {/* LOADING */}

                {loading ? (
                  <div className="border border-[#303746] bg-[#151922]">
                    <div className="flex items-center gap-3 px-5 py-8 font-mono text-[10px] uppercase tracking-[0.12em] text-[#858D9D]">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#7181FF] shadow-[0_0_9px_rgba(113,129,255,0.7)]" />

                      Reading workspace...
                    </div>
                  </div>
                ) : projects.length === 0 ? (
                  /* EMPTY STATE */

                  <div className="overflow-hidden border border-[#303746] bg-[#151922]">
                    <div className="border-b border-[#2C3240] bg-[#151922] px-5 py-4">
                      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6F7789]">
                        Project index / empty
                      </div>
                    </div>

                    <div className="px-5 py-12 lg:px-8">
                      <EmptyState
                        eyebrow="PROJECT INDEX EMPTY"
                        title="Nothing has been forged yet."
                        description="Create your first project and connect it to the N-ATLAS evaluation workflow."
                        action="Create project"
                        onAction={() =>
                          setShowCreate(true)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  /* PROJECTS */

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {projects.map((project, index) => (
                      <div
                        key={project.id}
                        className="group relative min-h-[290px] overflow-hidden rounded-[3px] border border-[#303746] bg-[#151922] p-5 text-left shadow-[0_18px_50px_rgba(10,14,22,0.12)] transition duration-200 hover:border-[#4A536A] hover:bg-[#181D27]"
                      >
                        {/* TOP BAR */}

                        <div className="flex items-center justify-between border-b border-[#2C3240] pb-4">
                          <div className="flex items-center gap-2.5">
                            <span className="h-2 w-2 rounded-full bg-[#7181FF] shadow-[0_0_9px_rgba(113,129,255,0.7)]" />

                            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#D5D8E0]">
                              Project
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[9px] text-[#596174]">
                              {String(index + 1).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <button
                              type="button"
                              title="Delete project"
                              aria-label={`Delete ${project.name}`}
                              onClick={() =>
                                setDeletingProject(project)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-[2px] border border-transparent text-[#596174] transition hover:border-[#583B44] hover:bg-[#21191E] hover:text-[#C06C76]"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* PROJECT BODY */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/projects/${project.id}/forge?section=overview`
                            )
                          }
                          className="block w-full text-left"
                        >
                          <div className="mt-7">
                            <div className="flex items-center justify-between">
                              <div className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#363D4D] bg-[#181D27]">
                                <Boxes
                                  size={17}
                                  strokeWidth={1.5}
                                  className="text-[#8492FF]"
                                />
                              </div>

                              <ArrowUpRight
                                size={17}
                                className="text-[#596174] transition group-hover:text-[#AEB5C5]"
                              />
                            </div>

                            <h2 className="mt-7 truncate font-display text-2xl font-semibold tracking-[-0.05em] text-[#E1E4EA]">
                              {project.name}
                            </h2>

                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#858D9D]">
                              {project.description ||
                                "No project description."}
                            </p>
                          </div>
                        </button>

                        {/* BOTTOM STATUS */}

                        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between border-t border-[#2C3240] pt-4">
                          <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#697183]">
                            N-ATLAS / PROJECT
                          </span>

                          <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#8C9AFF]">
                            OPEN →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* =======================================================
          CREATE PROJECT MODAL
      ======================================================= */}

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080B10]/80 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[520px] overflow-hidden rounded-[3px] border border-[#353C4A] bg-[#151922] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[#2C3240] bg-[#151922] px-5 py-4">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#6F7789]">
                  Forge / Project
                </div>

                <div className="mt-1 font-mono text-[11px] text-[#E0E3EA]">
                  Initialize workspace
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="font-mono text-[10px] text-[#697183] transition hover:text-[#C0C5D0]"
              >
                ESC
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="p-6">
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#858D9D]">
                New project
              </div>

              <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-[#F0F1F5]">
                Initialize the forge.
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#858D9D]">
                Create a workspace for experimentation,
                evaluation and model testing.
              </p>

              <form
                onSubmit={createProject}
                className="mt-8 space-y-5"
              >
                <label className="block">
                  <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#778093]">
                    Project name
                  </span>

                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value
                      })
                    }
                    placeholder="e.g. Yoruba Tutor"
                    required
                    className="w-full rounded-[2px] border border-[#363D4D] bg-[#11151E] px-4 py-3 font-mono text-[11px] text-[#E0E3EA] outline-none placeholder:text-[#4F5768] transition focus:border-[#5865A0] focus:bg-[#151922]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#778093]">
                    Description
                  </span>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description:
                          e.target.value
                      })
                    }
                    placeholder="What are you building?"
                    rows={4}
                    className="w-full resize-none rounded-[2px] border border-[#363D4D] bg-[#11151E] px-4 py-3 font-mono text-[11px] leading-6 text-[#E0E3EA] outline-none placeholder:text-[#4F5768] transition focus:border-[#5865A0] focus:bg-[#151922]"
                  />
                </label>

                <div className="flex gap-3 border-t border-[#2C3240] pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setShowCreate(false)
                    }
                    className="flex h-10 flex-1 items-center justify-center rounded-[2px] border border-[#363D4D] bg-[#11151E] font-mono text-[9px] font-semibold uppercase tracking-[0.13em] text-[#858D9D] transition hover:border-[#4A536A] hover:bg-[#181D27] hover:text-[#C7CBD4]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="group flex h-10 flex-1 items-center justify-center gap-2 rounded-[2px] border border-[#4D587D] bg-[#252B43] font-mono text-[9px] font-semibold uppercase tracking-[0.13em] text-[#E8EAFF] transition hover:border-[#6574A5] hover:bg-[#2C3450]"
                  >
                    Create

                    <ArrowUpRight
                      size={14}
                      className="text-[#8492FF] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          DELETE PROJECT MODAL
      ======================================================= */}

      {deletingProject && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#080B10]/80 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[460px] overflow-hidden rounded-[3px] border border-[#49343B] bg-[#151922] shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[#2C3240] px-5 py-4">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#C06C76]">
                  Forge / Destructive action
                </div>

                <div className="mt-1 font-mono text-[11px] text-[#E0E3EA]">
                  Delete project
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!deleteLoading) {
                    setDeletingProject(null);
                  }
                }}
                disabled={deleteLoading}
                className="flex h-7 w-7 items-center justify-center text-[#697183] transition hover:text-[#C0C5D0] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[#583B44] bg-[#21191E] text-[#C06C76]">
                <Trash2 size={17} />
              </div>

              <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.04em] text-[#F0F1F5]">
                Delete this project?
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#858D9D]">
                You are about to permanently delete{" "}
                <span className="font-semibold text-[#C9CDD6]">
                  {deletingProject.name}
                </span>
                . This action cannot be undone.
              </p>

              <div className="mt-5 border border-[#49343B] bg-[#21191E] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[#A97883]">
                Project data and associated records may
                also be removed.
              </div>

              <div className="mt-6 flex gap-3 border-t border-[#2C3240] pt-5">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() =>
                    setDeletingProject(null)
                  }
                  className="flex h-10 flex-1 items-center justify-center rounded-[2px] border border-[#363D4D] bg-[#11151E] font-mono text-[9px] font-semibold uppercase tracking-[0.13em] text-[#858D9D] transition hover:border-[#4A536A] hover:bg-[#181D27] hover:text-[#C7CBD4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={deleteProject}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[2px] border border-[#70434D] bg-[#2A1C21] font-mono text-[9px] font-semibold uppercase tracking-[0.13em] text-[#E0A6AE] transition hover:border-[#925662] hover:bg-[#332126] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <>
                      <RefreshCw
                        size={13}
                        className="animate-spin"
                      />
                      Deleting
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      Delete project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}