
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
type ReportStatus =
  | "Pending"
  | "Investigating"
  | "Resolved"
  | "Rejected";

type Report = {
  id: string;
  title: string;
  location: string;
  date: string;
  priority: "High" | "Medium" | "Low";
  status: ReportStatus;
  description: string;
  reporter: string;
};

const sampleReports: Report[] = [
  {
    id: "SORO-001",
    title: "Suspicious activity near lecture hall",
    location: "Lecture Hall",
    date: "October 23, 2026",
    priority: "High",
    status: "Pending",
    description:
      "A suspicious activity was reported near the lecture hall. The incident requires review by the campus safety team.",
    reporter: "Sample Reporter 1",
  },
  {
    id: "SORO-002",
    title: "Lost student identification card",
    location: "Faculty Building",
    date: "October 22, 2026",
    priority: "Medium",
    status: "Investigating",
    description:
      "A student reported a missing identification card around the faculty building.",
    reporter: "Sample Reporter 2",
  },
  {
    id: "SORO-003",
    title: "Damaged campus streetlight",
    location: "Main Campus Road",
    date: "October 21, 2026",
    priority: "Low",
    status: "Resolved",
    description:
      "A damaged streetlight was reported along the main campus road.",
    reporter: "Sample Reporter 3",
  },
  {
    id: "SORO-004",
    title: "Reported theft near hostel",
    location: "Student Hostel",
    date: "October 20, 2026",
    priority: "High",
    status: "Pending",
    description:
      "A theft incident was reported near a student hostel. The report needs to be reviewed.",
    reporter: "Sample Reporter 4",
  },
  {
    id: "SORO-005",
    title: "Damaged classroom door",
    location: "Science Faculty",
    date: "October 19, 2026",
    priority: "Low",
    status: "Rejected",
    description:
      "This sample report could not be verified.",
    reporter: "Sample Reporter 5",
  },
];

function statusStyle(status: ReportStatus) {
  switch (status) {
    case "Pending":
      return "bg-amber-100 text-amber-800";
    case "Investigating":
      return "bg-blue-100 text-blue-800";
    case "Resolved":
      return "bg-green-100 text-green-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
  }
}

function AdminReportDetailsContent() {
  const params = useParams<{ id: string }>();
  const reportId = decodeURIComponent(params.id);

 const [report, setReport] = useState<Report | undefined>(
  sampleReports.find((item) => item.id === reportId)
);
 
  const [status, setStatus] = useState<ReportStatus>(
    report?.status ?? "Pending"
  );

  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [storageReady, setStorageReady] = useState(false);

 useEffect(() => {
  try {
    const submittedReports = JSON.parse(
      localStorage.getItem("soro-submitted-reports") || "[]"
    ) as Report[];

    const allReports = [
      ...sampleReports,
      ...submittedReports.map((item) => ({
        ...item,
        description:
          item.description || "No additional description provided.",
        reporter: item.reporter || "Not provided",
      })),
    ];

    const foundReport = allReports.find(
      (item) => item.id === reportId
    );

    setReport(foundReport);

    if (!foundReport) {
      setStorageReady(true);
      return;
    }

    const savedStatuses = JSON.parse(
      localStorage.getItem("soro-report-statuses") || "{}"
    ) as Record<string, ReportStatus>;

    const savedNotesByReport = JSON.parse(
      localStorage.getItem("soro-report-notes") || "{}"
    ) as Record<string, string[]>;

    setStatus(savedStatuses[foundReport.id] ?? foundReport.status);
    setSavedNotes(savedNotesByReport[foundReport.id] ?? []);
    setStorageReady(true);
  } catch {
    setMessage("Could not load saved report details.");
    setStorageReady(true);
  }
}, [reportId]);

  if (!report) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-bold">
            Report not found
          </h1>

          <p className="mt-3 text-slate-600">
            This ID does not match any report in the current sample data.
          </p>

          <Link
            href="/admin/reports"
            className="mt-6 inline-block font-semibold text-blue-700 hover:underline"
          >
            ← Back to reports
          </Link>
        </div>
      </main>
    );
  }

 
  function saveStatus() {
    if (!storageReady) {
      setMessage("Please wait for the saved report data to load.");
      return;
    }

    try {
      const savedStatuses = JSON.parse(
        localStorage.getItem("soro-report-statuses") || "{}"
      );

      savedStatuses[report.id] = status;

      localStorage.setItem(
        "soro-report-statuses",
        JSON.stringify(savedStatuses)
      );

      setMessage(`Status saved as "${status}" in this browser.`);
    } catch {
      setMessage("Unable to save the status in this browser.");
    }
  }

  function addNote() {
    const trimmedNote = note.trim();

    if (!trimmedNote) {
      setMessage("Please enter a note before adding it.");
      return;
    }

    if (!storageReady) {
      setMessage("Please wait for the saved report data to load.");
      return;
    }

    try {
      const savedNotesByReport = JSON.parse(
        localStorage.getItem("soro-report-notes") || "{}"
      );

      const updatedNotes = [
        ...(savedNotesByReport[report.id] ?? []),
        trimmedNote,
      ];

      savedNotesByReport[report.id] = updatedNotes;

      localStorage.setItem(
        "soro-report-notes",
        JSON.stringify(savedNotesByReport)
      );

      setSavedNotes(updatedNotes);
      setNote("");
      setMessage("Internal note saved in this browser.");
    } catch {
      setMessage("Unable to save the note in this browser.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <Link
            href="/admin/reports"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            ← Back to all reports
          </Link>

          <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                REPORT DETAILS
              </p>

              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                {report.title}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Reference: {report.id}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${statusStyle(status)}`}
            >
              {status}
            </span>
          </div>
        </header>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Preview mode:</strong> This is sample information.
          Status changes and notes are temporary and will not persist
          after the page is refreshed.
        </div>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold">
              Incident Information
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">
                  Incident location
                </p>
                <p className="mt-1 font-semibold">
                  {report.location}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Date reported
                </p>
                <p className="mt-1 font-semibold">
                  {report.date}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Priority
                </p>
                <p
                  className={`mt-1 font-semibold ${
                    report.priority === "High"
                      ? "text-red-700"
                      : report.priority === "Medium"
                        ? "text-amber-700"
                        : "text-green-700"
                  }`}
                >
                  {report.priority}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Reporter
                </p>
                <p className="mt-1 font-semibold">
                  {report.reporter}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="font-semibold">
                Incident Description
              </h3>

              <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-600">
                {report.description}
              </p>
            </div>
          </article>

          <aside className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">
              Manage Report
            </h2>

            <div>
              <label
                htmlFor="report-status"
                className="mb-2 block text-sm font-semibold"
              >
                Update status
              </label>

              <select
                id="report-status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as ReportStatus);
                  setMessage("");
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <button
              type="button"
              onClick={saveStatus}
              className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
             Save Status
            </button>

            <p className="text-xs leading-5 text-slate-500">
              Database saving will be connected when the backend
              endpoint is ready.
            </p>
          </aside>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">
            Internal Notes
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Add a note for the reviewing team. Notes are temporary
            in this frontend preview.
          </p>

          <label
            htmlFor="internal-note"
            className="mb-2 mt-5 block text-sm font-semibold"
          >
            Write a note
          </label>

          <textarea
            id="internal-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Enter investigation observations or follow-up actions..."
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={addNote}
            className="mt-3 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Add Note
          </button>

          {savedNotes.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold">
                Notes in this preview
              </h3>

              {savedNotes.map((savedNote, index) => (
                <div
                  key={`${index}-${savedNote}`}
                  className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700"
                >
                  {savedNote}
                </div>
              ))}
            </div>
          )}
        </section>

        {message && (
          <p
            role="status"
            className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900"
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
export default function AdminReportDetailsPage() {
  return (
    <Suspense fallback={<div>Loading report...</div>}>
      <AdminReportDetailsContent />
    </Suspense>
  );
}