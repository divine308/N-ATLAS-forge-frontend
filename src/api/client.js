const API_BASE =
  import.meta.env.VITE_BACKEND_URL ||
  "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const token = localStorage.getItem(
    "natlas_forge_token"
  );

  const headers = {
    Accept: "application/json",
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] =
      "application/json";
  }

  /*
   * Authentication belongs here.
   *
   * Pages and components do not need to know how
   * the access token is attached to API requests.
   */
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE}${path}`,
    {
      ...options,
      headers
    }
  );

  let data = null;

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data?.detail ||
          data?.message ||
          "Request failed."
        : data ||
          "Request failed.";

    throw new Error(message);
  }

  return data;
}

export const api = {
  /* =========================================================
     SYSTEM
  ========================================================= */

  health: () =>
    request("/health"),

  /* =========================================================
     AUTH
  ========================================================= */

  register: (payload) =>
    request("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  login: (payload) =>
    request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  me: () =>
    request("/api/v1/auth/me"),

  /* =========================================================
     PROJECTS
  ========================================================= */

  projects: {
  list: () =>
    request("/api/v1/projects"),

  get: (projectId) =>
    request(
      `/api/v1/projects/${projectId}`
    ),

  create: (payload) =>
    request("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  update: (projectId, payload) =>
    request(
      `/api/v1/projects/${projectId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload)
      }
    ),

  delete: (projectId) =>
    request(
      `/api/v1/projects/${projectId}`,
      {
        method: "DELETE"
      }
    ),

  files: {
    list: (projectId) =>
      request(
        `/api/v1/projects/${projectId}/files`
      ),

    get: (projectId, fileId) =>
      request(
        `/api/v1/projects/${projectId}/files/${fileId}`
      ),

    update: (
      projectId,
      fileId,
      payload
    ) =>
      request(
        `/api/v1/projects/${projectId}/files/${fileId}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload)
        }
      ),

    importZip: (
      projectId,
      file
    ) => {
      const form = new FormData();

      form.append("file", file);

      return request(
        `/api/v1/projects/${projectId}/import/zip`,
        {
          method: "POST",
          body: form
        }
      );
    },

    importGithub: (
      projectId,
      repositoryUrl
    ) =>
      request(
        `/api/v1/projects/${projectId}/import/github?repository_url=${encodeURIComponent(
          repositoryUrl
        )}`,
        {
          method: "POST"
        }
      )
  }
},
  /* =========================================================
     PLAYGROUND
  ========================================================= */

playground: {
  chat: (projectId, payload) =>
    request(
      `/api/v1/projects/${projectId}/playground/chat`,
      {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          project_id: projectId
        })
      }
    )
},

    /* =========================================================
     DATASETS
  ========================================================= */

  datasets: {
    list: (projectId) =>
      request(
        `/api/v1/projects/${projectId}/datasets`
      ),

    upload: (
      projectId,
      file,
      metadata = {}
    ) => {
      const form = new FormData();

      form.append("file", file);

      if (metadata.name) {
        form.append(
          "name",
          metadata.name
        );
      }

      if (metadata.description) {
        form.append(
          "description",
          metadata.description
        );
      }

      return request(
        `/api/v1/projects/${projectId}/datasets`,
        {
          method: "POST",
          body: form
        }
      );
    },

    get: (
      projectId,
      datasetId
    ) =>
      request(
        `/api/v1/projects/${projectId}/datasets/${datasetId}`
      ),

    records: (
      projectId,
      datasetId,
      params = {}
    ) => {
      const query =
        new URLSearchParams();

      if (params.search) {
        query.set(
          "search",
          params.search
        );
      }

      if (
        params.offset !== undefined
      ) {
        query.set(
          "offset",
          String(params.offset)
        );
      }

      if (
        params.limit !== undefined
      ) {
        query.set(
          "limit",
          String(params.limit)
        );
      }

      const suffix =
        query.toString()
          ? `?${query.toString()}`
          : "";

      return request(
        `/api/v1/projects/${projectId}/datasets/${datasetId}/records${suffix}`
      );
    },

    versions: (
      projectId,
      datasetId
    ) =>
      request(
        `/api/v1/projects/${projectId}/datasets/${datasetId}/versions`
      ),

    createVersion: (
      projectId,
      datasetId,
      file
    ) => {
      const form = new FormData();

      form.append(
        "file",
        file
      );

      return request(
        `/api/v1/projects/${projectId}/datasets/${datasetId}/versions`,
        {
          method: "POST",
          body: form
        }
      );
    },

    download: (
      projectId,
      datasetId
    ) =>
      fetch(
        `${API_BASE}/api/v1/projects/${projectId}/datasets/${datasetId}/download`,
        {
          headers: {
            Accept:
              "application/octet-stream",
            ...(localStorage.getItem(
              "natlas_forge_token"
            )
              ? {
                  Authorization: `Bearer ${localStorage.getItem(
                    "natlas_forge_token"
                  )}`
                }
              : {})
          }
        }
      ).then(async (response) => {
        if (!response.ok) {
          let message =
            "Dataset download failed.";

          try {
            const data =
              await response.json();

            message =
              data?.detail ||
              data?.message ||
              message;
          } catch {
            // Ignore non-JSON error responses.
          }

          throw new Error(message);
        }

        return response.blob();
      }),

    delete: (
      projectId,
      datasetId
    ) =>
      request(
        `/api/v1/projects/${projectId}/datasets/${datasetId}`,
        {
          method: "DELETE"
        }
      )
  },

  /* =========================================================
     EVALUATIONS
  ========================================================= */

  evaluations: {
  suites: (projectId) =>
    request(
      `/api/v1/projects/${projectId}/evaluations/suites`
    ),

  getSuite: (suiteId) =>
    request(
      `/api/v1/evaluations/suites/${suiteId}`
    ),

  createSuite: (projectId, payload) =>
    request(
      `/api/v1/projects/${projectId}/evaluations/suites`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  updateSuite: (suiteId, payload) =>
    request(
      `/api/v1/evaluations/suites/${suiteId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    ),

  deleteSuite: (suiteId) =>
    request(
      `/api/v1/evaluations/suites/${suiteId}`,
      {
        method: "DELETE",
      }
    ),

  cases: (suiteId) =>
    request(
      `/api/v1/evaluations/suites/${suiteId}/cases`
    ),

  createCase: (suiteId, payload) =>
    request(
      `/api/v1/evaluations/suites/${suiteId}/cases`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  updateCase: (caseId, payload) =>
    request(
      `/api/v1/evaluations/cases/${caseId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    ),

  deleteCase: (caseId) =>
    request(
      `/api/v1/evaluations/cases/${caseId}`,
      {
        method: "DELETE",
      }
    ),

  run: (projectId, suiteId, payload = {}) =>
    request(
      `/api/v1/projects/${projectId}/evaluations/suites/${suiteId}/run`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  runs: (projectId, suiteId = null) => {
    const query = suiteId
      ? `?suite_id=${encodeURIComponent(suiteId)}`
      : "";

    return request(
      `/api/v1/projects/${projectId}/evaluations/runs${query}`
    );
  },

  runDetails: (runId) =>
    request(
      `/api/v1/evaluations/runs/${runId}`
    ),

  results: (runId) =>
    request(
      `/api/v1/evaluations/runs/${runId}/results`
    ),

  regression: (projectId, payload) =>
    request(
      `/api/v1/projects/${projectId}/evaluations/regression`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
},
  /* =========================================================
     CRASH TEST
  ========================================================= */

    crashTest: {
    run: (
      projectId,
      payload = {}
    ) =>
      request(
        `/api/v1/projects/${projectId}/crash-test`,
        {
          method: "POST",
          body: JSON.stringify(payload)
        }
      ),

    status: (
      projectId,
      runId
    ) =>
      request(
        `/api/v1/projects/${projectId}/crash-test/${runId}`
      )
  },

  /* =========================================================
     REPORTS
  ========================================================= */

  reports: {
    evaluation: (runId) =>
      request(
        `/api/v1/evaluations/runs/${runId}/report`
      ),

    markdown: (runId) =>
      request(
        `/api/v1/evaluations/runs/${runId}/report/markdown`
      )
  },

  /* =========================================================
     SDK
  ========================================================= */

  sdk: {
  generate: async (
    projectId,
    {
      target = "fullstack",
      language = "typescript",
      framework = "react-express",
    } = {}
  ) => {
    const params = new URLSearchParams({
      target,
      language,
      framework,
    });

    return request(
      `/api/v1/projects/${projectId}/sdk?${params.toString()}`
    );
  },
},

asr: {
  async models() {
    return request(
      "/api/v1/asr/models"
    );
  },

  async transcribe(
    projectId,
    {
      model,
      file
    }
  ) {
    const formData =
      new FormData();

    formData.append(
      "model",
      model
    );

    formData.append(
      "audio",
      file
    );

    return request(
      `/api/v1/projects/${projectId}/asr/transcribe?model=${encodeURIComponent(model)}`,
      {
        method: "POST",
        body: formData
      }
    );
  }
}
}