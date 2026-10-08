import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  History,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X
} from "lucide-react";

import { api } from "../../../api/client";

import {
  ForgeButton,
  ForgeEmptyState,
  ForgeLoading,
  PageHeader
} from "../components/ForgeShared";


function formatBytes(bytes) {
  if (!bytes || bytes <= 0) {
    return "—";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];

  let value = bytes;
  let index = 0;

  while (
    value >= 1024 &&
    index < units.length - 1
  ) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(
    value >= 10 || index === 0
      ? 0
      : 1
  )} ${units[index]}`;
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(date);
}


function formatRelativeDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const diff =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    diff / 60000
  );

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 30) {
    return `${days}d ago`;
  }

  return formatDate(value);
}


function getFormatIcon(format) {
  const normalized =
    String(format || "")
      .toLowerCase();

  if (normalized === "csv") {
    return FileSpreadsheet;
  }

  if (
    normalized === "json" ||
    normalized === "jsonl"
  ) {
    return FileJson;
  }

  return FileText;
}


function formatLabel(format) {
  return String(format || "")
    .toUpperCase();
}


function SchemaPreview({
  schema
}) {
  const fields = Object.entries(
    schema || {}
  );

  if (!fields.length) {
    return (
      <div className="py-8 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[#596174]">
        No schema information available.
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden border border-[#2C3240]">
      <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(70px,1fr)_minmax(65px,0.7fr)] gap-0 border-b border-[#2C3240] bg-[#11151E] px-3 py-3 font-mono text-[8px] uppercase tracking-[0.16em] text-[#697183] sm:px-4">
        <span className="min-w-0">Field</span>
        <span className="min-w-0">Type</span>
        <span className="min-w-0">Presence</span>
      </div>

      {fields.map(
        ([field, details]) => {
          const presence =
            details?.present ?? 0;

          const missing =
            details?.missing ?? 0;

          const total =
            presence + missing;

          const percentage =
            total > 0
              ? Math.round(
                  (presence / total) *
                    100
                )
              : 0;

          return (
            <div
              key={field}
              className="grid grid-cols-[minmax(0,1.5fr)_minmax(70px,1fr)_minmax(65px,0.7fr)] gap-0 border-b border-[#2C3240] px-3 py-3 text-xs last:border-b-0 sm:px-4"
            >
              <span className="min-w-0 overflow-hidden break-all font-mono text-[#D5D9E2]">
                {field}
              </span>

              <span className="min-w-0 overflow-hidden break-words text-[#858D9D]">
                {details?.type ||
                  "unknown"}
              </span>

              <span className="min-w-0 font-mono text-[9px] text-[#697183]">
                {percentage}%
              </span>
            </div>
          );
        }
      )}
    </div>
  );
}


function RecordValue({
  value
}) {
  if (
    value === null ||
    value === undefined
  ) {
    return (
      <span className="text-[#596174]">
        null
      </span>
    );
  }

  if (
    typeof value === "object"
  ) {
    let serialized = "";

    try {
      serialized =
        JSON.stringify(value);
    } catch {
      serialized =
        "[unserializable value]";
    }

    return (
      <span className="block max-w-full whitespace-pre-wrap break-all font-mono text-[10px] text-[#858D9D]">
        {serialized}
      </span>
    );
  }

  return (
    <span className="block max-w-full whitespace-pre-wrap break-words text-[#B7BDCA]">
      {String(value)}
    </span>
  );
}


function RecordsPreview({
  records,
  loading
}) {
  const columns = useMemo(() => {
    const set = new Set();

    records.forEach(
      (record) => {
        Object.keys(
          record || {}
        ).forEach((key) =>
          set.add(key)
        );
      }
    );

    return Array.from(set).slice(
      0,
      8
    );
  }, [records]);

  if (loading) {
    return (
      <div className="flex min-w-0 items-center gap-3 py-12 font-mono text-[9px] uppercase tracking-[0.16em] text-[#697183]">
        <Loader2
          size={13}
          className="shrink-0 animate-spin text-[#7181FF]"
        />
        Loading records
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="w-full max-w-full overflow-hidden border border-[#2C3240] bg-[#11151E] px-5 py-10 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[#596174]">
        No records match this search.
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-auto overscroll-x-contain border border-[#2C3240]">
      <table className="w-full min-w-[680px] border-collapse">
        <thead>
          <tr className="border-b border-[#2C3240] bg-[#11151E]">
            <th className="w-12 px-3 py-3 text-left font-mono text-[8px] uppercase tracking-[0.14em] text-[#596174] sm:px-4">
              #
            </th>

            {columns.map(
              (column) => (
                <th
                  key={column}
                  className="max-w-[220px] px-3 py-3 text-left font-mono text-[8px] uppercase tracking-[0.14em] text-[#697183] sm:px-4"
                >
                  <span className="block max-w-[220px] overflow-hidden break-all">
                    {column}
                  </span>
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {records.map(
            (record, index) => (
              <tr
                key={index}
                className="border-b border-[#2C3240] align-top last:border-b-0"
              >
                <td className="px-3 py-3 font-mono text-[9px] text-[#596174] sm:px-4">
                  {index + 1}
                </td>

                {columns.map(
                  (column) => (
                    <td
                      key={column}
                      className="w-[180px] max-w-[220px] px-3 py-3 text-xs sm:px-4"
                    >
                      <div className="max-w-[220px] overflow-hidden break-words">
                        <RecordValue
                          value={
                            record?.[
                              column
                            ]
                          }
                        />
                      </div>
                    </td>
                  )
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}


function DatasetDetail({
  project,
  dataset,
  onClose,
  onDeleted,
  onVersionCreated
}) {
  const [records, setRecords] =
    useState([]);

  const [totalRecords, setTotalRecords] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [offset, setOffset] =
    useState(0);

  const [loadingRecords, setLoadingRecords] =
    useState(false);

  const [versions, setVersions] =
    useState([]);

  const [loadingVersions, setLoadingVersions] =
    useState(false);

  const [versionUploading, setVersionUploading] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const limit = 25;

  async function loadRecords() {
    if (!project?.id || !dataset?.id) {
      return;
    }

    setLoadingRecords(true);
    setError("");

    try {
      const data =
        await api.datasets.records(
          project.id,
          dataset.id,
          {
            search,
            offset,
            limit
          }
        );

      setRecords(
        Array.isArray(
          data?.records
        )
          ? data.records
          : []
      );

      setTotalRecords(
        Number(data?.total || 0)
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load dataset records."
      );
    } finally {
      setLoadingRecords(false);
    }
  }

  async function loadVersions() {
    if (!project?.id || !dataset?.id) {
      return;
    }

    setLoadingVersions(true);

    try {
      const data =
        await api.datasets.versions(
          project.id,
          dataset.id
        );

      setVersions(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load dataset versions."
      );
    } finally {
      setLoadingVersions(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, [
    project?.id,
    dataset?.id,
    search,
    offset
  ]);

  useEffect(() => {
    loadVersions();
  }, [
    project?.id,
    dataset?.id
  ]);

  async function download() {
    setDownloading(true);
    setError("");

    try {
      const blob =
        await api.datasets.download(
          project.id,
          dataset.id
        );

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download =
        dataset.name ||
        `dataset.${dataset.format}`;

      document.body.appendChild(
        anchor
      );

      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err?.message ||
          "Dataset download failed."
      );
    } finally {
      setDownloading(false);
    }
  }

  async function deleteDataset() {
    const confirmed =
      window.confirm(
        `Delete "${dataset.name}"? This will permanently remove the dataset and all of its versions.`
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await api.datasets.delete(
        project.id,
        dataset.id
      );

      onDeleted(
        dataset.id
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to delete dataset."
      );
    } finally {
      setDeleting(false);
    }
  }

  async function uploadVersion(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setVersionUploading(true);
    setError("");

    try {
      const updated =
        await api.datasets.createVersion(
          project.id,
          dataset.id,
          file
        );

      onVersionCreated(
        updated
      );

      await loadVersions();

      setOffset(0);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to create dataset version."
      );
    } finally {
      setVersionUploading(false);
      event.target.value = "";
    }
  }

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRecords / limit
      )
    );

  const currentPage =
    Math.floor(
      offset / limit
    ) + 1;

  const FormatIcon =
    getFormatIcon(
      dataset.format
    );

  const report =
    dataset.validation_report ||
    {};

  const duplicateCount =
    Number(
      report.duplicate_count || 0
    );

  const emptyFieldCount =
    Number(
      report.empty_field_count || 0
    );

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-full max-w-full overflow-x-hidden overflow-y-auto bg-[#0B0E14]/95 backdrop-blur-sm">
      <div className="mx-auto min-h-[100dvh] w-full max-w-7xl overflow-x-hidden border-x border-[#2C3240] bg-[#0E1118]">

        <div className="sticky top-0 z-10 flex min-w-0 items-center justify-between gap-3 border-b border-[#2C3240] bg-[#0E1118]/95 px-4 py-3 backdrop-blur sm:px-8 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-w-0 max-w-full items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#697183] transition hover:text-[#E1E4EA]"
          >
            <ChevronLeft
              size={14}
              className="shrink-0"
            />

            <span className="truncate">
              Back to datasets
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dataset"
            className="shrink-0 border border-[#303746] p-2 text-[#697183] transition hover:border-[#41496A] hover:text-[#E1E4EA]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="min-w-0 p-4 sm:p-8 lg:p-10">

          {error && (
            <div className="mb-7 flex min-w-0 items-start gap-3 overflow-hidden border border-[#49323A] bg-[#21191E] px-4 py-3 text-sm text-[#C88B91]">
              <AlertTriangle
                size={15}
                className="mt-0.5 shrink-0"
              />

              <span className="min-w-0 break-words">
                {error}
              </span>
            </div>
          )}

          <div className="flex min-w-0 flex-col justify-between gap-7 border-b border-[#2C3240] pb-8 lg:flex-row lg:items-start">

            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#303746] bg-[#151922]">
                  <FormatIcon
                    size={17}
                    className="text-[#8C9AFF]"
                  />
                </div>

                <div className="min-w-0">
                  <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#697183]">
                    Dataset
                  </div>

                  <h1 className="mt-1 max-w-full break-words font-display text-2xl font-semibold tracking-[-0.05em] text-[#E6E8EF] sm:text-4xl">
                    {dataset.name}
                  </h1>
                </div>
              </div>

              {dataset.description && (
                <p className="mt-5 max-w-2xl break-words text-sm leading-7 text-[#697183]">
                  {dataset.description}
                </p>
              )}

              <div className="mt-5 flex min-w-0 flex-wrap gap-2">
                <span className="max-w-full break-all border border-[#303746] bg-[#11151E] px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#858D9D]">
                  {formatLabel(
                    dataset.format
                  )}
                </span>

                <span className="max-w-full break-all border border-[#303746] bg-[#11151E] px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#858D9D]">
                  v{dataset.latest_version}
                </span>

                <span className="max-w-full break-all border border-[#303746] bg-[#11151E] px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#858D9D]">
                  Fixture ready
                </span>
              </div>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
              <label className="inline-flex min-w-0 cursor-pointer items-center justify-center gap-2 border border-[#303746] bg-[#11151E] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#AEB5C5] transition hover:border-[#41496A] hover:text-[#E1E4EA]">
                {versionUploading ? (
                  <Loader2
                    size={14}
                    className="shrink-0 animate-spin"
                  />
                ) : (
                  <RefreshCw
                    size={14}
                    className="shrink-0"
                  />
                )}

                <span className="truncate">
                  New version
                </span>

                <input
                  type="file"
                  accept=".json,.jsonl,.csv"
                  onChange={
                    uploadVersion
                  }
                  hidden
                  disabled={
                    versionUploading
                  }
                />
              </label>

              <button
                type="button"
                onClick={download}
                disabled={downloading}
                className="inline-flex min-w-0 items-center justify-center gap-2 border border-[#303746] bg-[#11151E] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#AEB5C5] transition hover:border-[#41496A] hover:text-[#E1E4EA] disabled:opacity-40"
              >
                {downloading ? (
                  <Loader2
                    size={14}
                    className="shrink-0 animate-spin"
                  />
                ) : (
                  <Download
                    size={14}
                    className="shrink-0"
                  />
                )}

                Download
              </button>

              <button
                type="button"
                onClick={deleteDataset}
                disabled={deleting}
                className="inline-flex min-w-0 items-center justify-center gap-2 border border-[#59343B] bg-[#2A1C21] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#C88B91] transition hover:border-[#6A3C45] hover:bg-[#312026] disabled:opacity-40"
              >
                {deleting ? (
                  <Loader2
                    size={14}
                    className="shrink-0 animate-spin"
                  />
                ) : (
                  <Trash2
                    size={14}
                    className="shrink-0"
                  />
                )}

                Delete
              </button>
            </div>
          </div>

          <div className="mt-8 grid min-w-0 grid-cols-2 border border-[#2C3240] sm:grid-cols-4">

            <div className="min-w-0 border-r border-b border-[#2C3240] p-4 sm:border-b-0 sm:p-5">
              <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#596174]">
                Records
              </div>

              <div className="mt-3 break-words font-display text-2xl font-semibold text-[#E1E4EA]">
                {Number(
                  dataset.record_count || 0
                ).toLocaleString()}
              </div>
            </div>

            <div className="min-w-0 border-b border-[#2C3240] p-4 sm:border-b-0 sm:border-r sm:p-5">
              <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#596174]">
                Fields
              </div>

              <div className="mt-3 break-words font-display text-2xl font-semibold text-[#E1E4EA]">
                {dataset.field_count ||
                  0}
              </div>
            </div>

            <div className="min-w-0 border-r border-[#2C3240] p-4 sm:p-5">
              <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#596174]">
                Size
              </div>

              <div className="mt-3 break-words font-display text-2xl font-semibold text-[#E1E4EA]">
                {formatBytes(
                  dataset.size_bytes
                )}
              </div>
            </div>

            <div className="min-w-0 p-4 sm:p-5">
              <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#596174]">
                Updated
              </div>

              <div className="mt-3 break-words text-xs text-[#858D9D]">
                {formatRelativeDate(
                  dataset.updated_at
                )}
              </div>
            </div>

          </div>

          {(duplicateCount > 0 ||
            emptyFieldCount > 0) && (
            <div className="mt-5 flex min-w-0 flex-wrap gap-3">
              {duplicateCount > 0 && (
                <div className="inline-flex max-w-full items-center gap-2 break-words border border-[#493F2E] bg-[#211D16] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#B9A77C]">
                  <AlertTriangle
                    size={12}
                    className="shrink-0"
                  />

                  <span>
                    {duplicateCount} duplicate
                    {duplicateCount === 1
                      ? ""
                      : "s"}
                  </span>
                </div>
              )}

              {emptyFieldCount > 0 && (
                <div className="inline-flex max-w-full items-center gap-2 break-words border border-[#493F2E] bg-[#211D16] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#B9A77C]">
                  <AlertTriangle
                    size={12}
                    className="shrink-0"
                  />

                  <span>
                    {emptyFieldCount} empty field
                    {emptyFieldCount === 1
                      ? ""
                      : "s"}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mt-10 grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">

            <section className="min-w-0">
              <div className="mb-4 flex min-w-0 items-end justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#596174]">
                    Data explorer
                  </div>

                  <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.04em] text-[#E1E4EA]">
                    Records
                  </h2>
                </div>

                <div className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
                  {totalRecords.toLocaleString()} matches
                </div>
              </div>

              <div className="mb-4 flex min-w-0 items-center border border-[#303746] bg-[#11151E]">
                <Search
                  size={14}
                  className="ml-3 shrink-0 text-[#596174]"
                />

                <input
                  value={search}
                  onChange={(event) => {
                    setOffset(0);
                    setSearch(
                      event.target.value
                    );
                  }}
                  placeholder="Search records..."
                  className="min-w-0 w-full bg-transparent px-3 py-3 text-xs text-[#C2C6D0] outline-none placeholder:text-[#596174]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setOffset(0);
                      setSearch("");
                    }}
                    className="mr-2 shrink-0 p-1 text-[#596174] hover:text-[#E1E4EA]"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <RecordsPreview
                records={records}
                loading={
                  loadingRecords
                }
              />

              {totalRecords > 0 && (
                <div className="mt-4 flex min-w-0 items-center justify-between gap-4 border border-[#2C3240] bg-[#11151E] px-3 py-3 sm:px-4">
                  <span className="min-w-0 truncate font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
                    Page {currentPage} /{" "}
                    {totalPages}
                  </span>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={
                        currentPage <= 1
                      }
                      onClick={() =>
                        setOffset(
                          Math.max(
                            0,
                            offset - limit
                          )
                        )
                      }
                      className="border border-[#303746] p-2 text-[#697183] transition hover:text-[#E1E4EA] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft
                        size={14}
                      />
                    </button>

                    <button
                      type="button"
                      disabled={
                        currentPage >=
                        totalPages
                      }
                      onClick={() =>
                        setOffset(
                          offset + limit
                        )
                      }
                      className="border border-[#303746] p-2 text-[#697183] transition hover:text-[#E1E4EA] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight
                        size={14}
                      />
                    </button>
                  </div>
                </div>
              )}
            </section>

            <aside className="min-w-0 space-y-8">

              <section className="min-w-0">
                <div className="mb-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#596174]">
                    Structure
                  </div>

                  <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.04em] text-[#E1E4EA]">
                    Schema
                  </h2>
                </div>

                <SchemaPreview
                  schema={
                    dataset.schema
                  }
                />
              </section>

              <section className="min-w-0">
                <div className="mb-4 flex min-w-0 items-end justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#596174]">
                      Dataset history
                    </div>

                    <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.04em] text-[#E1E4EA]">
                      Versions
                    </h2>
                  </div>

                  <History
                    size={15}
                    className="shrink-0 text-[#596174]"
                  />
                </div>

                <div className="w-full max-w-full overflow-hidden border border-[#2C3240]">
                  {loadingVersions ? (
                    <div className="flex min-w-0 items-center gap-2 p-5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
                      <Loader2
                        size={12}
                        className="shrink-0 animate-spin"
                      />
                      Loading history
                    </div>
                  ) : versions.length ===
                    0 ? (
                    <div className="p-5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#596174]">
                      No version history.
                    </div>
                  ) : (
                    versions.map(
                      (version) => (
                        <div
                          key={
                            version.id
                          }
                          className="min-w-0 border-b border-[#2C3240] p-4 last:border-b-0"
                        >
                          <div className="flex min-w-0 items-center justify-between gap-3">
                            <span className="font-mono text-[10px] text-[#C2C6D0]">
                              v
                              {
                                version.version
                              }
                            </span>

                            {version.version ===
                              dataset.latest_version && (
                              <span className="shrink-0 font-mono text-[7px] uppercase tracking-[0.12em] text-[#8C9AFF]">
                                Current
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex min-w-0 flex-wrap items-center justify-between gap-3">
                            <span className="min-w-0 break-words text-xs text-[#697183]">
                              {Number(
                                version.record_count ||
                                  0
                              ).toLocaleString()}{" "}
                              records
                            </span>

                            <span className="shrink-0 font-mono text-[8px] text-[#596174]">
                              {formatRelativeDate(
                                version.created_at
                              )}
                            </span>
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </section>

              <section className="min-w-0 border border-[#2C3240] bg-[#151922] p-4 sm:p-5">
                <div className="flex min-w-0 items-center gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-[#596174]">
                  <Clock3
                    size={12}
                    className="shrink-0"
                  />
                  <span>
                    Dataset lifecycle
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-xs leading-6 text-[#697183]">
                  <div className="flex min-w-0 flex-col gap-1 border-b border-[#2C3240] pb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <span className="shrink-0">
                      Created
                    </span>

                    <span className="break-words text-left text-[#858D9D] sm:text-right">
                      {formatDate(
                        dataset.created_at
                      )}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1 border-b border-[#2C3240] pb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <span className="shrink-0">
                      Updated
                    </span>

                    <span className="break-words text-left text-[#858D9D] sm:text-right">
                      {formatDate(
                        dataset.updated_at
                      )}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <span className="shrink-0">
                      Latest version
                    </span>

                    <span className="font-mono break-words text-[#858D9D] sm:text-right">
                      v
                      {
                        dataset.latest_version
                      }
                    </span>
                  </div>
                </div>
              </section>

            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function Datasets({
  project
}) {
  const [datasets, setDatasets] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedDataset, setSelectedDataset] =
    useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!project?.id) {
        setDatasets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data =
          await api.datasets.list(
            project.id
          );

        if (cancelled) {
          return;
        }

        setDatasets(
          Array.isArray(data)
            ? data
            : data?.datasets || []
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load datasets."
          );
        }
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
  }, [
    project?.id
  ]);

  async function upload(event) {
    const file =
      event.target.files?.[0];

    if (!file || !project?.id) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const dataset =
        await api.datasets.upload(
          project.id,
          file,
          {
            name: file.name
          }
        );

      setDatasets(
        (current) => [
          dataset,
          ...current
        ]
      );

      setSelectedDataset(
        dataset
      );
    } catch (err) {
      setError(
        err?.message ||
          "Dataset upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function refreshDataset(
    datasetId
  ) {
    try {
      const updated =
        await api.datasets.get(
          project.id,
          datasetId
        );

      setDatasets(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              datasetId
                ? updated
                : item
          )
      );

      setSelectedDataset(
        updated
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to refresh dataset."
      );
    }
  }

  function handleDeleted(
    datasetId
  ) {
    setDatasets(
      (current) =>
        current.filter(
          (item) =>
            item.id !== datasetId
        )
    );

    setSelectedDataset(
      null
    );
  }

  const filteredDatasets =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return datasets;
      }

      return datasets.filter(
        (dataset) =>
          String(
            dataset.name || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            dataset.description ||
              ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            dataset.format || ""
          )
            .toLowerCase()
            .includes(query)
      );
    }, [
      datasets,
      search
    ]);

  const totalRecords =
    datasets.reduce(
      (sum, dataset) =>
        sum +
        Number(
          dataset.record_count ||
            0
        ),
      0
    );

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <PageHeader
        eyebrow="03 / Dataset Studio"
        title="Project data."
        description="Manage datasets, fixtures and seed data for your application. Inspect structure, preview records, track versions and keep test inputs close to the code they support."
        action={
          <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-[#41496A] bg-[#7181FF] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white transition hover:bg-[#8492FF] sm:w-auto">
            {uploading ? (
              <Loader2
                size={15}
                className="shrink-0 animate-spin"
              />
            ) : (
              <Upload
                size={15}
                className="shrink-0"
              />
            )}

            <span className="truncate">
              {uploading
                ? "Uploading"
                : "Upload dataset"}
            </span>

            <input
              type="file"
              accept=".json,.jsonl,.csv"
              onChange={upload}
              hidden
              disabled={
                uploading
              }
            />
          </label>
        }
      />

      {error && (
        <div className="mt-8 flex min-w-0 items-start gap-3 overflow-hidden border border-[#49323A] bg-[#21191E] px-4 py-3 text-sm text-[#C88B91]">
          <AlertTriangle
            size={15}
            className="mt-0.5 shrink-0"
          />

          <span className="min-w-0 break-words">
            {error}
          </span>
        </div>
      )}

      {!loading &&
        datasets.length > 0 && (
          <div className="mt-8 grid min-w-0 grid-cols-2 border border-[#2C3240] sm:grid-cols-4">

            <div className="min-w-0 border-r border-b border-[#2C3240] p-4 sm:border-b-0 sm:p-5">
              <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#596174]">
                Datasets
              </div>

              <div className="mt-3 break-words font-display text-2xl font-semibold text-[#E1E4EA]">
                {datasets.length}
              </div>
            </div>

            <div className="min-w-0 border-b border-[#2C3240] p-4 sm:border-b-0 sm:border-r sm:p-5">
              <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#596174]">
                Records
              </div>

              <div className="mt-3 break-words font-display text-2xl font-semibold text-[#E1E4EA]">
                {totalRecords.toLocaleString()}
              </div>
            </div>

            <div className="min-w-0 border-r border-[#2C3240] p-4 sm:p-5">
              <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#596174]">
                Formats
              </div>

              <div className="mt-3 break-words font-display text-2xl font-semibold text-[#E1E4EA]">
                {
                  new Set(
                    datasets.map(
                      (item) =>
                        item.format
                    )
                  ).size
                }
              </div>
            </div>

            <div className="min-w-0 p-4 sm:p-5">
              <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#596174]">
                Workspace
              </div>

              <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-[#858D9D]">
                <Database
                  size={14}
                  className="shrink-0 text-[#7181FF]"
                />

                <span className="min-w-0 truncate">
                  Project data
                </span>
              </div>
            </div>

          </div>
        )}

      {loading ? (
        <ForgeLoading label="INDEXING PROJECT DATA..." />
      ) : datasets.length === 0 ? (
        <div className="mt-10">
          <ForgeEmptyState
            eyebrow="DATASET WORKSPACE EMPTY"
            title="No project data yet."
            description="Upload JSON, JSONL or CSV files to create reusable project data, fixtures and seed datasets."
          />
        </div>
      ) : (
        <div className="mt-10 min-w-0">

          <div className="mb-5 flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#596174]">
                Project datasets
              </div>

              <div className="mt-2 text-sm text-[#697183]">
                {filteredDatasets.length} dataset
                {filteredDatasets.length ===
                1
                  ? ""
                  : "s"}
              </div>
            </div>

            <div className="flex min-w-0 w-full items-center border border-[#303746] bg-[#11151E] sm:max-w-xs">
              <Search
                size={14}
                className="ml-3 shrink-0 text-[#596174]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search datasets..."
                className="min-w-0 w-full bg-transparent px-3 py-2.5 text-xs text-[#C2C6D0] outline-none placeholder:text-[#596174]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="mr-2 shrink-0 p-1 text-[#596174] hover:text-[#E1E4EA]"
                  aria-label="Clear dataset search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {filteredDatasets.length ===
          0 ? (
            <div className="min-w-0 overflow-hidden border border-[#2C3240] bg-[#151922] p-8 text-center">
              <Search
                size={18}
                className="mx-auto text-[#596174]"
              />

              <div className="mt-4 font-display text-lg font-semibold text-[#E1E4EA]">
                No matching datasets
              </div>

              <div className="mt-2 break-words text-sm text-[#697183]">
                Try a different dataset name,
                description or format.
              </div>
            </div>
          ) : (
            <div className="grid min-w-0 gap-4 lg:grid-cols-2">

              {filteredDatasets.map(
                (dataset) => {
                  const FormatIcon =
                    getFormatIcon(
                      dataset.format
                    );

                  const schemaFields =
                    Object.keys(
                      dataset.schema ||
                        {}
                    );

                  return (
                    <button
                      key={
                        dataset.id
                      }
                      type="button"
                      onClick={() =>
                        setSelectedDataset(
                          dataset
                        )
                      }
                      className="group min-w-0 max-w-full overflow-hidden border border-[#2C3240] bg-[#11151E] p-4 text-left transition hover:border-[#41496A] hover:bg-[#151922] sm:p-5"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-5">

                        <div className="flex min-w-0 items-start gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#303746] bg-[#151922]">
                            <FormatIcon
                              size={17}
                              className="text-[#8C9AFF]"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="max-w-full overflow-hidden break-words font-display text-lg font-semibold tracking-[-0.03em] text-[#E1E4EA]">
                              {
                                dataset.name
                              }
                            </div>

                            <div className="mt-1 break-all font-mono text-[8px] uppercase tracking-[0.13em] text-[#596174]">
                              {
                                formatLabel(
                                  dataset.format
                                )
                              }{" "}
                              · v
                              {
                                dataset.latest_version
                              }
                            </div>
                          </div>

                        </div>

                        <span className="hidden shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-[#7181FF] opacity-0 transition group-hover:opacity-100 sm:inline">
                          Open
                        </span>
                      </div>

                      {dataset.description && (
                        <p className="mt-5 line-clamp-2 break-words text-xs leading-6 text-[#697183]">
                          {
                            dataset.description
                          }
                        </p>
                      )}

                      <div className="mt-5 grid min-w-0 grid-cols-3 border border-[#2C3240] bg-[#0E1118]">
                        <div className="min-w-0 border-r border-[#2C3240] px-2 py-3 sm:px-3">
                          <div className="font-mono text-[7px] uppercase tracking-[0.12em] text-[#596174]">
                            Records
                          </div>

                          <div className="mt-1.5 break-words font-mono text-[10px] text-[#B7BDCA]">
                            {Number(
                              dataset.record_count ||
                                0
                            ).toLocaleString()}
                          </div>
                        </div>

                        <div className="min-w-0 border-r border-[#2C3240] px-2 py-3 sm:px-3">
                          <div className="font-mono text-[7px] uppercase tracking-[0.12em] text-[#596174]">
                            Fields
                          </div>

                          <div className="mt-1.5 break-words font-mono text-[10px] text-[#B7BDCA]">
                            {
                              dataset.field_count
                            }
                          </div>
                        </div>

                        <div className="min-w-0 px-2 py-3 sm:px-3">
                          <div className="font-mono text-[7px] uppercase tracking-[0.12em] text-[#596174]">
                            Size
                          </div>

                          <div className="mt-1.5 break-words font-mono text-[10px] text-[#B7BDCA]">
                            {formatBytes(
                              dataset.size_bytes
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-wrap gap-1.5">
                          {schemaFields
                            .slice(
                              0,
                              4
                            )
                            .map(
                              (
                                field
                              ) => (
                                <span
                                  key={
                                    field
                                  }
                                  className="block max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap border border-[#303746] px-2 py-1 font-mono text-[7px] text-[#596174]"
                                >
                                  {
                                    field
                                  }
                                </span>
                              )
                            )}

                          {schemaFields.length >
                            4 && (
                            <span className="shrink-0 border border-[#303746] px-2 py-1 font-mono text-[7px] text-[#596174]">
                              +
                              {schemaFields.length -
                                4}
                            </span>
                          )}
                        </div>

                        <span className="shrink-0 font-mono text-[8px] text-[#596174] sm:text-right">
                          {formatRelativeDate(
                            dataset.updated_at
                          )}
                        </span>
                      </div>
                    </button>
                  );
                }
              )}

            </div>
          )}
        </div>
      )}

      {selectedDataset && (
        <DatasetDetail
          project={project}
          dataset={
            selectedDataset
          }
          onClose={() =>
            setSelectedDataset(
              null
            )
          }
          onDeleted={
            handleDeleted
          }
          onVersionCreated={
            refreshDataset
          }
        />
      )}
    </div>
  );
}