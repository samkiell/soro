"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
type ReportStatus =
  | "Pending"
  | "Investigating"
  | "Resolved"
  | "Rejected";

type Report = {
  id: string;
  title: string;
  location: string;
  status: ReportStatus;
  date: string;
  priority: "High" | "Medium" | "Low";
};

const sampleReports: Report[] = [
  {
    id: "SORO-001",
    title: "Suspicious activity near lecture hall",
    location: "Lecture Hall",
    status: "Pending",
    date: "Oct 23, 2026",
    priority: "High",
  },
  {
    id: "SORO-002",
    title: "Lost student identification card",
    location: "Faculty Building",
    status: "Investigating",
    date: "Oct 22, 2026",
    priority: "Medium",
  },
  {
    id: "SORO-003",
    title: "Damaged campus streetlight",
    location: "Main Campus Road",
    status: "Resolved",
    date: "Oct 21, 2026",
    priority: "Low",
  },
  {
    id: "SORO-004",
    title: "Reported theft near hostel",
    location: "Student Hostel",
    status: "Pending",
    date: "Oct 20, 2026",
    priority: "High",
  },
    {
    id: "SORO-005",
    title: "Damaged classroom door",
    location: "Science Faculty",
    status: "Rejected",
    date: "Oct 19, 2026",
    priority: "Low",
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

function priorityStyle(priority: Report["priority"]) {
  switch (priority) {
    case "High":
      return "text-red-700";
    case "Medium":
      return "text-amber-700";
    case "Low":
      return "text-green-700";
  }
}

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<Report[]>(sampleReports);

useEffect(() => {
  function loadReports() {
    try {
      const savedStatuses = JSON.parse(
        localStorage.getItem("soro-report-statuses") || "{}"
      ) as Record<string, ReportStatus>;

      const submittedReports = JSON.parse(
        localStorage.getItem("soro-submitted-reports") || "[]"
      ) as Report[];

      const allReports = [
        ...submittedReports,
        ...sampleReports,
      ];

      setReports(
        allReports.map((report) => ({
          ...report,
          status: savedStatuses[report.id] ?? report.status,
        }))
      );
    } catch (error) {
      console.error("Could not load reports:", error);
      setReports(sampleReports);
    }
  }

  loadReports();

  window.addEventListener("focus", loadReports);
  window.addEventListener("storage", loadReports);

  return () => {
    window.removeEventListener("focus", loadReports);
    window.removeEventListener("storage", loadReports);
  };
}, []);

  const pending = reports.filter(
    (report) => report.status === "Pending"
  ).length;

  const investigating = reports.filter(
    (report) => report.status === "Investigating"
  ).length;

  const resolved = reports.filter(
    (report) => report.status === "Resolved"
  ).length;

  const stats = [
    {
      label: "Total Reports",
      value: reports.length,
      symbol: "📋",
      color: "bg-blue-50",
    },
    {
      label: "Pending Reports",
      value: pending,
      symbol: "⏳",
      color: "bg-amber-50",
    },
    {
      label: "Under Investigation",
      value: investigating,
      symbol: "🔎",
      color: "bg-indigo-50",
    },
    {
      label: "Resolved Reports",
      value: resolved,
      symbol: "✓",
      color: "bg-green-50",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              SORO ADMINISTRATION
            </p>

            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor and manage campus safety reports.
            </p>
          </div>

          <Link
            href="/admin/reports"
            className="inline-flex w-fit items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            View All Reports →
          </Link>
        </header>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Preview mode:</strong> The reports displayed here
          are sample data. They are not real campus reports.
        </div>

        <section
          aria-label="Report statistics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  {stat.label}
                </p>

                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${stat.color}`}
                >
                  {stat.symbol}
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold">
                {stat.value}
              </p>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">
                Recent Reports
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                A quick overview of recently submitted reports.
              </p>
            </div>

            <Link
              href="/admin/reports"
              className="text-sm font-semibold text-blue-700 hover:underline"
            >
              See all reports
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">
                    Report
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Location
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Priority
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {report.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {report.id} · {report.date}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {report.location}
                    </td>

                    <td
                      className={`px-5 py-4 font-semibold ${priorityStyle(report.priority)}`}
                    >
                      {report.priority}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-xs text-slate-500">
          Soro Campus Safety · Admin overview
        </footer>
      </div>
    </main>
  );
}
