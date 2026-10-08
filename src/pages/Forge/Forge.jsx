
import { useEffect, useState } from "react";

import {
  Loader2,
  X
} from "lucide-react";

import {
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";

import ForgeSidebar from "../../components/ForgeSidebar";
import { api } from "../../api/client";

import Overview from "./sections/Overview";
import CodeWorkspace from "./sections/CodeWorkspace";
import Playground from "./sections/Playground";
import CrashTest from "./sections/CrashTest";
import Datasets from "./sections/Datasets";
import Evaluations from "./sections/Evaluations";
import Failures from "./sections/Failures";
import Compare from "./sections/Compare";
import SDK from "./sections/SDK";
import Configuration from "./sections/Configuration";

const tabs = [
  "overview",
  "code",
  "playground",
  "crash",
  "datasets",
  "evaluations",
  "failures",
  "compare",
  "sdk",
  "configuration"
];

export default function Forge() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const sectionFromUrl =
    searchParams.get("section") || "overview";

  const [active, setActiveState] =
    useState(
      tabs.includes(sectionFromUrl)
        ? sectionFromUrl
        : "overview"
    );

  const [project, setProject] =
    useState(null);

  const [health, setHealth] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  function setActive(section) {
    const nextSection = tabs.includes(section)
      ? section
      : "overview";

    if (nextSection === "overview") {
      navigate("/projects");
      return;
    }

    if (!projectId) {
      navigate("/projects");
      return;
    }

    setActiveState(nextSection);

    setSearchParams({
      section: nextSection
    });
  }

  useEffect(() => {
    const section =
      searchParams.get("section") ||
      "overview";

    setActiveState(
      tabs.includes(section)
        ? section
        : "overview"
    );
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!projectId) {
        setProject(null);
        setHealth(null);
        setError(
          "No project was supplied to Forge."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [projectData, healthData] =
          await Promise.all([
            api.projects.get(projectId),
            api.health()
          ]);

        if (cancelled) return;

        setProject(projectData);
        setHealth(healthData);
      } catch (err) {
        if (cancelled) return;

        setError(
          err?.message ||
            "Unable to load this Forge project."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  function handleSidebarNavigation(section) {
    setActive(section);
  }

  function handleProjectUpdated(updatedProject) {
    if (!updatedProject) return;

    setProject(updatedProject);
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-[#151922] text-[#E1E4EA]">
        <ForgeSidebar
          active={active}
          setActive={handleSidebarNavigation}
          project={null}
        />

        <main className="min-w-0 flex-1 overflow-y-auto bg-[#151922]">
          <div className="flex min-h-full items-center justify-center">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#697183]">
              <Loader2
                size={14}
                className="animate-spin text-[#7181FF]"
              />
              Initializing Forge
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-[#151922] text-[#E1E4EA]">
      <ForgeSidebar
        active={active}
        setActive={handleSidebarNavigation}
        project={project}
      />

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#151922]">
        <div className="mx-auto w-full max-w-[1500px] px-5 pb-20 pt-7 sm:px-6 lg:px-8 xl:px-10">
          {error && (
            <div className="mb-7 flex items-start justify-between gap-4 border border-[#49323A] bg-[#21191E] px-4 py-3 text-sm text-[#C88B91]">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 text-[#8C626A] hover:text-[#C88B91]"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {active === "overview" && (
            <Overview
              project={project}
              health={health}
              setActive={setActive}
            />
          )}

          {active === "code" && (
            <CodeWorkspace
              project={project}
              onProjectUpdated={
                handleProjectUpdated
              }
            />
          )}

          {active === "playground" && (
            <Playground project={project} />
          )}

          {active === "crash" && (
            <CrashTest project={project} />
          )}

          {active === "datasets" && (
            <Datasets project={project} />
          )}

          {active === "evaluations" && (
            <Evaluations project={project} />
          )}

          {active === "failures" && (
            <Failures project={project} />
          )}

          {active === "compare" && (
            <Compare project={project} />
          )}

          {active === "sdk" && (
            <SDK project={project} />
          )}

          {active === "configuration" && (
            <Configuration
              project={project}
              onProjectUpdated={
                handleProjectUpdated
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}