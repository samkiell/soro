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
  description: string;
};

const sampleReports: Report[] = [
  {
    id: "SORO-001",
    title: "Suspicious activity near lecture hall",
    location: "Lecture Hall",
    status: "Pending",
    date: "2026-10-23",
    priority: "High",
    description:
      "A suspicious activity was reported near the lecture hall.",
  },
  {
    id: "SORO-002",
    title: "Lost student identification card",
    location: "Faculty Building",
    status: "Investigating",
    date: "2026-10-22",
    priority: "Medium",
    description:
      "A student reported a missing identification card.",
  },
  {
    id: "SORO-003",
    title: "Damaged campus streetlight",
    location: "Main Campus Road",
    status: "Resolved",
    date: "2026-10-21",
    priority: "Low",
    description:
      "A damaged streetlight was reported on the campus road.",
  },
  {
    id: "SORO-004",
    title: "Reported theft near hostel",
    location: "Student Hostel",
    status: "Pending",
    date: "2026-10-20",
    priority: "High",
    description:
      "A theft incident was reported near a student hostel.",
  },
  {
    id: "SORO-005",
    title: "Damaged classroom door",
    location: "Science Faculty",
    status: "Rejected",
    date: "2026-10-19",
    priority: "Low",
    description:
      "The submitted report could not be verified.",
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

export default function AdminReportsPage() {
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

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
          description:
            report.description || "No additional description provided.",
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

   const filteredReports = reports.filter((report) => {
    const searchText = [
      report.id,
      report.title,
      report.location,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(
      search.toLowerCase()
    );

    const matchesStatus =
      statusFilter === "All" ||
      report.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" ||
      report.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
              Campus Reports
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Search, filter and review submitted reports.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm text-slate-500">
              Reports displayed
            </p>
            <p className="text-2xl font-bold">
              {filteredReports.length}
            </p>
          </div>
        </header>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Preview mode:</strong> These are sample reports.
          Filters work in your browser, but the data is not yet
          connected to the backend.
        </div>

        <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label
              htmlFor="report-search"
              className="mb-2 block text-sm font-semibold"
            >
              Search reports
            </label>

            <input
              id="report-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, ID or location..."
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="status-filter"
              className="mb-2 block text-sm font-semibold"
            >
              Filter by status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-600"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priority-filter"
              className="mb-2 block text-sm font-semibold"
            >
              Filter by priority
            </label>

            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-600"
            >
              <option value="All">All priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold">All Reports</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a report to view its details.
            </p>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold">No reports found</p>
              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setPriorityFilter("All");
                }}
                className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Report</th>
                    <th className="px-5 py-4 font-medium">Location</th>
                    <th className="px-5 py-4 font-medium">Priority</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          {report.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {report.id}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {report.location}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            report.priority === "High"
                              ? "font-semibold text-red-700"
                              : report.priority === "Medium"
                                ? "font-semibold text-amber-700"
                                : "font-semibold text-green-700"
                          }
                        >
                          {report.priority}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(report.status)}`}
                        >
                          {report.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {report.date}
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/reports/${report.id}`}
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          View details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
