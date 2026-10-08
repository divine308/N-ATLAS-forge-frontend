export const NATLAS_MODELS = [
  {
    value: "NCAIR1/N-ATLaS",
    label: "N-ATLaS 8B",
    type: "language",
    capability: "chat"
  },
  {
    value: "NCAIR1/Hausa-ASR",
    label: "Hausa-ASR",
    type: "speech",
    capability: "asr",
    language: "hausa"
  },
  {
    value: "NCAIR1/Yoruba-ASR",
    label: "Yoruba-ASR",
    type: "speech",
    capability: "asr",
    language: "yoruba"
  },
  {
    value: "NCAIR1/Igbo-ASR",
    label: "Igbo-ASR",
    type: "speech",
    capability: "asr",
    language: "igbo"
  },
  {
    value: "NCAIR1/NigerianAccentedEnglish",
    label: "Nigerian Accented English",
    type: "speech",
    capability: "asr",
    language: "english"
  }
];

export const NATLAS_CHAT_MODELS =
  NATLAS_MODELS.filter(
    (model) =>
      model.capability === "chat"
  );

export const NATLAS_ASR_MODELS =
  NATLAS_MODELS.filter(
    (model) =>
      model.capability === "asr"
  );

export const DEFAULT_CONFIGURATION = {
  model: "NCAIR1/N-ATLaS",
  model_type: "language",

  temperature: 0.7,
  max_tokens: 800,

  context_size: 4096,
  top_p: 0.95,
  top_k: 40,
  repetition_penalty: 1.1,

  threads: 4,
  batch_size: 128,
  gpu_layers: 0,

  default_language: "english",

  system_prompt:
    "You are a helpful Nigerian AI assistant. Be accurate, clear and culturally aware."
};

export function getProjectConfiguration(project) {
  const configuration =
    project?.configuration || {};

  let model =
    project?.model_name ||
    configuration.model ||
    DEFAULT_CONFIGURATION.model;

  if (
    model === "N-ATLAS" ||
    model === "N-ATLaS" ||
    model === "N-ATLAS 8B"
  ) {
    model = "NCAIR1/N-ATLaS";
  }

  const selectedModel =
    NATLAS_MODELS.find(
      (item) =>
        item.value === model
    );

  return {
    ...DEFAULT_CONFIGURATION,
    ...configuration,

    model,

    model_type:
      selectedModel?.type ||
      configuration.model_type ||
      DEFAULT_CONFIGURATION.model_type
  };
}

export function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}