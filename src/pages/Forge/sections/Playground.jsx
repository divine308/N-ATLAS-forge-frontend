import { useEffect, useState } from "react";

import {
  Loader2,
  Send,
  Terminal
} from "lucide-react";

import { api } from "../../../api/client";

import {
  InfoRow,
  PageHeader
} from "../components/ForgeShared";

import {
  getProjectConfiguration,
  NATLAS_MODELS
} from "../forge.config";

export default function Playground({ project }) {
  const projectConfiguration =
    getProjectConfiguration(project);

  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [language, setLanguage] =
    useState(
      projectConfiguration.default_language ||
        "english"
    );

  const [temperature, setTemperature] =
    useState(
      Number.isFinite(
        Number(
          projectConfiguration.temperature
        )
      )
        ? Number(
            projectConfiguration.temperature
          )
        : 0.7
    );

  const [loading, setLoading] =
    useState(false);

  const [responseMeta, setResponseMeta] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const configuration =
      getProjectConfiguration(project);

    setLanguage(
      configuration.default_language ||
        "english"
    );

    setTemperature(
      Number.isFinite(
        Number(configuration.temperature)
      )
        ? Number(configuration.temperature)
        : 0.7
    );

    setMessages([]);
    setResponseMeta(null);
    setError("");
  }, [
    project?.id,
    project?.configuration,
    project?.model_name
  ]);

  const selectedModel =
    NATLAS_MODELS.find(
      (model) =>
        model.value ===
        projectConfiguration.model
    );

  const isChatModel =
    selectedModel?.capability ===
    "chat";

  async function send() {
    if (!project?.id) {
      setError("No project is loaded.");
      return;
    }

    if (!isChatModel) {
      setError(
        "The selected N-ATLAS model is a speech recognition model. "
        + "Use the speech workflow instead of Playground chat."
      );
      return;
    }

    if (!input.trim() || loading) {
      return;
    }

    const userMessage = {
      role: "user",
      content: input.trim()
    };

    const nextMessages = [
      ...messages
        .filter(
          (message) =>
            message.role !== "system"
        ),
      userMessage
    ];

    setMessages((current) => [
      ...current,
      userMessage
    ]);

    setInput("");
    setLoading(true);
    setError("");

    try {
      const result =
        await api.playground.chat(
          project.id,
          {
            messages: nextMessages,
            language,
            temperature,
            max_tokens:
              projectConfiguration.max_tokens ||
              800
          }
        );

      const assistantContent =
        result?.content ||
        result?.output ||
        result?.response ||
        "";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            assistantContent ||
            "No response content was returned."
        }
      ]);

      setResponseMeta(result);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to complete request."
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([]);
    setResponseMeta(null);
    setError("");
  }

  return (
    <div>
      <PageHeader
        eyebrow="01 / Playground"
        title="Talk to the model."
        description="Build prompts, inspect responses and establish a baseline before you start breaking things."
      />

      {!isChatModel && (
        <div className="mb-5 border border-[#49323A] bg-[#21191E] px-5 py-4 text-sm text-[#C88B91]">
          <div className="font-mono text-[9px] uppercase tracking-[0.16em]">
            Speech model selected
          </div>

          <div className="mt-2 leading-6">
            {selectedModel?.label ||
              projectConfiguration.model}{" "}
            is an ASR model and cannot be used
            with the text Playground.
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 border border-[#2C3240] bg-[#151922]">
          <div className="flex h-12 items-center justify-between border-b border-[#2C3240] px-5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#697183]">
                Session
              </span>

              <span className="h-1 w-1 rounded-full bg-[#7181FF]" />

              <span className="font-mono text-[9px] text-[#596174]">
                {language}
              </span>
            </div>

            <button
              type="button"
              onClick={reset}
              className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#596174] transition hover:text-[#AEB5C5]"
            >
              Clear
            </button>
          </div>

          <div className="min-h-[430px] p-5">
            {messages.length === 0 ? (
              <div className="flex min-h-[390px] items-center gap-5 text-[#596174]">
                <Terminal
                  size={22}
                  strokeWidth={1.3}
                />

                <div>
                  <div className="font-display text-xl text-[#AEB5C5]">
                    Awaiting input
                  </div>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#697183]">
                    Send a prompt. Every request is
                    routed through the Forge backend.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-7">
                {messages.map(
                  (message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className="border-l-2 border-[#303746] pl-4"
                    >
                      <div
                        className={`font-mono text-[9px] uppercase tracking-[0.16em] ${
                          message.role === "user"
                            ? "text-[#7181FF]"
                            : "text-[#697183]"
                        }`}
                      >
                        {message.role === "user"
                          ? "YOU"
                          : "N-ATLAS"}
                      </div>

                      <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#C2C6D0]">
                        {message.content}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {loading && (
              <div className="mt-7 border-l-2 border-[#303746] pl-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#697183]">
                  N-ATLAS
                </div>

                <div className="mt-2 flex items-center gap-2 font-mono text-xs text-[#596174]">
                  <Loader2
                    size={13}
                    className="animate-spin text-[#7181FF]"
                  />
                  Processing...
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="border-t border-[#49323A] bg-[#21191E] px-5 py-4 text-xs text-[#C88B91]">
              {error}
            </div>
          )}

          <div className="border-t border-[#2C3240] p-4">
            <div className="flex gap-3 border border-[#303746] bg-[#11151E] p-2">
              <textarea
                value={input}
                disabled={!isChatModel}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={
                  isChatModel
                    ? "Ask N-ATLAS something..."
                    : "Select a language model to use Playground..."
                }
                rows={4}
                className="min-h-[100px] flex-1 resize-none bg-transparent px-2 py-1 text-sm leading-6 text-[#E1E4EA] outline-none placeholder:text-[#596174] disabled:cursor-not-allowed disabled:opacity-50"
              />

              <button
                type="button"
                onClick={send}
                disabled={
                  loading ||
                  !input.trim() ||
                  !isChatModel
                }
                className="self-end border border-[#41496A] bg-[#7181FF] p-3 text-white transition hover:bg-[#8492FF] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </section>

        <aside className="border border-[#2C3240] bg-[#151922] p-5">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
            Request inspector
          </div>

          <div className="mt-6 border border-[#303746] bg-[#11151E] p-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
              Model
            </div>

            <div className="mt-3 text-xs leading-6 text-[#C2C6D0]">
              {selectedModel?.label ||
                projectConfiguration.model}
            </div>

            <div className="mt-2 font-mono text-[9px] text-[#596174]">
              {projectConfiguration.model}
            </div>
          </div>

          <div className="mt-5 border border-[#303746] bg-[#11151E] p-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
              System prompt
            </div>

            <div className="mt-3 text-xs leading-6 text-[#858D9D]">
              Using project configuration
            </div>

            <div className="mt-3 border-t border-[#2C3240] pt-3 text-[10px] leading-5 text-[#596174]">
              The saved project system prompt is
              applied by the Forge backend.
            </div>
          </div>

          <label className="mt-5 block">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
              Language
            </span>

            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value)
              }
              disabled={!isChatModel}
              className="mt-2 w-full border border-[#303746] bg-[#11151E] px-3 py-3 text-xs text-[#C2C6D0] outline-none focus:border-[#41496A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="english">
                English
              </option>

              <option value="pidgin">
                Nigerian Pidgin
              </option>

              <option value="yoruba">
                Yoruba
              </option>

              <option value="hausa">
                Hausa
              </option>

              <option value="igbo">
                Igbo
              </option>
            </select>
          </label>

          <label className="mt-5 block">
            <div className="flex justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                Temperature
              </span>

              <span className="font-mono text-[9px] text-[#596174]">
                {temperature}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              disabled={!isChatModel}
              onChange={(e) =>
                setTemperature(
                  Number(e.target.value)
                )
              }
              className="mt-4 w-full accent-[#7181FF] disabled:opacity-40"
            />
          </label>

          {responseMeta && (
            <div className="mt-8 border-t border-[#2C3240] pt-6">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
                Last response
              </div>

              <div className="mt-5 space-y-4">
                <InfoRow
                  label="Provider"
                  value={
                    responseMeta.provider ||
                    (responseMeta.local
                      ? "LOCAL"
                      : "N-ATLAS") ||
                    "—"
                  }
                />

                <InfoRow
                  label="Latency"
                  value={
                    responseMeta.latency_ms !=
                    null
                      ? `${responseMeta.latency_ms} ms`
                      : "—"
                  }
                />

                <InfoRow
                  label="Model"
                  value={
                    responseMeta.model ||
                    projectConfiguration.model ||
                    "N-ATLAS"
                  }
                />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}