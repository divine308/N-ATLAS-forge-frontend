import { useEffect, useMemo, useState } from "react";

import {
  Check,
  ChevronRight,
  Code2,
  Copy,
  Download,
  FileCode2,
  Folder,
  Info,
  Layers3,
  Play,
  Rocket,
  Terminal,
  TriangleAlert,
} from "lucide-react";

import hljs from "highlight.js/lib/common";
import "highlight.js/styles/github-dark.css";

import { api } from "../../../api/client";

import {
  ForgeButton,
  ForgeEmptyState,
  ForgeLoading,
  InfoRow,
  PageHeader,
} from "../components/ForgeShared";


const TARGETS = [
  {
    id: "frontend",
    label: "Frontend",
    description: "Generate a browser application.",
    icon: Layers3,
  },
  {
    id: "backend",
    label: "Backend",
    description: "Generate an N-ATLAS API service.",
    icon: Terminal,
  },
  {
    id: "fullstack",
    label: "Full Stack",
    description: "Generate frontend and backend together.",
    icon: Code2,
  },
  {
    id: "sdk",
    label: "SDK / Library",
    description: "Generate a reusable N-ATLAS client.",
    icon: Rocket,
  },
];


const LANGUAGE_OPTIONS = {
  frontend: [
    {
      id: "typescript",
      label: "TypeScript",
    },
    {
      id: "javascript",
      label: "JavaScript",
    },
  ],

  backend: [
    {
      id: "python",
      label: "Python",
    },
    {
      id: "javascript",
      label: "JavaScript",
    },
    {
      id: "typescript",
      label: "TypeScript",
    },
    {
      id: "go",
      label: "Go",
    },
    {
      id: "rust",
      label: "Rust",
    },
    {
      id: "java",
      label: "Java",
    },
    {
      id: "csharp",
      label: "C#",
    },
    {
      id: "php",
      label: "PHP",
    },
    {
      id: "ruby",
      label: "Ruby",
    },
    {
      id: "kotlin",
      label: "Kotlin",
    },
    {
      id: "swift",
      label: "Swift",
    },
  ],

  fullstack: [
    {
      id: "typescript",
      label: "TypeScript",
    },
    {
      id: "javascript",
      label: "JavaScript",
    },
  ],

  sdk: [
    {
      id: "python",
      label: "Python",
    },
    {
      id: "javascript",
      label: "JavaScript",
    },
    {
      id: "typescript",
      label: "TypeScript",
    },
    {
      id: "java",
      label: "Java",
    },
    {
      id: "go",
      label: "Go",
    },
    {
      id: "rust",
      label: "Rust",
    },
    {
      id: "csharp",
      label: "C#",
    },
    {
      id: "php",
      label: "PHP",
    },
    {
      id: "ruby",
      label: "Ruby",
    },
    {
      id: "kotlin",
      label: "Kotlin",
    },
    {
      id: "swift",
      label: "Swift",
    },
  ],
};


const FRAMEWORK_OPTIONS = {
  frontend: [
    {
      id: "react-vite",
      label: "React + Vite",
    },
    {
      id: "vue-vite",
      label: "Vue + Vite",
    },
    {
      id: "angular",
      label: "Angular",
    },
    {
      id: "svelte",
      label: "Svelte",
    },
    {
      id: "html-css-js",
      label: "HTML / CSS / JavaScript",
    },
  ],

  backend: {
    python: [
      {
        id: "fastapi",
        label: "FastAPI",
      },
      {
        id: "flask",
        label: "Flask",
      },
      {
        id: "django",
        label: "Django",
      },
    ],

    javascript: [
      {
        id: "express",
        label: "Express",
      },
      {
        id: "fastify",
        label: "Fastify",
      },
    ],

    typescript: [
      {
        id: "express",
        label: "Express",
      },
      {
        id: "fastify",
        label: "Fastify",
      },
    ],

    go: [
      {
        id: "gin",
        label: "Gin",
      },
      {
        id: "fiber",
        label: "Fiber",
      },
    ],

    rust: [
      {
        id: "axum",
        label: "Axum",
      },
      {
        id: "actix",
        label: "Actix Web",
      },
    ],

    java: [
      {
        id: "spring-boot",
        label: "Spring Boot",
      },
    ],

    csharp: [
      {
        id: "aspnet",
        label: "ASP.NET Core",
      },
    ],

    php: [
      {
        id: "laravel",
        label: "Laravel",
      },
    ],

    ruby: [
      {
        id: "rails",
        label: "Rails",
      },
      {
        id: "sinatra",
        label: "Sinatra",
      },
    ],

    kotlin: [
      {
        id: "ktor",
        label: "Ktor",
      },
    ],

    swift: [
      {
        id: "vapor",
        label: "Vapor",
      },
    ],
  },

  fullstack: {
    typescript: [
      {
        id: "react-express",
        label: "React + Express",
      },
      {
        id: "react-fastify",
        label: "React + Fastify",
      },
    ],

    javascript: [
      {
        id: "react-express",
        label: "React + Express",
      },
      {
        id: "react-fastify",
        label: "React + Fastify",
      },
    ],
  },

  sdk: [
    {
      id: "client",
      label: "N-ATLAS Client",
    },
  ],
};


const DEFAULTS = {
  frontend: {
    language: "typescript",
    framework: "react-vite",
  },

  backend: {
    language: "python",
    framework: "fastapi",
  },

  fullstack: {
    language: "typescript",
    framework: "react-express",
  },

  sdk: {
    language: "python",
    framework: "client",
  },
};


function getLanguages(target) {
  return LANGUAGE_OPTIONS[target] || [];
}


function getFrameworks(target, language) {
  const source =
    FRAMEWORK_OPTIONS[target];

  if (!source) {
    return [];
  }

  if (Array.isArray(source)) {
    return source;
  }

  return source[language] || [];
}


function getLanguageFromPath(path = "") {
  const extension =
    path
      .split(".")
      .pop()
      ?.toLowerCase();

  const map = {
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",

    ts: "typescript",
    tsx: "typescript",

    py: "python",

    java: "java",

    go: "go",

    rs: "rust",

    cs: "csharp",

    php: "php",

    rb: "ruby",

    kt: "kotlin",
    kts: "kotlin",

    swift: "swift",

    html: "xml",
    htm: "xml",

    css: "css",
    scss: "scss",
    sass: "scss",

    json: "json",

    yaml: "yaml",
    yml: "yaml",

    md: "markdown",

    sql: "sql",

    sh: "bash",
    bash: "bash",

    xml: "xml",
  };

  return map[extension] || "plaintext";
}


function highlightCode(
  code,
  language,
) {
  if (!code) {
    return "";
  }

  try {
    return hljs.highlight(
      code,
      {
        language,
      },
    ).value;
  } catch {
    return hljs.highlightAuto(
      code,
    ).value;
  }
}


function formatBytes(
  text,
) {
  if (!text) {
    return "0 B";
  }

  const bytes =
    new Blob([
      text,
    ]).size;

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}


function normalizeFiles(
  files,
) {
  if (!Array.isArray(files)) {
    return [];
  }

  return files
    .map(
      (
        file,
        index,
      ) => ({
        path:
          file?.path ||
          file?.filename ||
          `file-${index + 1}`,
        content:
          file?.content ||
          "",
      }),
    )
    .sort(
      (
        a,
        b,
      ) =>
        a.path.localeCompare(
          b.path,
        ),
    );
}


function getScore(
  result,
) {
  const score =
    result?.workflow
      ?.best_score ??
    result?.workflow
      ?.evaluation
      ?.best_score ??
    result?.project
      ?.best_score;

  if (
    score === null ||
    score === undefined ||
    score === ""
  ) {
    return "—";
  }

  const numeric =
    Number(score);

  if (
    Number.isNaN(
      numeric,
    )
  ) {
    return String(
      score,
    );
  }

  return `${numeric.toFixed(1)}%`;
}


export default function SDK({
  project,
}) {
  const [
    target,
    setTarget,
  ] = useState(
    "fullstack",
  );

  const [
    language,
    setLanguage,
  ] = useState(
    "typescript",
  );

  const [
    framework,
    setFramework,
  ] = useState(
    "react-express",
  );

  const [
    result,
    setResult,
  ] = useState(null);

  const [
    selectedPath,
    setSelectedPath,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    copied,
    setCopied,
  ] = useState(false);

  const [
    downloading,
    setDownloading,
  ] = useState(false);


  const languages =
    useMemo(
      () =>
        getLanguages(
          target,
        ),
      [
        target,
      ],
    );


  const frameworks =
    useMemo(
      () =>
        getFrameworks(
          target,
          language,
        ),
      [
        target,
        language,
      ],
    );


  const files =
    useMemo(
      () =>
        normalizeFiles(
          result?.files,
        ),
      [
        result?.files,
      ],
    );


  const selectedFile =
    useMemo(
      () =>
        files.find(
          (
            file,
          ) =>
            file.path ===
            selectedPath,
        ) ||
        files[0] ||
        null,
      [
        files,
        selectedPath,
      ],
    );


  const selectedCode =
    selectedFile?.content ||
    "";


  const selectedCodeLanguage =
    getLanguageFromPath(
      selectedFile?.path ||
        "",
    );


  const highlightedCode =
    useMemo(
      () =>
        highlightCode(
          selectedCode,
          selectedCodeLanguage,
        ),
      [
        selectedCode,
        selectedCodeLanguage,
      ],
    );


  useEffect(() => {
    const defaults =
      DEFAULTS[
        target
      ];

    if (!defaults) {
      return;
    }

    setLanguage(
      defaults.language,
    );

    setFramework(
      defaults.framework,
    );

    setResult(null);
    setSelectedPath("");
    setError("");
  }, [
    target,
  ]);


  useEffect(() => {
    const availableFrameworks =
      getFrameworks(
        target,
        language,
      );

    if (
      availableFrameworks.length ===
      0
    ) {
      return;
    }

    const exists =
      availableFrameworks.some(
        (
          item,
        ) =>
          item.id ===
          framework,
      );

    if (!exists) {
      setFramework(
        availableFrameworks[0].id,
      );
    }
  }, [
    target,
    language,
    framework,
  ]);


  useEffect(() => {
    let cancelled = false;

    async function generate() {
      if (!project?.id) {
        return;
      }

      setLoading(true);
      setError("");
      setResult(null);
      setSelectedPath("");

      try {
        const data =
          await api.sdk.generate(
            project.id,
            {
              target,
              language,
              framework,
            },
          );

        if (
          cancelled
        ) {
          return;
        }

        setResult(
          data,
        );

        const generatedFiles =
          normalizeFiles(
            data?.files,
          );

        if (
          generatedFiles.length
        ) {
          setSelectedPath(
            generatedFiles[0].path,
          );
        }
      } catch (
        err
      ) {
        if (
          !cancelled
        ) {
          setError(
            err?.message ||
              "Generation failed.",
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(false);
        }
      }
    }

    generate();

    return () => {
      cancelled = true;
    };
  }, [
    project?.id,
    target,
    language,
    framework,
  ]);


  async function copyCode() {
    if (!selectedCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        selectedCode,
      );

      setCopied(
        true,
      );

      window.setTimeout(
        () =>
          setCopied(
            false,
          ),
        1600,
      );
    } catch {
      setCopied(
        false,
      );
    }
  }


  function downloadFile(
    filename,
    content,
  ) {
    if (
      !filename ||
      content === undefined ||
      content === null
    ) {
      return;
    }

    setDownloading(
      true,
    );

    try {
      const blob =
        new Blob(
          [
            content,
          ],
          {
            type:
              "text/plain;charset=utf-8",
          },
        );

      const url =
        URL.createObjectURL(
          blob,
        );

      const anchor =
        document.createElement(
          "a",
        );

      anchor.href =
        url;

      anchor.download =
        filename;

      document.body.appendChild(
        anchor,
      );

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(
        url,
      );
    } finally {
      window.setTimeout(
        () =>
          setDownloading(
            false,
          ),
        500,
      );
    }
  }


  function downloadSelectedFile() {
    if (
      !selectedFile
    ) {
      return;
    }

    downloadFile(
      selectedFile.path
        .split("/")
        .pop(),
      selectedFile.content,
    );
  }


  function downloadEnv() {
    if (
      !result?.env_example
    ) {
      return;
    }

    downloadFile(
      result.env_filename ||
        ".env.example",
      result.env_example,
    );
  }


  function handleTargetChange(
    nextTarget,
  ) {
    setTarget(
      nextTarget,
    );
  }


  function handleLanguageChange(
    nextLanguage,
  ) {
    setLanguage(
      nextLanguage,
    );
  }


  function handleFrameworkChange(
    nextFramework,
  ) {
    setFramework(
      nextFramework,
    );
  }


  const workflow =
    result?.workflow ||
    {};

  const projectTrace =
    result?.project ||
    {};

  const codebase =
    workflow?.codebase ||
    {};

  const playground =
    workflow?.playground ||
    {};

  const datasets =
    workflow?.datasets ||
    {};

  const evaluations =
    workflow?.evaluations ||
    workflow?.evaluation ||
    {};

  const evaluationRuns =
    evaluations?.run_count ??
    evaluations?.runs ??
    0;

  const bestScore =
    getScore(
      result,
    );


  return (
    <div className="space-y-8">

      <PageHeader
        eyebrow="07 / Ship"
        title="From Forge workflow to code."
        description={
          "Generate a complete N-ATLAS application, backend, frontend, " +
          "or reusable SDK using the persisted context of this project."
        }
      />


      {/* =====================================================
          GENERATION CONFIGURATION
      ===================================================== */}

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-800
          bg-slate-950
          shadow-xl
        "
      >

        <div
          className="
            border-b
            border-slate-800
            px-5
            py-4
          "
        >
          <div
            className="
              text-sm
              font-semibold
              text-white
            "
          >
            Generation target
          </div>

          <div
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
            Choose what Forge should produce.
          </div>
        </div>


        <div
          className="
            grid
            gap-px
            bg-slate-800
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {TARGETS.map(
            (
              item,
            ) => {
              const Icon =
                item.icon;

              const active =
                target ===
                item.id;

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    handleTargetChange(
                      item.id,
                    )
                  }
                  className={`
                    group
                    bg-slate-950
                    p-5
                    text-left
                    transition
                    ${
                      active
                        ? "bg-white text-slate-950"
                        : "text-white hover:bg-slate-900"
                    }
                  `}
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          active
                            ? "bg-slate-100"
                            : "bg-slate-900"
                        }
                      `}
                    >
                      <Icon
                        size={
                          18
                        }
                        className={
                          active
                            ? "text-slate-900"
                            : "text-slate-300"
                        }
                      />
                    </div>

                    {active && (
                      <Check
                        size={
                          17
                        }
                      />
                    )}
                  </div>

                  <div
                    className="
                      mt-4
                      text-sm
                      font-semibold
                    "
                  >
                    {
                      item.label
                    }
                  </div>

                  <div
                    className={`
                      mt-1
                      text-xs
                      leading-5
                      ${
                        active
                          ? "text-slate-500"
                          : "text-slate-500"
                      }
                    `}
                  >
                    {
                      item.description
                    }
                  </div>
                </button>
              );
            },
          )}
        </div>


        <div
          className="
            grid
            gap-4
            border-t
            border-slate-800
            p-5
            md:grid-cols-2
          "
        >

          {/* LANGUAGE */}

          <div>
            <label
              className="
                mb-2
                block
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              Language
            </label>

            <select
              value={
                language
              }
              onChange={(
                event,
              ) =>
                handleLanguageChange(
                  event.target.value,
                )
              }
              className="
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                px-3
                py-3
                text-sm
                text-white
                outline-none
                transition
                focus:border-slate-400
              "
            >
              {languages.map(
                (
                  item,
                ) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {
                      item.label
                    }
                  </option>
                ),
              )}
            </select>
          </div>


          {/* FRAMEWORK */}

          <div>
            <label
              className="
                mb-2
                block
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              Framework
            </label>

            <select
              value={
                framework
              }
              onChange={(
                event,
              ) =>
                handleFrameworkChange(
                  event.target.value,
                )
              }
              className="
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                px-3
                py-3
                text-sm
                text-white
                outline-none
                transition
                focus:border-slate-400
              "
            >
              {frameworks.map(
                (
                  item,
                ) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {
                      item.label
                    }
                  </option>
                ),
              )}
            </select>
          </div>

        </div>
      </section>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-red-900/50
            bg-red-950/30
            p-5
            text-sm
            text-red-300
          "
        >
          <TriangleAlert
            size={
              18
            }
            className="mt-0.5 shrink-0"
          />

          <div>
            <div
              className="
                font-medium
                text-red-200
              "
            >
              Generation failed
            </div>

            <div className="mt-1">
              {
                error
              }
            </div>
          </div>
        </div>
      )}


      {/* =====================================================
          GENERATED PROJECT
      ===================================================== */}

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-800
          bg-slate-950
          shadow-xl
        "
      >

        {loading ? (
          <div
            className="
              flex
              min-h-[620px]
              items-center
              justify-center
            "
          >
            <ForgeLoading />
          </div>
        ) : !result ? (
          <ForgeEmptyState
            title="No project generated"
            description={
              "Choose a target, language and framework to generate the project."
            }
          />
        ) : (
          <div>

            {/* PROJECT HEADER */}

            <div
              className="
                flex
                flex-wrap
                items-center
                justify-between
                gap-4
                border-b
                border-slate-800
                px-5
                py-4
              "
            >

              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  <Rocket
                    size={
                      16
                    }
                    className="text-slate-400"
                  />

                  Generated project
                </div>

                <div
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  {
                    result.target ||
                    target
                  }
                  {" · "}
                  {
                    result.language ||
                    language
                  }
                  {" · "}
                  {
                    result.framework ||
                    framework
                  }
                </div>
              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <button
                  type="button"
                  onClick={
                    copyCode
                  }
                  disabled={
                    !selectedCode
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-700
                    px-3
                    py-2
                    text-sm
                    text-slate-300
                    transition
                    hover:border-slate-500
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  {copied ? (
                    <Check
                      size={
                        15
                      }
                    />
                  ) : (
                    <Copy
                      size={
                        15
                      }
                    />
                  )}

                  {copied
                    ? "Copied"
                    : "Copy"}
                </button>


                <button
                  type="button"
                  onClick={
                    downloadSelectedFile
                  }
                  disabled={
                    !selectedFile ||
                    downloading
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-white
                    px-3
                    py-2
                    text-sm
                    font-medium
                    text-slate-950
                    transition
                    hover:bg-slate-200
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <Download
                    size={
                      15
                    }
                  />

                  Download file
                </button>

              </div>
            </div>


            {/* FILE EXPLORER + CODE */}

            <div
              className="
                grid
                min-h-[620px]
                lg:grid-cols-[270px_minmax(0,1fr)]
              "
            >

              {/* FILE TREE */}

              <aside
                className="
                  border-b
                  border-slate-800
                  bg-[#0b1018]
                  lg:border-b-0
                  lg:border-r
                "
              >

                <div
                  className="
                    border-b
                    border-slate-800
                    px-4
                    py-3
                  "
                >
                  <div
                    className="
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    "
                  >
                    Files
                  </div>

                  <div
                    className="
                      mt-1
                      text-xs
                      text-slate-600
                    "
                  >
                    {
                      files.length
                    } generated files
                  </div>
                </div>


                <div
                  className="
                    max-h-[570px]
                    overflow-y-auto
                    p-2
                  "
                >
                  {files.map(
                    (
                      file,
                    ) => {
                      const active =
                        selectedFile?.path ===
                        file.path;

                      const filename =
                        file.path
                          .split(
                            "/",
                          )
                          .pop();

                      const directory =
                        file.path
                          .split(
                            "/",
                          )
                          .slice(
                            0,
                            -1,
                          )
                          .join(
                            "/",
                          );

                      return (
                        <button
                          key={
                            file.path
                          }
                          type="button"
                          onClick={() =>
                            setSelectedPath(
                              file.path,
                            )
                          }
                          className={`
                            mb-0.5
                            flex
                            w-full
                            items-start
                            gap-2
                            rounded-lg
                            px-3
                            py-2
                            text-left
                            transition
                            ${
                              active
                                ? "bg-white text-slate-950"
                                : "text-slate-400 hover:bg-slate-900 hover:text-white"
                            }
                          `}
                        >
                          <FileCode2
                            size={
                              15
                            }
                            className="
                              mt-0.5
                              shrink-0
                            "
                          />

                          <span
                            className="
                              min-w-0
                            "
                          >
                            <span
                              className="
                                block
                                truncate
                                text-xs
                                font-medium
                              "
                            >
                              {
                                filename
                              }
                            </span>

                            {directory && (
                              <span
                                className={`
                                  mt-0.5
                                  block
                                  truncate
                                  text-[10px]
                                  ${
                                    active
                                      ? "text-slate-500"
                                      : "text-slate-600"
                                  }
                                `}
                              >
                                {
                                  directory
                                }
                              </span>
                            )}
                          </span>

                          {active && (
                            <ChevronRight
                              size={
                                14
                              }
                              className="
                                ml-auto
                                mt-0.5
                                shrink-0
                              "
                            />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </aside>


              {/* CODE */}

              <div
                className="
                  min-w-0
                  bg-[#0d1117]
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-slate-800
                    bg-[#111827]
                    px-5
                    py-3
                  "
                >

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                    "
                  >
                    <FileCode2
                      size={
                        17
                      }
                      className="shrink-0 text-slate-400"
                    />

                    <span
                      className="
                        truncate
                        text-sm
                        font-medium
                        text-slate-200
                      "
                    >
                      {
                        selectedFile?.path ||
                        "Select a file"
                      }
                    </span>
                  </div>


                  {selectedFile && (
                    <span
                      className="
                        shrink-0
                        text-xs
                        text-slate-500
                      "
                    >
                      {formatBytes(
                        selectedCode,
                      )}
                    </span>
                  )}

                </div>


                <div
                  className="
                    overflow-auto
                  "
                >
                  <pre
                    className="
                      m-0
                      min-h-[570px]
                      p-6
                      text-[13px]
                      leading-6
                      font-mono
                    "
                  >
                    {selectedFile ? (
                      <code
                        className={`
                          hljs
                          language-${selectedCodeLanguage}
                        `}
                        dangerouslySetInnerHTML={{
                          __html:
                            highlightedCode,
                        }}
                      />
                    ) : (
                      <span className="text-slate-600">
                        Select a generated file.
                      </span>
                    )}
                  </pre>
                </div>

              </div>

            </div>

          </div>
        )}
      </section>


      {/* =====================================================
          GENERATION SUMMARY
      ===================================================== */}

      {result && (
        <section
          className="
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <div
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Target
            </div>

            <div
              className="
                mt-2
                text-lg
                font-semibold
                text-slate-900
              "
            >
              {
                result.target ||
                target
              }
            </div>
          </div>


          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <div
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Generated files
            </div>

            <div
              className="
                mt-2
                text-lg
                font-semibold
                text-slate-900
              "
            >
              {
                files.length
              }
            </div>
          </div>


          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <div
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Evaluation runs
            </div>

            <div
              className="
                mt-2
                text-lg
                font-semibold
                text-slate-900
              "
            >
              {
                evaluationRuns
              }
            </div>
          </div>


          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >
            <div
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Best score
            </div>

            <div
              className="
                mt-2
                text-lg
                font-semibold
                text-slate-900
              "
            >
              {
                bestScore
              }
            </div>
          </div>

        </section>
      )}


      {/* =====================================================
          INSTALL / ENVIRONMENT
      ===================================================== */}

      {result && (
        <div
          className="
            grid
            gap-5
            lg:grid-cols-2
          "
        >

          {/* INSTALL */}

          <section
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <div
              className="
                mb-4
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                "
              >
                <Terminal
                  size={
                    17
                  }
                  className="text-slate-700"
                />
              </div>

              <div>
                <div
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Install & Run
                </div>

                <div
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Generated project commands
                </div>
              </div>
            </div>


            <div
              className="
                space-y-4
              "
            >

              <div>
                <div
                  className="
                    mb-2
                    text-xs
                    font-medium
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Install
                </div>

                <div
                  className="
                    overflow-x-auto
                    rounded-xl
                    bg-slate-950
                    p-4
                    font-mono
                    text-xs
                    text-slate-200
                  "
                >
                  {
                    result.install_command ||
                    "—"
                  }
                </div>
              </div>


              <div>
                <div
                  className="
                    mb-2
                    text-xs
                    font-medium
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Run
                </div>

                <div
                  className="
                    overflow-x-auto
                    rounded-xl
                    bg-slate-100
                    p-4
                    font-mono
                    text-xs
                    text-slate-700
                  "
                >
                  {
                    result.run_command ||
                    "—"
                  }
                </div>
              </div>

            </div>
          </section>


          {/* ENVIRONMENT */}

          <section
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >

            <div
              className="
                mb-4
                flex
                items-center
                justify-between
                gap-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-100
                  "
                >
                  <Code2
                    size={
                      17
                    }
                    className="text-slate-700"
                  />
                </div>

                <div>
                  <div
                    className="
                      text-sm
                      font-semibold
                      text-slate-900
                    "
                  >
                    Environment
                  </div>

                  <div
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    {
                      result.env_filename ||
                      ".env.example"
                    }
                  </div>
                </div>
              </div>


              <button
                type="button"
                onClick={
                  downloadEnv
                }
                disabled={
                  !result.env_example
                }
                className="
                  rounded-lg
                  p-2
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  hover:text-slate-900
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                title="Download environment file"
              >
                <Download
                  size={
                    16
                  }
                />
              </button>

            </div>


            <pre
              className="
                max-h-[250px]
                overflow-auto
                rounded-xl
                bg-slate-950
                p-4
                text-xs
                leading-6
                text-slate-200
              "
            >
              {
                result.env_example ||
                "No environment configuration generated."
              }
            </pre>
          </section>

        </div>
      )}


      {/* =====================================================
          FORGE WORKFLOW TRACE
      ===================================================== */}

      {result && (
        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >

          <div
            className="
              mb-6
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-slate-100
              "
            >
              <Play
                size={
                  18
                }
                className="text-slate-700"
              />
            </div>

            <div>
              <h3
                className="
                  text-base
                  font-semibold
                  text-slate-900
                "
              >
                Forge workflow trace
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                The context used to produce this generation.
              </p>
            </div>
          </div>


          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-5
            "
          >

            <div
              className="
                rounded-xl
                border
                border-slate-200
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-slate-400
                "
              >
                <Folder
                  size={
                    14
                  }
                />

                Codebase
              </div>

              <div
                className="
                  mt-3
                  text-xl
                  font-semibold
                  text-slate-900
                "
              >
                {
                  codebase.file_count ??
                  0
                }
              </div>

              <div
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                imported files
              </div>
            </div>


            <div
              className="
                rounded-xl
                border
                border-slate-200
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-slate-400
                "
              >
                <Play
                  size={
                    14
                  }
                />

                Playground
              </div>

              <div
                className="
                  mt-3
                  text-xl
                  font-semibold
                  text-slate-900
                "
              >
                {
                  playground.experiment_count ??
                  0
                }
              </div>

              <div
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                experiments
              </div>
            </div>


            <div
              className="
                rounded-xl
                border
                border-slate-200
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-slate-400
                "
              >
                <Layers3
                  size={
                    14
                  }
                />

                Datasets
              </div>

              <div
                className="
                  mt-3
                  text-xl
                  font-semibold
                  text-slate-900
                "
              >
                {
                  datasets.count ??
                  datasets.dataset_count ??
                  0
                }
              </div>

              <div
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                connected datasets
              </div>
            </div>


            <div
              className="
                rounded-xl
                border
                border-slate-200
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-slate-400
                "
              >
                <Check
                  size={
                    14
                  }
                />

                Evaluations
              </div>

              <div
                className="
                  mt-3
                  text-xl
                  font-semibold
                  text-slate-900
                "
              >
                {
                  evaluations.suite_count ??
                  0
                }
              </div>

              <div
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                evaluation suites
              </div>
            </div>


            <div
              className="
                rounded-xl
                border
                border-slate-200
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-slate-400
                "
              >
                <Rocket
                  size={
                    14
                  }
                />

                Best score
              </div>

              <div
                className="
                  mt-3
                  text-xl
                  font-semibold
                  text-slate-900
                "
              >
                {
                  bestScore
                }
              </div>

              <div
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                across evaluation runs
              </div>
            </div>

          </div>

        </section>
      )}


      {/* =====================================================
          USAGE
      ===================================================== */}

      {result?.usage && (
        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >

          <div
            className="
              mb-4
              flex
              items-center
              gap-3
            "
          >
            <Terminal
              size={
                18
              }
              className="text-slate-500"
            />

            <div>
              <h3
                className="
                  text-base
                  font-semibold
                  text-slate-900
                "
              >
                Usage
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Start using the generated N-ATLAS integration.
              </p>
            </div>
          </div>


          <div
            className="
              overflow-x-auto
              rounded-2xl
              bg-[#0d1117]
              p-5
            "
          >
            <pre
              className="
                m-0
                text-[13px]
                leading-6
              "
            >
              <code
                dangerouslySetInnerHTML={{
                  __html:
                    highlightCode(
                      result.usage,
                      getLanguageFromPath(
                        selectedFile?.path ||
                          "",
                      ),
                    ),
                }}
              />
            </pre>
          </div>

        </section>
      )}


      {/* =====================================================
          CONFIGURATION
      ===================================================== */}

      {result && (
        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >

          <div
            className="
              mb-5
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-slate-100
              "
            >
              <Info
                size={
                  17
                }
                className="text-slate-700"
              />
            </div>

            <div>
              <div
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                Generation configuration
              </div>

              <div
                className="
                  text-xs
                  text-slate-500
                "
              >
                The configuration used by Ship.
              </div>
            </div>
          </div>


          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            <InfoRow
              label="Target"
              value={
                result.target ||
                target
              }
            />

            <InfoRow
              label="Language"
              value={
                result.language ||
                language
              }
            />

            <InfoRow
              label="Framework"
              value={
                result.framework ||
                framework
              }
            />

            <InfoRow
              label="Model"
              value={
                result.configuration
                  ?.model ||
                projectTrace.model_name ||
                "N-ATLAS"
              }
            />

          </div>

        </section>
      )}


      {/* =====================================================
          WARNINGS
      ===================================================== */}

      {result?.warnings?.length > 0 && (
        <section
          className="
            rounded-2xl
            border
            border-amber-200
            bg-amber-50
            p-5
          "
        >

          <div
            className="
              mb-3
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-amber-900
            "
          >
            <TriangleAlert
              size={
                17
              }
            />

            Before you ship
          </div>


          <div
            className="
              space-y-2
            "
          >
            {result.warnings.map(
              (
                warning,
                index,
              ) => (
                <div
                  key={
                    index
                  }
                  className="
                    text-sm
                    leading-6
                    text-amber-800
                  "
                >
                  {
                    warning
                  }
                </div>
              ),
            )}
          </div>

        </section>
      )}


      {/* =====================================================
          PROJECT TRACEABILITY
      ===================================================== */}

      {result?.project && (
        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          "
        >

          <div
            className="
              mb-5
            "
          >
            <h3
              className="
                text-base
                font-semibold
                text-slate-900
              "
            >
              Generated from this project
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Ship uses the persisted Forge project context instead of
              generating an isolated example.
            </p>
          </div>


          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            <InfoRow
              label="Project"
              value={
                projectTrace.name ||
                project?.name ||
                "—"
              }
            />

            <InfoRow
              label="Project ID"
              value={
                projectTrace.id ||
                project?.id ||
                "—"
              }
            />

            <InfoRow
              label="Source"
              value={
                projectTrace.source_type ||
                projectTrace.configuration
                  ?.source_type ||
                codebase.source_type ||
                "—"
              }
            />

            <InfoRow
              label="N-ATLAS usage"
              value={
                projectTrace.natlas_usage_detected ??
                codebase.natlas_usage_detected ??
                "—"
              }
            />

          </div>

        </section>
      )}

    </div>
  );
}