import { useEffect, useMemo, useRef, useState } from "react";

import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

import {
  Check,
  Code2,
  Loader2,
  Upload,
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

export default function CodeWorkspace({
  project,
  onProjectUpdated
}) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] =
    useState(null);
  const [fileContent, setFileContent] =
    useState("");
  const [originalContent, setOriginalContent] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [loadingFile, setLoadingFile] =
    useState(false);
  const [saving, setSaving] =
    useState(false);
  const [importing, setImporting] =
    useState(false);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");
  const [importOpen, setImportOpen] =
    useState(false);
  const [githubUrl, setGithubUrl] =
    useState("");
  const [importMode, setImportMode] =
    useState("zip");
  const [importFile, setImportFile] =
    useState(null);
  const [importResult, setImportResult] =
    useState(null);

  const codePreRef = useRef(null);
  const codeTextareaRef = useRef(null);

  async function openFile(file) {
    if (!project?.id || !file?.id) {
      return;
    }

    if (
      selectedFile?.id === file.id &&
      fileContent !== undefined
    ) {
      return;
    }

    setLoadingFile(true);
    setError("");
    setSuccess("");

    try {
      const detail =
        await api.projects.files.get(
          project.id,
          file.id
        );

      setSelectedFile(file);

      setFileContent(
        detail?.content || ""
      );

      setOriginalContent(
        detail?.content || ""
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to open this file."
      );
    } finally {
      setLoadingFile(false);
    }
  }

  async function loadFiles(
    preserveSelection = true
  ) {
    if (!project?.id) return;

    setLoading(true);
    setError("");

    try {
      const data =
        await api.projects.files.list(
          project.id
        );

      const nextFiles = Array.isArray(data)
        ? data
        : data?.files || [];

      const sortedFiles = [
        ...nextFiles
      ].sort((a, b) =>
        String(a.path || "").localeCompare(
          String(b.path || "")
        )
      );

      setFiles(sortedFiles);

      if (
        preserveSelection &&
        selectedFile
      ) {
        const stillExists =
          sortedFiles.find(
            (file) =>
              String(file.id) ===
              String(selectedFile.id)
          );

        if (stillExists) {
          setSelectedFile(stillExists);
          return;
        }
      }

      if (sortedFiles.length > 0) {
        await openFile(sortedFiles[0]);
      } else {
        setSelectedFile(null);
        setFileContent("");
        setOriginalContent("");
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load project files."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      if (!project?.id) {
        setFiles([]);
        setSelectedFile(null);
        setFileContent("");
        setOriginalContent("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data =
          await api.projects.files.list(
            project.id
          );

        if (cancelled) return;

        const nextFiles = Array.isArray(data)
          ? data
          : data?.files || [];

        const sortedFiles = [
          ...nextFiles
        ].sort((a, b) =>
          String(a.path || "").localeCompare(
            String(b.path || "")
          )
        );

        setFiles(sortedFiles);

        if (sortedFiles.length > 0) {
          const first =
            await api.projects.files.get(
              project.id,
              sortedFiles[0].id
            );

          if (cancelled) return;

          setSelectedFile(
            sortedFiles[0]
          );

          setFileContent(
            first?.content || ""
          );

          setOriginalContent(
            first?.content || ""
          );
        } else {
          setSelectedFile(null);
          setFileContent("");
          setOriginalContent("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load project files."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, [project?.id]);

  async function saveFile() {
    if (
      !project?.id ||
      !selectedFile?.id ||
      saving
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated =
        await api.projects.files.update(
          project.id,
          selectedFile.id,
          {
            content: fileContent
          }
        );

      const updatedFile = {
        ...selectedFile,
        ...(updated || {}),
        size: new Blob([
          fileContent
        ]).size
      };

      setSelectedFile(updatedFile);
      setOriginalContent(fileContent);

      setFiles((current) =>
        current.map((file) =>
          String(file.id) ===
          String(selectedFile.id)
            ? updatedFile
            : file
        )
      );

      setSuccess("File saved.");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save this file."
      );
    } finally {
      setSaving(false);
    }
  }

  function closeImport() {
    if (importing) return;

    setImportOpen(false);
    setImportFile(null);
    setGithubUrl("");
    setImportMode("zip");
    setImportResult(null);
  }

  async function importProject() {
    if (!project?.id || importing) {
      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");
    setImportResult(null);

    try {
      let result;

      if (importMode === "zip") {
        if (!importFile) {
          throw new Error(
            "Select a ZIP project file first."
          );
        }

        result =
          await api.projects.files.importZip(
            project.id,
            importFile
          );
      } else {
        if (!githubUrl.trim()) {
          throw new Error(
            "Enter a public GitHub repository URL."
          );
        }

        result =
          await api.projects.files.importGithub(
            project.id,
            githubUrl.trim()
          );
      }

      setImportResult(result);

      await loadFiles(false);

      setSuccess(
        `${
          result?.files_imported ??
          "Project"
        } ${
          result?.files_imported != null
            ? "files imported."
            : "imported successfully."
        }`
      );

      setImportFile(null);
      setGithubUrl("");
    } catch (err) {
      setError(
        err?.message ||
          "Project import failed."
      );
    } finally {
      setImporting(false);
    }
  }

  const hasChanges =
    fileContent !== originalContent;

  const languages = Array.from(
    new Set(
      files
        .map((file) => file.language)
        .filter(Boolean)
    )
  );

  const highlightedCode = useMemo(() => {
    if (!fileContent) {
      return "";
    }

    const language =
      resolveHighlightLanguage(
        selectedFile?.language,
        selectedFile?.path
      );

    try {
      if (
        language &&
        hljs.getLanguage(language)
      ) {
        return hljs.highlight(
          fileContent,
          {
            language
          }
        ).value;
      }
    } catch (err) {
      console.error(
        "Highlighting failed:",
        err
      );
    }

    return escapeHtml(fileContent);
  }, [
    fileContent,
    selectedFile?.language,
    selectedFile?.path
  ]);

  function syncCodeScroll(event) {
    if (!codePreRef.current) {
      return;
    }

    codePreRef.current.scrollTop =
      event.currentTarget.scrollTop;

    codePreRef.current.scrollLeft =
      event.currentTarget.scrollLeft;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Code / Workspace"
        title="Your application."
        description="Bring the real codebase into Forge. Inspect source files, understand the project around N-ATLAS and make changes against the actual application."
        action={
          <ForgeButton
            onClick={() =>
              setImportOpen(true)
            }
          >
            <Upload size={15} />
            Import project
          </ForgeButton>
        }
      />

      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 border border-[#49323A] bg-[#21191E] px-4 py-3 text-sm text-[#C88B91]">
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

      {success && (
        <div className="mb-6 flex items-center gap-3 border border-[#303746] bg-[#11151E] px-4 py-3 text-sm text-[#8C9AFF]">
          <Check size={15} />
          {success}
        </div>
      )}

      {importResult && (
        <div className="mb-6 border border-[#303746] bg-[#11151E] p-5">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#697183]">
            Import analysis
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <InfoRow
              label="Files"
              value={
                importResult.files_imported ??
                "—"
              }
            />

            <InfoRow
              label="Source"
              value={
                importResult.source_type ||
                "—"
              }
            />

            <InfoRow
              label="Languages"
              value={
                importResult.detected_languages
                  ?.join(", ") || "—"
              }
            />
          </div>

          {Array.isArray(
            importResult.natlas_usage
          ) &&
            importResult.natlas_usage.length >
              0 && (
              <div className="mt-5 border-t border-[#2C3240] pt-5">
                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#697183]">
                  N-ATLAS usage detected
                </div>

                <div className="mt-3 space-y-2">
                  {importResult.natlas_usage
                    .slice(0, 12)
                    .map(
                      (usage, index) => (
                        <div
                          key={
                            usage.path ||
                            usage.file ||
                            index
                          }
                          className="flex flex-wrap gap-x-4 gap-y-1 border border-[#2C3240] px-3 py-3 text-xs text-[#858D9D]"
                        >
                          <span className="font-mono text-[#AEB5C5]">
                            {usage.path ||
                              usage.file ||
                              "Unknown file"}
                          </span>

                          {usage.symbol && (
                            <span>
                              {usage.symbol}
                            </span>
                          )}

                          {usage.type && (
                            <span className="font-mono text-[9px] uppercase text-[#596174]">
                              {usage.type}
                            </span>
                          )}
                        </div>
                      )
                    )}
                </div>
              </div>
            )}
        </div>
      )}

      {loading ? (
        <ForgeLoading label="INDEXING PROJECT FILES..." />
      ) : files.length === 0 ? (
        <div className="mt-10">
          <ForgeEmptyState
            eyebrow="CODEBASE EMPTY"
            title="Bring your application into Forge."
            description="Import a ZIP project or connect a public GitHub repository. Forge will store the actual source files so you can inspect and edit the real application."
            action="Import Project"
            onAction={() =>
              setImportOpen(true)
            }
          />
        </div>
      ) : (
        <>
          <div className="mb-5 grid border-y border-[#2C3240] md:grid-cols-3">
            <ForgeMetric
              label="Files"
              value={files.length}
              detail="IMPORTED"
            />

            <ForgeMetric
              label="Languages"
              value={languages.length}
              detail={
                languages.length > 0
                  ? languages
                      .slice(0, 3)
                      .join(" · ")
                  : "DETECTED"
              }
            />

            <ForgeMetric
              label="Project"
              value={
                project?.name || "Untitled"
              }
              detail="ACTIVE"
            />
          </div>

          <div className="grid min-h-[650px] overflow-hidden border border-[#2C3240] bg-[#151922] lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="min-h-0 border-b border-[#2C3240] lg:border-b-0 lg:border-r">
              <div className="flex h-12 items-center justify-between border-b border-[#2C3240] px-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#697183]">
                  Project files
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadFiles(true)
                  }
                  disabled={loading}
                  className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#596174] transition hover:text-[#AEB5C5]"
                >
                  Refresh
                </button>
              </div>

              <div className="max-h-[600px] overflow-y-auto p-2">
                {files.map((file) => {
                  const activeFile =
                    selectedFile?.id ===
                    file.id;

                  const depth =
                    String(file.path || "")
                      .split("/")
                      .length - 1;

                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() =>
                        openFile(file)
                      }
                      className={`flex w-full items-center gap-3 border px-3 py-2.5 text-left transition ${
                        activeFile
                          ? "border-[#41496A] bg-[#252B43]"
                          : "border-transparent hover:border-[#303746] hover:bg-[#181D27]"
                      }`}
                      style={{
                        paddingLeft: `${
                          12 +
                          Math.min(
                            depth,
                            5
                          ) * 12
                        }px`
                      }}
                    >
                      <Code2
                        size={13}
                        className={
                          activeFile
                            ? "shrink-0 text-[#8C9AFF]"
                            : "shrink-0 text-[#596174]"
                        }
                      />

                      <span
                        className={`min-w-0 flex-1 truncate font-mono text-[10px] ${
                          activeFile
                            ? "text-[#E1E4EA]"
                            : "text-[#858D9D]"
                        }`}
                        title={file.path}
                      >
                        {String(
                          file.path || ""
                        ).split("/").pop()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="min-w-0">
              {!selectedFile ? (
                <div className="flex h-full min-h-[500px] items-center justify-center">
                  <div className="text-center">
                    <Code2
                      size={26}
                      className="mx-auto text-[#596174]"
                      strokeWidth={1.2}
                    />

                    <div className="mt-4 font-display text-xl text-[#AEB5C5]">
                      Select a file
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[650px] flex-col">
                  <div className="flex min-h-[60px] flex-wrap items-center justify-between gap-4 border-b border-[#2C3240] px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate font-mono text-xs text-[#C2C6D0]">
                        {selectedFile.path}
                      </div>

                      <div className="mt-1 flex flex-wrap gap-3 font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
                        <span>
                          {selectedFile.language ||
                            "TEXT"}
                        </span>

                        <span>
                          {formatFileSize(
                            selectedFile.size
                          )}
                        </span>

                        {selectedFile.is_binary && (
                          <span className="text-[#C06C76]">
                            BINARY
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {hasChanges && (
                        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#C7A86B]">
                          Unsaved changes
                        </span>
                      )}

                      <ForgeButton
                        onClick={saveFile}
                        disabled={
                          saving ||
                          loadingFile ||
                          !hasChanges ||
                          selectedFile.is_binary
                        }
                      >
                        {saving ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <Check size={14} />
                        )}

                        {saving
                          ? "Saving"
                          : "Save file"}
                      </ForgeButton>
                    </div>
                  </div>

                  {loadingFile ? (
                    <div className="flex flex-1 items-center justify-center">
                      <ForgeLoading label="OPENING FILE..." />
                    </div>
                  ) : selectedFile.is_binary ? (
                    <div className="flex flex-1 items-center justify-center p-8 text-center">
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#C06C76]">
                          Binary file
                        </div>

                        <p className="mt-3 max-w-md text-sm leading-6 text-[#697183]">
                          This file is stored in the
                          project but cannot be edited
                          as text.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative min-h-[590px] flex-1 overflow-hidden bg-[#11151E]">
                      {/* Visible Highlight.js layer */}
                      <pre
                        ref={codePreRef}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 m-0 overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-[11px] leading-6"
                        style={{
                          tabSize: 2,
                          background:
                            "transparent"
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            highlightedCode ||
                            " "
                        }}
                      />

                      {/* Editable layer */}
                      <textarea
                        ref={codeTextareaRef}
                        value={fileContent}
                        onChange={(e) =>
                          setFileContent(
                            e.target.value
                          )
                        }
                        onScroll={syncCodeScroll}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                        wrap="off"
                        className="relative z-10 block min-h-[590px] w-full resize-none overflow-auto bg-transparent p-5 font-mono text-[11px] leading-6 outline-none placeholder:text-[#596174]"
                        style={{
                          color: "transparent",
                          caretColor:
                            "#E1E4EA",
                          WebkitTextFillColor:
                            "transparent",
                          background:
                            "transparent",
                          tabSize: 2
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
          <div className="w-full max-w-2xl border border-[#303746] bg-[#151922] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2C3240] px-5 py-4">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#697183]">
                  Project import
                </div>

                <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[#E1E4EA]">
                  Bring the codebase in.
                </div>
              </div>

              <button
                type="button"
                onClick={closeImport}
                disabled={importing}
                className="text-[#596174] transition hover:text-[#AEB5C5] disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 border border-[#2C3240]">
                <button
                  type="button"
                  onClick={() =>
                    setImportMode("zip")
                  }
                  disabled={importing}
                  className={`border-r border-[#2C3240] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.12em] transition ${
                    importMode === "zip"
                      ? "bg-[#252B43] text-[#EEF0FF]"
                      : "text-[#697183] hover:bg-[#181D27]"
                  }`}
                >
                  ZIP upload
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setImportMode("github")
                  }
                  disabled={importing}
                  className={`px-4 py-3 font-mono text-[9px] uppercase tracking-[0.12em] transition ${
                    importMode === "github"
                      ? "bg-[#252B43] text-[#EEF0FF]"
                      : "text-[#697183] hover:bg-[#181D27]"
                  }`}
                >
                  GitHub
                </button>
              </div>

              {importMode === "zip" ? (
                <div className="mt-6">
                  <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center border border-dashed border-[#3A4150] bg-[#11151E] px-6 text-center transition hover:border-[#41496A]">
                    <Upload
                      size={25}
                      strokeWidth={1.2}
                      className="text-[#596174]"
                    />

                    <div className="mt-4 font-display text-lg text-[#AEB5C5]">
                      {importFile
                        ? importFile.name
                        : "Select a ZIP project"}
                    </div>

                    <p className="mt-2 max-w-md text-xs leading-6 text-[#596174]">
                      Forge will extract the actual
                      project files and store them
                      against this project.
                    </p>

                    <input
                      type="file"
                      accept=".zip,application/zip"
                      onChange={(e) =>
                        setImportFile(
                          e.target.files?.[0] ||
                            null
                        )
                      }
                      hidden
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-6">
                  <label className="block">
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                      Public GitHub repository URL
                    </span>

                    <input
                      value={githubUrl}
                      onChange={(e) =>
                        setGithubUrl(
                          e.target.value
                        )
                      }
                      placeholder="https://github.com/owner/repository"
                      className="mt-3 w-full border border-[#303746] bg-[#11151E] px-4 py-3 text-sm text-[#C2C6D0] outline-none placeholder:text-[#596174] focus:border-[#41496A]"
                    />
                  </label>

                  <div className="mt-4 border border-[#303746] bg-[#11151E] p-4">
                    <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#697183]">
                      Public repositories only
                    </div>

                    <p className="mt-2 text-xs leading-6 text-[#596174]">
                      Forge currently imports public
                      GitHub repositories directly. Private
                      repository authentication is not
                      being simulated.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-5 border border-[#49323A] bg-[#21191E] px-4 py-3 text-xs text-[#C88B91]">
                  {error}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeImport}
                  disabled={importing}
                  className="border border-[#303746] bg-[#11151E] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#697183] transition hover:text-[#AEB5C5] disabled:opacity-40"
                >
                  Close
                </button>

                <ForgeButton
                  onClick={importProject}
                  disabled={
                    importing ||
                    (importMode === "zip"
                      ? !importFile
                      : !githubUrl.trim())
                  }
                >
                  {importing ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Upload size={15} />
                  )}

                  {importing
                    ? "Importing"
                    : "Import project"}
                </ForgeButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function resolveHighlightLanguage(
  language,
  path
) {
  const value = String(
    language || path || ""
  )
    .toLowerCase()
    .trim();

  if (!value) {
    return null;
  }

  const extension = value.includes(".")
    ? value.split(".").pop()
    : value;

  const aliases = {
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",

    ts: "typescript",
    tsx: "typescript",

    py: "python",

    html: "xml",
    htm: "xml",
    xml: "xml",

    css: "css",
    scss: "scss",
    sass: "scss",

    json: "json",

    md: "markdown",
    mdx: "markdown",

    yml: "yaml",
    yaml: "yaml",

    sh: "shell",
    bash: "shell",
    zsh: "shell",

    sql: "sql",

    java: "java",
    go: "go",
    rs: "rust",

    c: "c",
    h: "c",

    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    hpp: "cpp",

    cs: "csharp",

    php: "php",
    rb: "ruby",

    swift: "swift",
    kt: "kotlin",

    vue: "xml",
    svelte: "xml"
  };

  return (
    aliases[extension] ||
    extension ||
    null
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatFileSize(size) {
  if (
    size == null ||
    Number.isNaN(Number(size))
  ) {
    return "—";
  }

  const bytes = Number(size);

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}