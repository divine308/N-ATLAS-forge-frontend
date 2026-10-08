import { useEffect, useRef, useState } from "react";

import {
  Check,
  Loader2,
  Mic,
  Square,
  Upload,
  X
} from "lucide-react";

import { api } from "../../../api/client";

import {
  ForgeButton,
  PageHeader
} from "../components/ForgeShared";

import {
  formatDate,
  getProjectConfiguration,
  NATLAS_MODELS,
  NATLAS_CHAT_MODELS,
  NATLAS_ASR_MODELS
} from "../forge.config";

export default function Configuration({
  project,
  onProjectUpdated
}) {
  const [configuration, setConfiguration] =
    useState(
      getProjectConfiguration(project)
    );

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Speech recognition state.
   */
  const [audioFile, setAudioFile] =
    useState(null);

  const [audioUrl, setAudioUrl] =
    useState("");

  const [transcribing, setTranscribing] =
    useState(false);

  const [transcription, setTranscription] =
    useState(null);

  const [speechError, setSpeechError] =
    useState("");

  const [recording, setRecording] =
    useState(false);

  const [recordingTime, setRecordingTime] =
    useState(0);

  const mediaRecorderRef =
    useRef(null);

  const recordingTimerRef =
    useRef(null);

  const audioChunksRef =
    useRef([]);

  useEffect(() => {
    setConfiguration(
      getProjectConfiguration(project)
    );

    setSaved(false);
    setError("");

    /*
     * Reset speech state whenever the project
     * or selected model changes.
     */
    setAudioFile(null);
    setTranscription(null);
    setSpeechError("");
    setRecording(false);
    setRecordingTime(0);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl("");
    }
  }, [
    project?.id,
    project?.configuration,
    project?.model_name
  ]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      if (recordingTimerRef.current) {
        clearInterval(
          recordingTimerRef.current
        );
      }

     if (mediaRecorderRef.current) {
        const recorder =
          mediaRecorderRef.current;

        try {
          recorder.source?.disconnect();
        } catch {}

        try {
          recorder.processor?.disconnect();
        } catch {}

        recorder.stream
          ?.getTracks()
          .forEach((track) =>
            track.stop()
          );

        recorder.audioContext
          ?.close()
          .catch(() => {});
      }
    };
  }, [audioUrl]);

  function updateConfiguration(
    field,
    value
  ) {
    setConfiguration((current) => ({
      ...current,
      [field]: value
    }));

    setSaved(false);
    setError("");
  }

  function updateNumber(
    field,
    value
  ) {
    const numericValue =
      Number(value);

    updateConfiguration(
      field,
      Number.isFinite(numericValue)
        ? numericValue
        : 0
    );
  }

  function mergeAudioBuffers(
  buffers,
  totalLength
) {
  const result =
    new Float32Array(totalLength);

  let offset = 0;

  for (const buffer of buffers) {
    result.set(buffer, offset);
    offset += buffer.length;
  }

  return result;
}

function encodeWav(
  samples,
  sampleRate
) {
  const buffer =
    new ArrayBuffer(
      44 + samples.length * 2
    );

  const view =
    new DataView(buffer);

  function writeString(
    offset,
    value
  ) {
    for (
      let index = 0;
      index < value.length;
      index += 1
    ) {
      view.setUint8(
        offset + index,
        value.charCodeAt(index)
      );
    }
  }

  function floatTo16BitPCM(
    offset,
    input
  ) {
    for (
      let index = 0;
      index < input.length;
      index += 1
    ) {
      const sample =
        Math.max(
          -1,
          Math.min(
            1,
            input[index]
          )
        );

      view.setInt16(
        offset + index * 2,
        sample < 0
          ? sample * 0x8000
          : sample * 0x7fff,
        true
      );
    }
  }

  writeString(
    0,
    "RIFF"
  );

  view.setUint32(
    4,
    36 + samples.length * 2,
    true
  );

  writeString(
    8,
    "WAVE"
  );

  writeString(
    12,
    "fmt "
  );

  view.setUint32(
    16,
    16,
    true
  );

  view.setUint16(
    20,
    1,
    true
  );

  view.setUint16(
    22,
    1,
    true
  );

  view.setUint32(
    24,
    sampleRate,
    true
  );

  view.setUint32(
    28,
    sampleRate * 2,
    true
  );

  view.setUint16(
    32,
    2,
    true
  );

  view.setUint16(
    34,
    16,
    true
  );

  writeString(
    36,
    "data"
  );

  view.setUint32(
    40,
    samples.length * 2,
    true
  );

  floatTo16BitPCM(
    44,
    samples
  );

  return new Blob(
    [view],
    {
      type: "audio/wav"
    }
  );
}

  function updateModel(value) {
    const selectedModel =
      NATLAS_MODELS.find(
        (model) =>
          model.value === value
      );

    setConfiguration((current) => ({
      ...current,
      model: value,
      model_type:
        selectedModel?.type ||
        "language"
    }));

    /*
     * A model switch represents a new
     * capability, so clear any old
     * transcription state.
     */
    setAudioFile(null);
    setTranscription(null);
    setSpeechError("");

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl("");
    }

    setSaved(false);
    setError("");
  }

  async function save() {
    if (!project?.id || saving) {
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const updatedProject =
        await api.projects.update(
          project.id,
          {
            /*
             * project.model_name remains the
             * authoritative selected model.
             */
            model_name:
              configuration.model,

            configuration: {
              ...configuration,
              model:
                configuration.model
            }
          }
        );

      onProjectUpdated(
        updatedProject
      );

      setConfiguration(
        getProjectConfiguration(
          updatedProject
        )
      );

      setSaved(true);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save project configuration."
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedModel =
    NATLAS_MODELS.find(
      (model) =>
        model.value ===
        configuration.model
    );

  const isASR =
    selectedModel?.capability ===
    "asr";

  const isChat =
    selectedModel?.capability ===
    "chat";

  function handleAudioSelected(file) {
    if (!file) {
      return;
    }

    setSpeechError("");
    setTranscription(null);

    /*
     * Keep the frontend validation aligned
     * with the backend's 25 MB limit.
     */
    const maxSize =
      25 * 1024 * 1024;

    if (file.size > maxSize) {
      setAudioFile(null);
      setSpeechError(
        "Audio file is too large. Maximum size is 25 MB."
      );
      return;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioFile(file);
    setAudioUrl(
      URL.createObjectURL(file)
    );
  }

  async function transcribe() {
    if (
      !project?.id ||
      !configuration.model ||
      !audioFile ||
      transcribing
    ) {
      return;
    }

    setTranscribing(true);
    setSpeechError("");
    setTranscription(null);

    try {
      const result =
        await api.asr.transcribe(
          project.id,
          {
            model:
              configuration.model,
            file: audioFile
          }
        );

      setTranscription(result);
    } catch (err) {
      setSpeechError(
        err?.message ||
          "Unable to transcribe this audio."
      );
    } finally {
      setTranscribing(false);
    }
  }

  async function startRecording() {
  if (recording) {
    return;
  }

  setSpeechError("");
  setTranscription(null);

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    setSpeechError(
      "Audio recording is not supported by this browser."
    );
    return;
  }

  try {
    const stream =
      await navigator.mediaDevices.getUserMedia(
        {
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        }
      );

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      stream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      setSpeechError(
        "Web Audio is not supported by this browser."
      );

      return;
    }

    const audioContext =
      new AudioContext();

    await audioContext.resume();

    const source =
      audioContext.createMediaStreamSource(
        stream
      );

    /*
     * ScriptProcessorNode is intentionally used
     * here for broad browser compatibility.
     *
     * The recorded PCM data never leaves the
     * browser in WebM format.
     */
    const processor =
      audioContext.createScriptProcessor(
        4096,
        1,
        1
      );

    const chunks = [];

    let totalLength = 0;

    processor.onaudioprocess =
      (event) => {

        const input =
          event.inputBuffer.getChannelData(
            0
          );

        const chunk =
          new Float32Array(
            input.length
          );

        chunk.set(input);

        chunks.push(chunk);

        totalLength +=
          chunk.length;
      };

    source.connect(
      processor
    );

    processor.connect(
      audioContext.destination
    );

    mediaRecorderRef.current = {
      stream,
      audioContext,
      source,
      processor,
      chunks,
      getTotalLength: () =>
        totalLength
    };

    audioChunksRef.current =
      chunks;

    setRecording(true);
    setRecordingTime(0);

    recordingTimerRef.current =
      setInterval(() => {
        setRecordingTime(
          (current) =>
            current + 1
        );
      }, 1000);
  } catch (err) {
    setSpeechError(
      err?.message ||
        "Unable to access your microphone."
    );
  }
}


  function stopRecording() {
  const recorder =
    mediaRecorderRef.current;

  if (!recorder) {
    return;
  }

  const {
    stream,
    audioContext,
    source,
    processor,
    chunks,
    getTotalLength
  } = recorder;

  try {
    source.disconnect();
  } catch {}

  try {
    processor.disconnect();
  } catch {}

  stream
    .getTracks()
    .forEach((track) =>
      track.stop()
    );

  const totalLength =
    getTotalLength();

  const samples =
    mergeAudioBuffers(
      chunks,
      totalLength
    );

  const wavBlob =
    encodeWav(
      samples,
      audioContext.sampleRate
    );

  const file =
    new File(
      [wavBlob],
      `forge-recording-${Date.now()}.wav`,
      {
        type: "audio/wav"
      }
    );

  audioContext
    .close()
    .catch(() => {});

  mediaRecorderRef.current =
    null;

  handleAudioSelected(
    file
  );

  setRecording(false);

  if (
    recordingTimerRef.current
  ) {
    clearInterval(
      recordingTimerRef.current
    );

    recordingTimerRef.current =
      null;
  }
}

  function formatRecordingTime(
    seconds
  ) {
    const minutes =
      Math.floor(
        seconds / 60
      );

    const remaining =
      seconds % 60;

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      remaining
    ).padStart(
      2,
      "0"
    )}`;
  }

  return (
    <div>
      <PageHeader
        eyebrow="08 / Configuration"
        title="Project configuration."
        description="Configure how this Forge project should work with N-ATLAS."
        action={
          <ForgeButton
            onClick={save}
            disabled={
              saving ||
              !project?.id
            }
          >
            {saving ? (
              <>
                <Loader2
                  size={15}
                  className="animate-spin"
                />
                Saving
              </>
            ) : saved ? (
              <>
                <Check size={15} />
                Saved
              </>
            ) : (
              <>
                <Check size={15} />
                Save configuration
              </>
            )}
          </ForgeButton>
        }
      />

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

      {saved && !error && (
        <div className="mb-7 flex items-center gap-3 border border-[#303746] bg-[#11151E] px-4 py-3 text-sm text-[#8C9AFF]">
          <Check size={15} />
          Project configuration saved successfully.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="border border-[#2C3240] bg-[#151922]">
          <div className="border-b border-[#2C3240] px-5 py-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
              Project
            </div>
          </div>

          <div className="divide-y divide-[#2C3240]">
            <ConfigurationRow
              label="Name"
              value={
                project?.name ||
                "—"
              }
            />

            <ConfigurationRow
              label="Project ID"
              value={
                project?.id ||
                "—"
              }
            />

            <ConfigurationRow
              label="Model"
              value={
                selectedModel?.label ||
                project?.model_name ||
                "N-ATLaS"
              }
            />

            <ConfigurationRow
              label="Model ID"
              value={
                configuration.model ||
                "—"
              }
            />

            <ConfigurationRow
              label="Created"
              value={formatDate(
                project?.created_at
              )}
            />
          </div>
        </section>

        <section className="border border-[#2C3240] bg-[#151922]">
          <div className="border-b border-[#2C3240] px-5 py-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
              Runtime
            </div>
          </div>

          <div className="divide-y divide-[#2C3240]">
            <ConfigurationRow
              label="Provider"
              value="N-ATLAS"
            />

            <ConfigurationRow
              label="Workspace"
              value="Forge"
            />

            <ConfigurationRow
              label="Execution"
              value="Backend"
            />

            <ConfigurationRow
              label="Capability"
              value={
                isASR
                  ? "Speech Recognition"
                  : "Language / Chat"
              }
            />

            <ConfigurationRow
              label="Status"
              value="Active"
            />
          </div>
        </section>
      </div>

      <div className="mt-8">
        <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
          N-ATLAS model configuration
        </div>

        <section className="border border-[#2C3240] bg-[#151922]">
          <div className="grid gap-0 md:grid-cols-2">
            <ConfigurationInput
              label="Model"
              value={
                configuration.model
              }
              onChange={
                updateModel
              }
              type="select"
              options={[
                {
                  group:
                    "Language models",
                  options:
                    NATLAS_CHAT_MODELS
                },
                {
                  group:
                    "Speech recognition models",
                  options:
                    NATLAS_ASR_MODELS
                }
              ]}
            />

            <ConfigurationInput
              label="Default language"
              value={
                configuration.default_language
              }
              onChange={(value) =>
                updateConfiguration(
                  "default_language",
                  value
                )
              }
              type="select"
              options={[
                {
                  value: "english",
                  label: "English"
                },
                {
                  value: "pidgin",
                  label: "Nigerian Pidgin"
                },
                {
                  value: "yoruba",
                  label: "Yoruba"
                },
                {
                  value: "hausa",
                  label: "Hausa"
                },
                {
                  value: "igbo",
                  label: "Igbo"
                }
              ]}
            />
          </div>

          {isChat && (
            <>
              <div className="grid gap-0 md:grid-cols-2 border-t border-[#2C3240]">
                <ConfigurationInput
                  label="Temperature"
                  value={
                    configuration.temperature
                  }
                  onChange={(value) =>
                    updateNumber(
                      "temperature",
                      value
                    )
                  }
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                />

                <ConfigurationInput
                  label="Max tokens"
                  value={
                    configuration.max_tokens
                  }
                  onChange={(value) =>
                    updateNumber(
                      "max_tokens",
                      value
                    )
                  }
                  type="number"
                  min="1"
                  max="8192"
                  step="1"
                />

                <ConfigurationInput
                  label="Context size"
                  value={
                    configuration.context_size
                  }
                  onChange={(value) =>
                    updateNumber(
                      "context_size",
                      value
                    )
                  }
                  type="number"
                  min="512"
                  max="32768"
                  step="512"
                />

                <ConfigurationInput
                  label="Top P"
                  value={
                    configuration.top_p
                  }
                  onChange={(value) =>
                    updateNumber(
                      "top_p",
                      value
                    )
                  }
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                />

                <ConfigurationInput
                  label="Top K"
                  value={
                    configuration.top_k
                  }
                  onChange={(value) =>
                    updateNumber(
                      "top_k",
                      value
                    )
                  }
                  type="number"
                  min="0"
                  max="200"
                  step="1"
                />

                <ConfigurationInput
                  label="Repetition penalty"
                  value={
                    configuration.repetition_penalty
                  }
                  onChange={(value) =>
                    updateNumber(
                      "repetition_penalty",
                      value
                    )
                  }
                  type="number"
                  min="0.5"
                  max="2"
                  step="0.05"
                />

                <ConfigurationInput
                  label="CPU threads"
                  value={
                    configuration.threads
                  }
                  onChange={(value) =>
                    updateNumber(
                      "threads",
                      value
                    )
                  }
                  type="number"
                  min="1"
                  max="64"
                  step="1"
                />

                <ConfigurationInput
                  label="Batch size"
                  value={
                    configuration.batch_size
                  }
                  onChange={(value) =>
                    updateNumber(
                      "batch_size",
                      value
                    )
                  }
                  type="number"
                  min="1"
                  max="4096"
                  step="1"
                />

                <ConfigurationInput
                  label="GPU layers"
                  value={
                    configuration.gpu_layers
                  }
                  onChange={(value) =>
                    updateNumber(
                      "gpu_layers",
                      value
                    )
                  }
                  type="number"
                  min="0"
                  max="999"
                  step="1"
                />
              </div>
            </>
          )}

          {isASR && (
            <div className="border-t border-[#2C3240]">
              <SpeechRecognitionPanel
                selectedModel={selectedModel}
                audioFile={audioFile}
                audioUrl={audioUrl}
                recording={recording}
                recordingTime={recordingTime}
                transcribing={
                  transcribing
                }
                transcription={
                  transcription
                }
                error={speechError}
                onAudioSelected={
                  handleAudioSelected
                }
                onStartRecording={
                  startRecording
                }
                onStopRecording={
                  stopRecording
                }
                onTranscribe={
                  transcribe
                }
                formatRecordingTime={
                  formatRecordingTime
                }
              />
            </div>
          )}
        </section>
      </div>

      {isChat && (
        <div className="mt-8">
          <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#697183]">
            Behavior
          </div>

          <section className="border border-[#2C3240] bg-[#151922] p-5">
            <label className="block">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
                System prompt
              </span>

              <textarea
                value={
                  configuration.system_prompt
                }
                onChange={(e) =>
                  updateConfiguration(
                    "system_prompt",
                    e.target.value
                  )
                }
                rows={9}
                className="mt-3 w-full resize-y border border-[#303746] bg-[#11151E] p-4 text-sm leading-7 text-[#C2C6D0] outline-none placeholder:text-[#596174] focus:border-[#41496A]"
                placeholder="Define the behavior N-ATLAS should follow for this project..."
              />
            </label>
          </section>
        </div>
      )}

      <div className="mt-6 border border-[#303746] bg-[#11151E] p-5">
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#697183]">
          Configuration note
        </div>

        <p className="mt-3 max-w-3xl text-xs leading-6 text-[#697183]">
          {isASR
            ? "Speech recognition projects use the selected N-ATLAS ASR model to convert uploaded or recorded audio into text. The transcription is executed by the Forge backend using the configured N-ATLAS speech model."
            : "Language-model projects use the saved model, system prompt, generation settings and local runtime settings when Forge sends an inference request."}
        </p>
      </div>
    </div>
  );
}

function SpeechRecognitionPanel({
  selectedModel,
  audioFile,
  audioUrl,
  recording,
  recordingTime,
  transcribing,
  transcription,
  error,
  onAudioSelected,
  onStartRecording,
  onStopRecording,
  onTranscribe,
  formatRecordingTime
}) {
  return (
    <div className="p-5">
      <div className="mb-6">
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#697183]">
          Speech recognition
        </div>

        <div className="mt-2 text-sm text-[#AEB5C5]">
          {selectedModel?.label ||
            "N-ATLAS ASR"}
        </div>

        <p className="mt-2 max-w-2xl text-xs leading-6 text-[#697183]">
          Upload an audio file or record speech
          directly in Forge. The selected N-ATLAS
          speech model will process the audio through
          the Forge backend.
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 border border-[#49323A] bg-[#21191E] px-4 py-3 text-xs leading-5 text-[#C88B91]">
          <X
            size={14}
            className="mt-0.5 shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="group cursor-pointer border border-dashed border-[#353C4A] bg-[#11151E] p-6 transition hover:border-[#4A536A] hover:bg-[#151A24]">
          <input
            type="file"
            accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac"
            className="hidden"
            onChange={(event) => {
              const file =
                event.target.files?.[0];

              onAudioSelected(file);

              /*
               * Allow selecting the same file
               * again later.
               */
              event.target.value = "";
            }}
          />

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#303746] bg-[#151922] text-[#7888FF]">
              <Upload
                size={17}
                strokeWidth={1.5}
              />
            </div>

            <div>
              <div className="text-sm text-[#D5D8E0]">
                Upload audio
              </div>

              <div className="mt-1 text-xs leading-5 text-[#697183]">
                WAV, MP3, M4A, OGG or FLAC
              </div>

              <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#596174]">
                Maximum 25 MB
              </div>
            </div>
          </div>
        </label>

        <button
          type="button"
          onClick={
            recording
              ? onStopRecording
              : onStartRecording
          }
          className={`border p-6 text-left transition ${
            recording
              ? "border-[#68404A] bg-[#21191E]"
              : "border-[#353C4A] bg-[#11151E] hover:border-[#4A536A] hover:bg-[#151A24]"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center border ${
                recording
                  ? "border-[#68404A] bg-[#281A20] text-[#C06C76]"
                  : "border-[#303746] bg-[#151922] text-[#7888FF]"
              }`}
            >
              {recording ? (
                <Square
                  size={15}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              ) : (
                <Mic
                  size={17}
                  strokeWidth={1.5}
                />
              )}
            </div>

            <div>
              <div className="text-sm text-[#D5D8E0]">
                {recording
                  ? "Stop recording"
                  : "Record audio"}
              </div>

              <div className="mt-1 text-xs leading-5 text-[#697183]">
                {recording
                  ? formatRecordingTime(
                      recordingTime
                    )
                  : "Use your microphone directly"}
              </div>

              {recording && (
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#C06C76]">
                  Recording
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      {audioFile && (
        <div className="mt-5 border border-[#303746] bg-[#11151E]">
          <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#596174]">
                Selected audio
              </div>

              <div className="mt-1 truncate text-sm text-[#C2C6D0]">
                {audioFile.name}
              </div>

              <div className="mt-1 font-mono text-[9px] text-[#596174]">
                {formatFileSize(
                  audioFile.size
                )}
              </div>
            </div>

            <ForgeButton
              onClick={
                onTranscribe
              }
              disabled={
                transcribing ||
                recording
              }
            >
              {transcribing ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                  Transcribing
                </>
              ) : (
                <>
                  <Mic size={15} />
                  Transcribe
                </>
              )}
            </ForgeButton>
          </div>

          {audioUrl && (
            <div className="border-t border-[#2C3240] px-4 py-4">
              <audio
                controls
                src={audioUrl}
                className="h-9 w-full"
              />
            </div>
          )}
        </div>
      )}

      {transcription && (
        <div className="mt-6 border border-[#303746] bg-[#11151E]">
          <div className="flex flex-col gap-3 border-b border-[#2C3240] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#697183]">
                Transcription
              </div>

              <div className="mt-1 text-xs text-[#596174]">
                N-ATLAS ASR result
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {transcription.duration_seconds != null && (
                <MetaBadge>
                  Duration{" "}
                  {Number(
                    transcription.duration_seconds
                  ).toFixed(2)}
                  s
                </MetaBadge>
              )}

              {transcription.latency_ms != null && (
                <MetaBadge>
                  Latency{" "}
                  {Number(
                    transcription.latency_ms
                  ).toFixed(0)}
                  ms
                </MetaBadge>
              )}

              {transcription.sample_rate != null && (
                <MetaBadge>
                  {transcription.sample_rate} Hz
                </MetaBadge>
              )}
            </div>
          </div>

          <div className="p-5">
            <div className="whitespace-pre-wrap text-sm leading-7 text-[#D5D8E0]">
              {transcription.text ||
                "No speech was detected."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetaBadge({
  children
}) {
  return (
    <span className="border border-[#303746] bg-[#151922] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#697183]">
      {children}
    </span>
  );
}

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 B";
  }

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

function ConfigurationInput({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
  step,
  options
}) {
  return (
    <div className="border-b border-r border-[#2C3240] p-5 last:border-b-0 md:[&:nth-child(2n)]:border-r-0">
      <label className="block">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183]">
          {label}
        </span>

        {type === "select" ? (
          <select
            value={value}
            onChange={(e) =>
              onChange(
                e.target.value
              )
            }
            className="mt-3 w-full border border-[#303746] bg-[#11151E] px-3 py-3 text-xs text-[#C2C6D0] outline-none focus:border-[#41496A]"
          >
            {options?.map(
              (option) =>
                option.options ? (
                  <optgroup
                    key={option.group}
                    label={option.group}
                  >
                    {option.options.map(
                      (item) => (
                        <option
                          key={
                            item.value
                          }
                          value={
                            item.value
                          }
                        >
                          {item.label}
                        </option>
                      )
                    )}
                  </optgroup>
                ) : (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
            )}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) =>
              onChange(
                e.target.value
              )
            }
            className="mt-3 w-full border border-[#303746] bg-[#11151E] px-3 py-3 font-mono text-xs text-[#C2C6D0] outline-none focus:border-[#41496A]"
          />
        )}
      </label>
    </div>
  );
}

function ConfigurationRow({
  label,
  value
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-5">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#596174]">
        {label}
      </span>

      <span className="break-all text-right font-mono text-xs text-[#AEB5C5]">
        {value}
      </span>
    </div>
  );
}
