import { useEffect, useMemo, useState } from "react";

import {
  Check,
  ChevronDown,
  ChevronRight,
  FileCode2,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  X
} from "lucide-react";

import { api } from "../../../api/client";

import {
  ForgeButton,
  ForgeEmptyState,
  ForgeLoading,
  ForgeMetric,
  InfoRow,
  PageHeader
} from "../components/ForgeShared";

const EMPTY_CASE = {
  name: "",
  input: "",
  expected: "",
  category: "general",
  language: "",
  position: 0,
  enabled: true,
  dataset_record_index: ""
};

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatScore(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${Number(value).toFixed(2)}%`;
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";

  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];

  let value = Number(bytes);
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function getLanguage(path = "") {
  const extension =
    path.split(".").pop()?.toLowerCase();

  const map = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    h: "c",
    hpp: "cpp",
    go: "go",
    rs: "rust",
    rb: "ruby",
    php: "php",
    sql: "sql",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    html: "html",
    css: "css",
    md: "markdown"
  };

  return map[extension] || extension || "";
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  return [];
}

export default function Evaluations({ project }) {
  const [suites, setSuites] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [files, setFiles] = useState([]);

  const [selectedSuiteId, setSelectedSuiteId] =
    useState(null);

  const [selectedSuite, setSelectedSuite] =
    useState(null);

  const [cases, setCases] = useState([]);
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] =
    useState(null);

  const [results, setResults] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingDetails, setLoadingDetails] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [creatingCase, setCreatingCase] =
    useState(false);

  const [savingSuite, setSavingSuite] =
    useState(false);

  const [running, setRunning] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [newName, setNewName] =
    useState("");

  const [showCreateCase, setShowCreateCase] =
    useState(false);

  const [showSuiteConfig, setShowSuiteConfig] =
    useState(false);

  const [showRuns, setShowRuns] =
    useState(false);

  const [showResults, setShowResults] =
    useState(true);

  const [caseForm, setCaseForm] =
    useState(EMPTY_CASE);

  const [suiteForm, setSuiteForm] =
    useState({
      description: "",
      category: "general",
      dataset_id: "",
      dataset_version: "",
      target_file_ids: [],
      temperature: "0.2"
    });

  const [regressionBaseline, setRegressionBaseline] =
    useState("");

  const [regressionCandidate, setRegressionCandidate] =
    useState("");

  const [regression, setRegression] =
    useState(null);

  const [regressing, setRegressing] =
    useState(false);

  /*
   * =========================================================
   * LOAD REGISTRY
   * =========================================================
   */

  async function loadRegistry() {
    if (!project?.id) return;

    setLoading(true);
    setError("");

    try {
      const [
        suitesData,
        datasetsData,
        filesData
      ] = await Promise.all([
        api.evaluations.suites(project.id),
        api.datasets.list(project.id),
        api.projects.files.list(project.id)
      ]);

      const nextSuites =
        normalizeArray(suitesData);

      setSuites(nextSuites);
      setDatasets(
        normalizeArray(datasetsData)
      );

      setFiles(
        normalizeArray(filesData).filter(
          (file) => !file.is_binary
        )
      );

      if (nextSuites.length === 0) {
        setSelectedSuiteId(null);
        setSelectedSuite(null);
      } else {
        const stillExists =
          nextSuites.some(
            (suite) =>
              suite.id === selectedSuiteId
          );

        if (!stillExists) {
          setSelectedSuiteId(
            nextSuites[0].id
          );
        }
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load evaluation workspace."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRegistry();
  }, [project?.id]);

  /*
   * =========================================================
   * LOAD SUITE
   * =========================================================
   */

  async function loadSuite(suiteId) {
    if (!suiteId) return;

    setLoadingDetails(true);
    setError("");
    setSuccess("");
    setSelectedRun(null);
    setResults([]);
    setRegression(null);

    try {
      const [
        suiteData,
        casesData,
        runsData
      ] = await Promise.all([
        api.evaluations.getSuite(
          suiteId
        ),
        api.evaluations.cases(
          suiteId
        ),
        api.evaluations.runs(
          project.id,
          suiteId
        )
      ]);

      setSelectedSuite(suiteData);
      setCases(
        normalizeArray(casesData)
      );
      setRuns(
        normalizeArray(runsData)
      );

      setSuiteForm({
        description:
          suiteData.description || "",
        category:
          suiteData.category || "general",
        dataset_id:
          suiteData.dataset_id
            ? String(suiteData.dataset_id)
            : "",
        dataset_version:
          suiteData.dataset_version
            ? String(
                suiteData.dataset_version
              )
            : "",
        target_file_ids:
          normalizeArray(
            suiteData.target_files
          ).map(
            (target) =>
              target.project_file_id
          ),
        temperature:
          String(
            suiteData.configuration
              ?.temperature ??
              0.2
          )
      });

      if (runsData?.length) {
        const latest =
          normalizeArray(runsData)[0];

        setSelectedRun(latest);
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load evaluation suite."
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  useEffect(() => {
    if (!selectedSuiteId) return;

    loadSuite(selectedSuiteId);
  }, [selectedSuiteId]);

  /*
   * =========================================================
   * CREATE SUITE
   * =========================================================
   */

  async function createSuite(event) {
    event.preventDefault();

    if (
      !newName.trim() ||
      !project?.id
    ) {
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const suite =
        await api.evaluations.createSuite(
          project.id,
          {
            name: newName.trim(),
            description:
              "N-ATLAS evaluation suite",
            category: "general",
            configuration: {
              temperature: 0.2
            }
          }
        );

      setSuites((current) => [
        suite,
        ...current
      ]);

      setNewName("");
      setSelectedSuiteId(suite.id);
      setSuccess("Evaluation suite created.");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to create suite."
      );
    } finally {
      setCreating(false);
    }
  }

  /*
   * =========================================================
   * SAVE SUITE CONFIGURATION
   * =========================================================
   */

  async function saveSuite() {
    if (!selectedSuite?.id) return;

    setSavingSuite(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        description:
          suiteForm.description.trim() ||
          null,
        category:
          suiteForm.category.trim() ||
          "general",
        dataset_id:
          suiteForm.dataset_id
            ? Number(
                suiteForm.dataset_id
              )
            : undefined,
        dataset_version:
          suiteForm.dataset_version
            ? Number(
                suiteForm.dataset_version
              )
            : undefined,
        target_file_ids:
          suiteForm.target_file_ids,
        configuration: {
          ...(selectedSuite.configuration ||
            {}),
          temperature:
            Number(
              suiteForm.temperature
            )
        }
      };

      const updated =
        await api.evaluations.updateSuite(
          selectedSuite.id,
          payload
        );

      setSelectedSuite(updated);

      setSuites((current) =>
        current.map((suite) =>
          suite.id === updated.id
            ? updated
            : suite
        )
      );

      setSuccess(
        "Evaluation configuration saved."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save suite configuration."
      );
    } finally {
      setSavingSuite(false);
    }
  }

  /*
   * =========================================================
   * CASES
   * =========================================================
   */

  function updateCaseField(field, value) {
    setCaseForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function createCase(event) {
    event.preventDefault();

    if (
      !selectedSuite?.id ||
      !caseForm.name.trim() ||
      !caseForm.input.trim()
    ) {
      return;
    }

    setCreatingCase(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...caseForm,
        name: caseForm.name.trim(),
        input: caseForm.input,
        expected:
          caseForm.expected.trim() ||
          null,
        category:
          caseForm.category.trim() ||
          "general",
        language:
          caseForm.language.trim(),
        position: Number(
          caseForm.position || cases.length
        ),
        enabled: Boolean(
          caseForm.enabled
        ),
        dataset_record_index:
          caseForm.dataset_record_index === ""
            ? null
            : Number(
                caseForm.dataset_record_index
              )
      };

      const created =
        await api.evaluations.createCase(
          selectedSuite.id,
          payload
        );

      setCases((current) => [
        ...current,
        created
      ]);

      setCaseForm({
        ...EMPTY_CASE,
        position: cases.length + 1
      });

      setShowCreateCase(false);

      setSuccess("Test case added.");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to create test case."
      );
    } finally {
      setCreatingCase(false);
    }
  }

  async function deleteCase(testCase) {
    if (!testCase?.id) return;

    setError("");
    setSuccess("");

    try {
      await api.evaluations.deleteCase(
        testCase.id
      );

      setCases((current) =>
        current.filter(
          (item) =>
            item.id !== testCase.id
        )
      );

      setSuccess("Test case removed.");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to delete test case."
      );
    }
  }

  /*
   * =========================================================
   * TARGET FILES
   * =========================================================
   */

  function toggleTargetFile(fileId) {
    setSuiteForm((current) => {
      const exists =
        current.target_file_ids.includes(
          fileId
        );

      return {
        ...current,
        target_file_ids: exists
          ? current.target_file_ids.filter(
              (id) => id !== fileId
            )
          : [
              ...current.target_file_ids,
              fileId
            ]
      };
    });
  }

  /*
   * =========================================================
   * DATASET VERSIONS
   * =========================================================
   */

  const selectedDataset = useMemo(
    () =>
      datasets.find(
        (dataset) =>
          String(dataset.id) ===
          String(
            suiteForm.dataset_id
          )
      ),
    [
      datasets,
      suiteForm.dataset_id
    ]
  );

  const availableDatasetVersions =
    selectedDataset?.versions ||
    [];

  /*
   * =========================================================
   * RUN SUITE
   * =========================================================
   */

  async function runSuite() {
    if (
      !project?.id ||
      !selectedSuite?.id
    ) {
      return;
    }

    if (cases.length === 0) {
      setError(
        "Add at least one test case before running this suite."
      );
      return;
    }

    setRunning(true);
    setError("");
    setSuccess("");
    setSelectedRun(null);
    setResults([]);

    try {
      const run =
        await api.evaluations.run(
          project.id,
          selectedSuite.id,
          {
            model_name:
              project.natlas_model ||
              "n-atlas",
            temperature:
              Number(
                suiteForm.temperature
              )
          }
        );

      setSelectedRun(run);

      setSuccess(
        `Evaluation completed with a ${formatScore(
          run.score
        )} score.`
      );

      await loadSuite(
        selectedSuite.id
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to run evaluation."
      );
    } finally {
      setRunning(false);
    }
  }

  /*
   * =========================================================
   * RUN DETAILS
   * =========================================================
   */

  async function openRun(run) {
    if (!run?.id) return;

    setSelectedRun(run);
    setError("");

    try {
      const data =
        await api.evaluations.results(
          run.id
        );

      setResults(
        normalizeArray(
          data?.results || data
        )
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load evaluation results."
      );
    }
  }

  /*
   * =========================================================
   * DELETE SUITE
   * =========================================================
   */

  async function deleteSuite() {
    if (!selectedSuite?.id) return;

    const confirmed =
      window.confirm(
        `Delete "${selectedSuite.name}"? This cannot be undone.`
      );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await api.evaluations.deleteSuite(
        selectedSuite.id
      );

      const remaining =
        suites.filter(
          (suite) =>
            suite.id !==
            selectedSuite.id
        );

      setSuites(remaining);

      if (remaining.length) {
        setSelectedSuiteId(
          remaining[0].id
        );
      } else {
        setSelectedSuiteId(null);
        setSelectedSuite(null);
      }

      setSuccess("Evaluation suite deleted.");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to delete suite."
      );
    } finally {
      setDeleting(false);
    }
  }

  /*
   * =========================================================
   * REGRESSION
   * =========================================================
   */

  async function compareRuns() {
    if (
      !regressionBaseline ||
      !regressionCandidate ||
      !project?.id
    ) {
      return;
    }

    setRegressing(true);
    setError("");
    setRegression(null);

    try {
      const data =
        await api.evaluations.regression(
          project.id,
          {
            baseline_run_id:
              Number(
                regressionBaseline
              ),
            candidate_run_id:
              Number(
                regressionCandidate
              )
          }
        );

      setRegression(data);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to compare evaluation runs."
      );
    } finally {
      setRegressing(false);
    }
  }

  /*
   * =========================================================
   * EMPTY / LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div>
        <PageHeader
          eyebrow="04 / Evaluation Lab"
          title="Measure, don't guess."
          description="Repeatable suites turn model behavior into engineering evidence."
        />

        <ForgeLoading label="READING EVALUATION REGISTRY..." />
      </div>
    );
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="04 / Evaluation Lab"
        title="Measure, don't guess."
        description="Build repeatable evaluation suites, connect datasets and code targets, then turn every run into engineering evidence."
        action={
          <ForgeButton
            onClick={loadRegistry}
          >
            <RefreshCw size={14} />
            Refresh
          </ForgeButton>
        }
      />

      {/* =====================================================
          CREATE SUITE
      ===================================================== */}

      <form
        onSubmit={createSuite}
        className="flex flex-col gap-2 border border-[#2C3240] bg-[#11151E] p-2 sm:flex-row"
      >
        <input
          value={newName}
          onChange={(event) =>
            setNewName(
              event.target.value
            )
          }
          placeholder="Name a new evaluation suite..."
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[#E1E4EA] outline-none placeholder:text-[#596174]"
        />

        <ForgeButton
          type="submit"
          disabled={
            creating ||
            !newName.trim()
          }
        >
          {creating ? (
            <Loader2
              size={15}
              className="animate-spin"
            />
          ) : (
            <Plus size={15} />
          )}

          Create suite
        </ForgeButton>
      </form>

      {/* =====================================================
          STATUS
      ===================================================== */}

      {error && (
        <div className="mt-6 flex items-start gap-3 border border-[#49323A] bg-[#21191E] px-4 py-3 text-sm text-[#C88B91]">
          <X
            size={15}
            className="mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-start gap-3 border border-[#304436] bg-[#18221B] px-4 py-3 text-sm text-[#8EB49A]">
          <Check
            size={15}
            className="mt-0.5 shrink-0"
          />
          <span>{success}</span>
        </div>
      )}

      {suites.length === 0 ? (
        <div className="mt-10">
          <ForgeEmptyState
            eyebrow="SUITE REGISTRY EMPTY"
            title="Create your first test suite."
            description="Start with a focused set of cases around the behavior your application needs."
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* =================================================
              SUITE REGISTRY
          ================================================= */}

          <aside className="border border-[#2C3240] bg-[#11151E]">
            <div className="border-b border-[#2C3240] px-5 py-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#596174]">
                Suite Registry
              </div>

              <div className="mt-2 font-mono text-[9px] text-[#414858]">
                {suites.length} suite
                {suites.length === 1
                  ? ""
                  : "s"}
              </div>
            </div>

            <div className="divide-y divide-[#2C3240]">
              {suites.map((suite) => {
                const active =
                  suite.id ===
                  selectedSuiteId;

                return (
                  <button
                    key={suite.id}
                    type="button"
                    onClick={() =>
                      setSelectedSuiteId(
                        suite.id
                      )
                    }
                    className={`flex w-full items-start gap-3 px-5 py-4 text-left transition ${
                      active
                        ? "bg-[#191E2A]"
                        : "hover:bg-[#151922]"
                    }`}
                  >
                    <div
                      className={`mt-1 h-1.5 w-1.5 shrink-0 ${
                        active
                          ? "bg-[#7181FF]"
                          : "bg-[#414858]"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-[#D7DAE2]">
                        {suite.name}
                      </div>

                      <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
                        {suite.category ||
                          "GENERAL"}
                      </div>
                    </div>

                    <ChevronRight
                      size={13}
                      className={
                        active
                          ? "text-[#7181FF]"
                          : "text-[#414858]"
                      }
                    />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* =================================================
              SUITE WORKSPACE
          ================================================= */}

          <main className="min-w-0">
            {loadingDetails ? (
              <ForgeLoading label="LOADING SUITE..." />
            ) : !selectedSuite ? (
              <ForgeEmptyState
                eyebrow="NO SUITE SELECTED"
                title="Select an evaluation suite."
                description="Choose a suite from the registry to configure cases, datasets, code targets and evaluation runs."
              />
            ) : (
              <>
                {/* ===========================================
                    SUITE HEADER
                =========================================== */}

                <div className="border border-[#2C3240] bg-[#151922]">
                  <div className="flex flex-col gap-6 border-b border-[#2C3240] p-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#596174]">
                        Evaluation Suite
                      </div>

                      <h2 className="mt-3 break-words font-display text-3xl font-semibold tracking-[-0.05em] text-[#E1E4EA]">
                        {selectedSuite.name}
                      </h2>

                      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#697183]">
                        {selectedSuite.description ||
                          "No suite description configured."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <ForgeButton
                        onClick={runSuite}
                        disabled={
                          running ||
                          cases.length === 0
                        }
                      >
                        {running ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <Play size={14} />
                        )}

                        {running
                          ? "Running..."
                          : "Run suite"}
                      </ForgeButton>

                      <ForgeButton
                        danger
                        onClick={deleteSuite}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={14} />
                        )}

                        Delete
                      </ForgeButton>
                    </div>
                  </div>

                  {/* =========================================
                      METRICS
                  ========================================= */}

                  <div className="grid grid-cols-2 border-b border-[#2C3240] sm:grid-cols-4">
                    <ForgeMetric
                      label="Test Cases"
                      value={cases.length}
                      detail="configured"
                    />

                    <ForgeMetric
                      label="Targets"
                      value={
                        suiteForm
                          .target_file_ids
                          .length
                      }
                      detail="source files"
                    />

                    <ForgeMetric
                      label="Runs"
                      value={runs.length}
                      detail="recorded"
                    />

                    <ForgeMetric
                      label="Latest Score"
                      value={formatScore(
                        selectedSuite.last_run
                          ?.score
                      )}
                      detail={
                        selectedSuite.last_run
                          ? "latest run"
                          : "no run yet"
                      }
                    />
                  </div>

                  {/* =========================================
                      CONFIGURATION
                  ========================================= */}

                  <div className="border-b border-[#2C3240]">
                    <button
                      type="button"
                      onClick={() =>
                        setShowSuiteConfig(
                          (value) => !value
                        )
                      }
                      className="flex w-full items-center justify-between px-6 py-5 text-left"
                    >
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#596174]">
                          Suite Configuration
                        </div>

                        <div className="mt-2 text-sm text-[#AEB5C5]">
                          Dataset, version, code targets and model settings
                        </div>
                      </div>

                      <ChevronDown
                        size={15}
                        className={`text-[#596174] transition ${
                          showSuiteConfig
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {showSuiteConfig && (
                      <div className="border-t border-[#2C3240] p-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                          <label>
                            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                              Description
                            </span>

                            <textarea
                              value={
                                suiteForm.description
                              }
                              onChange={(event) =>
                                setSuiteForm(
                                  (current) => ({
                                    ...current,
                                    description:
                                      event.target
                                        .value
                                  })
                                )
                              }
                              rows={4}
                              className="mt-2 w-full resize-none border border-[#303746] bg-[#11151E] px-3 py-3 text-sm text-[#C2C6D0] outline-none focus:border-[#41496A]"
                            />
                          </label>

                          <div className="space-y-5">
                            <label className="block">
                              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                                Category
                              </span>

                              <input
                                value={
                                  suiteForm.category
                                }
                                onChange={(event) =>
                                  setSuiteForm(
                                    (current) => ({
                                      ...current,
                                      category:
                                        event.target
                                          .value
                                    })
                                  )
                                }
                                className="mt-2 w-full border border-[#303746] bg-[#11151E] px-3 py-3 text-sm text-[#C2C6D0] outline-none focus:border-[#41496A]"
                              />
                            </label>

                            <label className="block">
                              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                                Temperature
                              </span>

                              <input
                                type="number"
                                min="0"
                                max="2"
                                step="0.1"
                                value={
                                  suiteForm.temperature
                                }
                                onChange={(event) =>
                                  setSuiteForm(
                                    (current) => ({
                                      ...current,
                                      temperature:
                                        event.target
                                          .value
                                    })
                                  )
                                }
                                className="mt-2 w-full border border-[#303746] bg-[#11151E] px-3 py-3 text-sm text-[#C2C6D0] outline-none focus:border-[#41496A]"
                              />
                            </label>
                          </div>
                        </div>

                        {/* DATASET */}

                        <div className="mt-8 border-t border-[#2C3240] pt-7">
                          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#596174]">
                            Dataset
                          </div>

                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <label>
                              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                                Dataset
                              </span>

                              <select
                                value={
                                  suiteForm.dataset_id
                                }
                                onChange={(event) =>
                                  setSuiteForm(
                                    (current) => ({
                                      ...current,
                                      dataset_id:
                                        event.target
                                          .value,
                                      dataset_version:
                                        ""
                                    })
                                  )
                                }
                                className="mt-2 w-full border border-[#303746] bg-[#11151E] px-3 py-3 text-xs text-[#C2C6D0] outline-none focus:border-[#41496A]"
                              >
                                <option value="">
                                  No dataset
                                </option>

                                {datasets.map(
                                  (dataset) => (
                                    <option
                                      key={
                                        dataset.id
                                      }
                                      value={
                                        dataset.id
                                      }
                                    >
                                      {dataset.name}
                                    </option>
                                  )
                                )}
                              </select>
                            </label>

                            <label>
                              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                                Dataset Version
                              </span>

                              <select
                                value={
                                  suiteForm.dataset_version
                                }
                                onChange={(event) =>
                                  setSuiteForm(
                                    (current) => ({
                                      ...current,
                                      dataset_version:
                                        event.target
                                          .value
                                    })
                                  )
                                }
                                disabled={
                                  !suiteForm.dataset_id
                                }
                                className="mt-2 w-full border border-[#303746] bg-[#11151E] px-3 py-3 text-xs text-[#C2C6D0] outline-none disabled:opacity-40 focus:border-[#41496A]"
                              >
                                <option value="">
                                  Latest version
                                </option>

                                {availableDatasetVersions.map(
                                  (version) => (
                                    <option
                                      key={
                                        version.id
                                      }
                                      value={
                                        version.version
                                      }
                                    >
                                      v
                                      {
                                        version.version
                                      }{" "}
                                      ·{" "}
                                      {
                                        version.record_count
                                      }{" "}
                                      records
                                    </option>
                                  )
                                )}
                              </select>
                            </label>
                          </div>

                          {selectedDataset && (
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                              <InfoRow
                                label="Format"
                                value={
                                  selectedDataset.format
                                }
                              />

                              <InfoRow
                                label="Records"
                                value={
                                  selectedDataset.record_count
                                }
                              />

                              <InfoRow
                                label="Size"
                                value={formatBytes(
                                  selectedDataset.size_bytes
                                )}
                              />
                            </div>
                          )}
                        </div>

                        {/* TARGET FILES */}

                        <div className="mt-8 border-t border-[#2C3240] pt-7">
                          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                            <div>
                              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#596174]">
                                Codebase Targets
                              </div>

                              <p className="mt-2 text-xs leading-5 text-[#697183]">
                                Snapshot the files this evaluation is intended to track.
                              </p>
                            </div>

                            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#596174]">
                              {
                                suiteForm
                                  .target_file_ids
                                  .length
                              }{" "}
                              selected
                            </div>
                          </div>

                          <div className="mt-4 max-h-72 overflow-y-auto border border-[#303746]">
                            {files.length === 0 ? (
                              <div className="p-5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#596174]">
                                No project files available.
                              </div>
                            ) : (
                              files.map(
                                (file) => {
                                  const checked =
                                    suiteForm.target_file_ids.includes(
                                      file.id
                                    );

                                  return (
                                    <button
                                      type="button"
                                      key={
                                        file.id
                                      }
                                      onClick={() =>
                                        toggleTargetFile(
                                          file.id
                                        )
                                      }
                                      className={`flex w-full items-center gap-3 border-b border-[#252B36] px-4 py-3 text-left last:border-b-0 ${
                                        checked
                                          ? "bg-[#1A1F2C]"
                                          : "bg-[#11151E] hover:bg-[#151922]"
                                      }`}
                                    >
                                      <div
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                                          checked
                                            ? "border-[#7181FF] bg-[#7181FF] text-white"
                                            : "border-[#414858]"
                                        }`}
                                      >
                                        {checked && (
                                          <Check
                                            size={
                                              11
                                            }
                                          />
                                        )}
                                      </div>

                                      <FileCode2
                                        size={
                                          14
                                        }
                                        className="shrink-0 text-[#596174]"
                                      />

                                      <div className="min-w-0 flex-1">
                                        <div className="truncate font-mono text-[10px] text-[#AEB5C5]">
                                          {
                                            file.path
                                          }
                                        </div>

                                        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#414858]">
                                          {file.language ||
                                            getLanguage(
                                              file.path
                                            )}
                                        </div>
                                      </div>
                                    </button>
                                  );
                                }
                              )
                            )}
                          </div>
                        </div>

                        <div className="mt-7 flex justify-end">
                          <ForgeButton
                            onClick={
                              saveSuite
                            }
                            disabled={
                              savingSuite
                            }
                          >
                            {savingSuite ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Check
                                size={14}
                              />
                            )}

                            Save configuration
                          </ForgeButton>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* =========================================
                      CASES
                  ========================================= */}

                  <div className="border-b border-[#2C3240]">
                    <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#596174]">
                          Test Cases
                        </div>

                        <div className="mt-2 text-sm text-[#AEB5C5]">
                          Inputs and expected behavior evaluated against N-ATLAS.
                        </div>
                      </div>

                      <ForgeButton
                        onClick={() => {
                          setCaseForm({
                            ...EMPTY_CASE,
                            position:
                              cases.length
                          });

                          setShowCreateCase(
                            true
                          );
                        }}
                      >
                        <Plus size={14} />
                        Add case
                      </ForgeButton>
                    </div>

                    {showCreateCase && (
                      <form
                        onSubmit={
                          createCase
                        }
                        className="border-t border-[#2C3240] bg-[#11151E] p-6"
                      >
                        <div className="grid gap-5 lg:grid-cols-2">
                          <label>
                            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                              Case name
                            </span>

                            <input
                              value={
                                caseForm.name
                              }
                              onChange={(event) =>
                                updateCaseField(
                                  "name",
                                  event.target
                                    .value
                                )
                              }
                              placeholder="e.g. Summarize a support request"
                              className="mt-2 w-full border border-[#303746] bg-[#151922] px-3 py-3 text-sm text-[#C2C6D0] outline-none focus:border-[#41496A]"
                            />
                          </label>

                          <label>
                            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                              Category
                            </span>

                            <input
                              value={
                                caseForm.category
                              }
                              onChange={(event) =>
                                updateCaseField(
                                  "category",
                                  event.target
                                    .value
                                )
                              }
                              className="mt-2 w-full border border-[#303746] bg-[#151922] px-3 py-3 text-sm text-[#C2C6D0] outline-none focus:border-[#41496A]"
                            />
                          </label>

                          <label className="lg:col-span-2">
                            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                              Input
                            </span>

                            <textarea
                              value={
                                caseForm.input
                              }
                              onChange={(event) =>
                                updateCaseField(
                                  "input",
                                  event.target
                                    .value
                                )
                              }
                              rows={5}
                              placeholder="What should N-ATLAS receive?"
                              className="mt-2 w-full resize-y border border-[#303746] bg-[#151922] px-3 py-3 text-sm leading-6 text-[#C2C6D0] outline-none focus:border-[#41496A]"
                            />
                          </label>

                          <label className="lg:col-span-2">
                            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                              Expected output
                            </span>

                            <textarea
                              value={
                                caseForm.expected
                              }
                              onChange={(event) =>
                                updateCaseField(
                                  "expected",
                                  event.target
                                    .value
                                )
                              }
                              rows={5}
                              placeholder="What should a successful response look like?"
                              className="mt-2 w-full resize-y border border-[#303746] bg-[#151922] px-3 py-3 text-sm leading-6 text-[#C2C6D0] outline-none focus:border-[#41496A]"
                            />
                          </label>

                          <label>
                            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                              Language
                            </span>

                            <input
                              value={
                                caseForm.language
                              }
                              onChange={(event) =>
                                updateCaseField(
                                  "language",
                                  event.target
                                    .value
                                )
                              }
                              placeholder="optional"
                              className="mt-2 w-full border border-[#303746] bg-[#151922] px-3 py-3 text-sm text-[#C2C6D0] outline-none focus:border-[#41496A]"
                            />
                          </label>

                          <label>
                            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                              Dataset record index
                            </span>

                            <input
                              type="number"
                              min="0"
                              value={
                                caseForm.dataset_record_index
                              }
                              onChange={(event) =>
                                updateCaseField(
                                  "dataset_record_index",
                                  event.target
                                    .value
                                )
                              }
                              placeholder="optional"
                              className="mt-2 w-full border border-[#303746] bg-[#151922] px-3 py-3 text-sm text-[#C2C6D0] outline-none focus:border-[#41496A]"
                            />
                          </label>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setShowCreateCase(
                                false
                              )
                            }
                            className="border border-[#303746] bg-[#151922] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#697183] hover:text-[#AEB5C5]"
                          >
                            Cancel
                          </button>

                          <ForgeButton
                            type="submit"
                            disabled={
                              creatingCase ||
                              !caseForm.name.trim() ||
                              !caseForm.input.trim()
                            }
                          >
                            {creatingCase ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Plus
                                size={14}
                              />
                            )}

                            Add test case
                          </ForgeButton>
                        </div>
                      </form>
                    )}

                    {cases.length === 0 ? (
                      <div className="border-t border-[#2C3240] p-6">
                        <ForgeEmptyState
                          eyebrow="NO TEST CASES"
                          title="This suite has nothing to run."
                          description="Add at least one test case before starting an evaluation run."
                          action="Add test case"
                          onAction={() => {
                            setCaseForm({
                              ...EMPTY_CASE,
                              position:
                                cases.length
                            });

                            setShowCreateCase(
                              true
                            );
                          }}
                        />
                      </div>
                    ) : (
                      <div className="divide-y divide-[#2C3240]">
                        {cases.map(
                          (
                            testCase,
                            index
                          ) => (
                            <div
                              key={
                                testCase.id
                              }
                              className="flex gap-4 px-6 py-5"
                            >
                              <div className="w-7 shrink-0 font-mono text-[9px] text-[#414858]">
                                {String(
                                  index + 1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="text-sm font-medium text-[#D7DAE2]">
                                    {
                                      testCase.name
                                    }
                                  </div>

                                  {!testCase.enabled && (
                                    <span className="border border-[#3A3035] px-2 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-[#697183]">
                                      Disabled
                                    </span>
                                  )}

                                  <span className="border border-[#303746] px-2 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-[#596174]">
                                    {
                                      testCase.category ||
                                      "GENERAL"
                                    }
                                  </span>
                                </div>

                                <div className="mt-3 max-w-3xl whitespace-pre-wrap text-xs leading-6 text-[#858D9D]">
                                  {
                                    testCase.input
                                  }
                                </div>

                                {testCase.dataset_record_index !==
                                  null &&
                                  testCase.dataset_record_index !==
                                    undefined && (
                                    <div className="mt-3 font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
                                      Dataset record #
                                      {
                                        testCase.dataset_record_index
                                      }
                                    </div>
                                  )}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteCase(
                                    testCase
                                  )
                                }
                                className="h-8 w-8 shrink-0 self-start border border-[#303746] bg-[#11151E] text-[#596174] transition hover:border-[#59343B] hover:text-[#C88B91]"
                              >
                                <Trash2
                                  size={13}
                                  className="mx-auto"
                                />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* =========================================
                      RUN HISTORY
                  ========================================= */}

                  <div className="border-b border-[#2C3240]">
                    <button
                      type="button"
                      onClick={() =>
                        setShowRuns(
                          (value) => !value
                        )
                      }
                      className="flex w-full items-center justify-between px-6 py-5 text-left"
                    >
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#596174]">
                          Run History
                        </div>

                        <div className="mt-2 text-sm text-[#AEB5C5]">
                          Every completed evaluation remains traceable.
                        </div>
                      </div>

                      <ChevronDown
                        size={15}
                        className={`text-[#596174] transition ${
                          showRuns
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {showRuns && (
                      <div className="border-t border-[#2C3240]">
                        {runs.length === 0 ? (
                          <div className="p-6 font-mono text-[9px] uppercase tracking-[0.14em] text-[#596174]">
                            No evaluation runs yet.
                          </div>
                        ) : (
                          <div className="divide-y divide-[#2C3240]">
                            {runs.map(
                              (run) => {
                                const active =
                                  selectedRun?.id ===
                                  run.id;

                                return (
                                  <button
                                    key={
                                      run.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      openRun(
                                        run
                                      )
                                    }
                                    className={`flex w-full flex-col gap-4 px-6 py-5 text-left transition sm:flex-row sm:items-center ${
                                      active
                                        ? "bg-[#191E2A]"
                                        : "hover:bg-[#151922]"
                                    }`}
                                  >
                                    <div className="min-w-0 flex-1">
                                      <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#596174]">
                                        Run #
                                        {
                                          run.id
                                        }
                                      </div>

                                      <div className="mt-2 text-xs text-[#858D9D]">
                                        {formatDate(
                                          run.created_at
                                        )}
                                      </div>
                                    </div>

                                    <div className="font-mono text-[9px] text-[#697183]">
                                      {
                                        run.passed_tests
                                      }{" "}
                                      /{" "}
                                      {
                                        run.total_tests
                                      }{" "}
                                      passed
                                    </div>

                                    <div
                                      className={`font-display text-lg font-semibold ${
                                        Number(
                                          run.score
                                        ) < 70
                                          ? "text-[#C06C76]"
                                          : "text-[#E1E4EA]"
                                      }`}
                                    >
                                      {formatScore(
                                        run.score
                                      )}
                                    </div>
                                  </button>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* =========================================
                      RESULTS
                  ========================================= */}

                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setShowResults(
                          (value) => !value
                        )
                      }
                      className="flex w-full items-center justify-between px-6 py-5 text-left"
                    >
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#596174]">
                          Results
                        </div>

                        <div className="mt-2 text-sm text-[#AEB5C5]">
                          Inspect actual output, expected behavior and failures.
                        </div>
                      </div>

                      <ChevronDown
                        size={15}
                        className={`text-[#596174] transition ${
                          showResults
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {showResults && (
                      <div className="border-t border-[#2C3240]">
                        {!selectedRun ? (
                          <div className="p-6 font-mono text-[9px] uppercase tracking-[0.14em] text-[#596174]">
                            Run the suite or select a previous run to inspect results.
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 border-b border-[#2C3240] sm:grid-cols-4">
                              <ForgeMetric
                                label="Score"
                                value={formatScore(
                                  selectedRun.score
                                )}
                              />

                              <ForgeMetric
                                label="Passed"
                                value={
                                  selectedRun.passed_tests
                                }
                              />

                              <ForgeMetric
                                label="Failed"
                                value={
                                  selectedRun.failed_tests
                                }
                                danger={
                                  Number(
                                    selectedRun.failed_tests
                                  ) > 0
                                }
                              />

                              <ForgeMetric
                                label="Tests"
                                value={
                                  selectedRun.total_tests
                                }
                              />
                            </div>

                            <div className="divide-y divide-[#2C3240]">
                              {results.length ===
                              0 ? (
                                <div className="p-6 font-mono text-[9px] uppercase tracking-[0.14em] text-[#596174]">
                                  Loading run results...
                                </div>
                              ) : (
                                results.map(
                                  (
                                    result,
                                    index
                                  ) => (
                                    <div
                                      key={
                                        result.id ||
                                        result.case_id ||
                                        index
                                      }
                                      className="p-6"
                                    >
                                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            {result.passed ? (
                                              <Check
                                                size={
                                                  14
                                                }
                                                className="text-[#8EB49A]"
                                              />
                                            ) : (
                                              <X
                                                size={
                                                  14
                                                }
                                                className="text-[#C88B91]"
                                              />
                                            )}

                                            <span className="text-sm font-medium text-[#D7DAE2]">
                                              {result.case_name ||
                                                `Case ${
                                                  index +
                                                  1
                                                }`}
                                            </span>
                                          </div>

                                          <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.1em] text-[#596174]">
                                            {result.category ||
                                              "GENERAL"}{" "}
                                            ·{" "}
                                            {result.language ||
                                              "UNKNOWN"}
                                          </div>
                                        </div>

                                        <div className="flex gap-5 font-mono text-[8px] uppercase tracking-[0.1em] text-[#596174]">
                                          <span>
                                            Similarity{" "}
                                            {formatScore(
                                              result.similarity_score
                                            )}
                                          </span>

                                          <span>
                                            {result.latency_ms ??
                                              "—"}
                                            ms
                                          </span>
                                        </div>
                                      </div>

                                      <div className="mt-6 grid gap-5 lg:grid-cols-2">
                                        <div>
                                          <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#596174]">
                                            Expected
                                          </div>

                                          <div className="mt-2 whitespace-pre-wrap border border-[#303746] bg-[#11151E] p-4 text-xs leading-6 text-[#858D9D]">
                                            {result.expected ||
                                              "—"}
                                          </div>
                                        </div>

                                        <div>
                                          <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#596174]">
                                            Actual
                                          </div>

                                          <div className="mt-2 whitespace-pre-wrap border border-[#303746] bg-[#11151E] p-4 text-xs leading-6 text-[#C2C6D0]">
                                            {result.actual ||
                                              "—"}
                                          </div>
                                        </div>
                                      </div>

                                      {!result.passed &&
                                        result.failure_reasons && (
                                          <div className="mt-5 border border-[#49323A] bg-[#21191E] p-4">
                                            <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#C88B91]">
                                              Failure
                                            </div>

                                            <div className="mt-2 whitespace-pre-wrap text-xs leading-6 text-[#C2C6D0]">
                                              {Array.isArray(
                                                result.failure_reasons
                                              )
                                                ? result.failure_reasons.join(
                                                    "\n"
                                                  )
                                                : result.failure_reasons}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  )
                                )
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* =========================================
                      REGRESSION
                  ========================================= */}

                  {runs.length >= 2 && (
                    <div className="border-t border-[#2C3240]">
                      <div className="p-6">
                        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#596174]">
                          Regression Analysis
                        </div>

                        <p className="mt-2 text-xs leading-5 text-[#697183]">
                          Compare two recorded runs to identify regressions and improvements.
                        </p>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <label>
                            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                              Baseline
                            </span>

                            <select
                              value={
                                regressionBaseline
                              }
                              onChange={(event) =>
                                setRegressionBaseline(
                                  event.target
                                    .value
                                )
                              }
                              className="mt-2 w-full border border-[#303746] bg-[#11151E] px-3 py-3 text-xs text-[#C2C6D0] outline-none focus:border-[#41496A]"
                            >
                              <option value="">
                                Select baseline run
                              </option>

                              {runs.map(
                                (run) => (
                                  <option
                                    key={
                                      `baseline-${run.id}`
                                    }
                                    value={
                                      run.id
                                    }
                                  >
                                    Run #
                                    {
                                      run.id
                                    }{" "}
                                    ·{" "}
                                    {formatScore(
                                      run.score
                                    )}
                                  </option>
                                )
                              )}
                            </select>
                          </label>

                          <label>
                            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                              Candidate
                            </span>

                            <select
                              value={
                                regressionCandidate
                              }
                              onChange={(event) =>
                                setRegressionCandidate(
                                  event.target
                                    .value
                                )
                              }
                              className="mt-2 w-full border border-[#303746] bg-[#11151E] px-3 py-3 text-xs text-[#C2C6D0] outline-none focus:border-[#41496A]"
                            >
                              <option value="">
                                Select candidate run
                              </option>

                              {runs.map(
                                (run) => (
                                  <option
                                    key={
                                      `candidate-${run.id}`
                                    }
                                    value={
                                      run.id
                                    }
                                  >
                                    Run #
                                    {
                                      run.id
                                    }{" "}
                                    ·{" "}
                                    {formatScore(
                                      run.score
                                    )}
                                  </option>
                                )
                              )}
                            </select>
                          </label>
                        </div>

                        <div className="mt-5">
                          <ForgeButton
                            onClick={
                              compareRuns
                            }
                            disabled={
                              regressing ||
                              !regressionBaseline ||
                              !regressionCandidate ||
                              regressionBaseline ===
                                regressionCandidate
                            }
                          >
                            {regressing ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Play
                                size={14}
                              />
                            )}

                            Compare runs
                          </ForgeButton>
                        </div>

                        {regression && (
                          <div className="mt-6 border border-[#303746] bg-[#11151E]">
                            <div className="grid grid-cols-2 border-b border-[#2C3240] sm:grid-cols-4">
                              <ForgeMetric
                                label="Baseline"
                                value={formatScore(
                                  regression.baseline_score
                                )}
                              />

                              <ForgeMetric
                                label="Candidate"
                                value={formatScore(
                                  regression.candidate_score
                                )}
                              />

                              <ForgeMetric
                                label="Score Change"
                                value={`${Number(
                                  regression.score_change ||
                                    0
                                ) >= 0
                                  ? "+"
                                  : ""}${Number(
                                  regression.score_change ||
                                    0
                                ).toFixed(2)}%`}
                                danger={
                                  Number(
                                    regression.score_change ||
                                      0
                                  ) < 0
                                }
                              />

                              <ForgeMetric
                                label="Regressions"
                                value={
                                  normalizeArray(
                                    regression.regressions
                                  ).length
                                }
                                danger={
                                  normalizeArray(
                                    regression.regressions
                                  ).length >
                                  0
                                }
                              />
                            </div>

                            <div className="grid gap-6 p-6 md:grid-cols-3">
                              <div>
                                <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#C88B91]">
                                  Regressions
                                </div>

                                <div className="mt-3 space-y-2">
                                  {normalizeArray(
                                    regression.regressions
                                  ).length ===
                                  0 ? (
                                    <div className="font-mono text-[9px] text-[#596174]">
                                      None
                                    </div>
                                  ) : (
                                    normalizeArray(
                                      regression.regressions
                                    ).map(
                                      (
                                        item,
                                        index
                                      ) => (
                                        <div
                                          key={
                                            index
                                          }
                                          className="border border-[#49323A] bg-[#21191E] p-3 text-xs text-[#C2C6D0]"
                                        >
                                          {item.case_name ||
                                            item.case_id ||
                                            `Case ${
                                              index +
                                              1
                                            }`}
                                        </div>
                                      )
                                    )
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#8EB49A]">
                                  Improvements
                                </div>

                                <div className="mt-3 space-y-2">
                                  {normalizeArray(
                                    regression.improvements
                                  ).length ===
                                  0 ? (
                                    <div className="font-mono text-[9px] text-[#596174]">
                                      None
                                    </div>
                                  ) : (
                                    normalizeArray(
                                      regression.improvements
                                    ).map(
                                      (
                                        item,
                                        index
                                      ) => (
                                        <div
                                          key={
                                            index
                                          }
                                          className="border border-[#304436] bg-[#18221B] p-3 text-xs text-[#C2C6D0]"
                                        >
                                          {item.case_name ||
                                            item.case_id ||
                                            `Case ${
                                              index +
                                              1
                                            }`}
                                        </div>
                                      )
                                    )
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#697183]">
                                  Unchanged
                                </div>

                                <div className="mt-3 font-display text-2xl font-semibold text-[#E1E4EA]">
                                  {
                                    normalizeArray(
                                      regression.unchanged
                                    ).length
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}