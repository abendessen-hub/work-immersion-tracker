import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/useAuth";
import DashboardLayout from "./layout";
import SimpleButton from "../../components/simple-button";
import { downloadWorkbook } from "../../utils/download-workbook";

type AttendanceRecord = {
  user_id: number;
  full_name: string;
  section_name: string;
  company_name: string;
  date: string;
  time_in: string;
  time_out: string | null;
  status: "Attended" | "Absent" | "No Time Out";
};

type ReferenceData = {
  sections: { section_id: number; section_name: string }[];
  companies: { company_id: number; company_name: string }[];
};

function formatTo12Hour(timeStr: string) {
  if (!timeStr) return "";
  const [hourStr, minuteStr] = timeStr.split(":");
  let hours = parseInt(hourStr, 10);
  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = minuteStr ? minuteStr.slice(0, 2) : "00";

  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

function AttendancePage() {
  const { user } = useAuth();
  const isStudent = user?.accessId === 1;
  const [date, setDate] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [references, setReferences] = useState<ReferenceData>({
    sections: [],
    companies: [],
  });
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isStudent) return;
    fetch("/api/reference-data")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error ?? "Could not load filters.");
        setReferences(data as ReferenceData);
      })
      .catch((error: unknown) => {
        setMessage(
          error instanceof Error ? error.message : "Could not load filters.",
        );
      });
  }, [isStudent]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (!isStudent && sectionId) params.set("sectionId", sectionId);
    if (!isStudent && companyId) params.set("companyId", companyId);

    fetch(`/api/attendance?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error ?? "Could not load attendance.");
        setRecords(data.records as AttendanceRecord[]);
        console.log(data.records);
        setMessage("");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setMessage(
          error instanceof Error ? error.message : "Could not load attendance.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });

    return () => controller.abort();
  }, [companyId, date, isStudent, sectionId]);

  const presentCount = records.filter((record) => record.time_in).length;
  const completedCount = records.filter((record) => record.time_out).length;
  const studentCount = useMemo(
    () => new Set(records.map((record) => record.user_id)).size,
    [records],
  );

  const downloadReport = async () => {
    try {
      const { Workbook } = await import("exceljs");
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("Attendance");
      worksheet.columns = [
        { header: "Full Name", key: "full_name", width: 28 },
        { header: "Section", key: "section_name", width: 24 },
        { header: "Company", key: "company_name", width: 28 },
        { header: "Date", key: "date", width: 14 },
        { header: "Time In", key: "time_in", width: 14 },
        { header: "Time Out", key: "time_out", width: 14 },
        { header: "Status", key: "status", width: 20 },
      ];
      worksheet.addRows(
        records.map((record) => ({
          ...record,
          time_in: formatTo12Hour(record.time_in),
          time_out: record.time_out ? formatTo12Hour(record.time_out) : "",
          date: new Date(record.date).toLocaleDateString(),
        })),
      );
      worksheet.getRow(1).font = { bold: true };
      await downloadWorkbook(workbook, `attendance-report-${date}.xlsx`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Attendance report could not be downloaded.",
      );
    }
  };

  return (
    <DashboardLayout
      eyebrow="Work Immersion Monitoring System (WIMS) · Attendance"
      title="Attendance"
      description={
        isStudent
          ? "View your own attendance records."
          : "Filter attendance by date, section, and company; export the results. \n To use Attendance Report, You must insert a Date, Section, and Company First"
      }
    >
      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-label">
            {isStudent ? "Your records" : "Student records"}
          </span>
          <span className="stat-value">{busy ? "…" : records.length}</span>
        </div>
        {!isStudent ? (
          <div className="stat-tile">
            <span className="stat-label">Students</span>
            <span className="stat-value">{busy ? "…" : studentCount}</span>
          </div>
        ) : null}
        <div className="stat-tile">
          <span className="stat-label">Time in recorded</span>
          <span className="stat-value">{busy ? "…" : presentCount}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Time out recorded</span>
          <span className="stat-value">{busy ? "…" : completedCount}</span>
        </div>
      </div>
      <section className="dashboard-section" aria-label="Attendance filters">
        <h2 className="dashboard-section-title">Report filters</h2>
        <div className="attendance-filters">
          <div className="form-field">
            <label htmlFor="attendance-date-to">Date</label>
            <input
              id="attendance-date-to"
              type="date"
              value={date}
              onChange={(event) => {
                setBusy(true);
                setDate(event.target.value);
              }}
            />
          </div>
          {!isStudent ? (
            <>
              <div className="form-field">
                <label htmlFor="attendance-section">Section</label>
                <select
                  id="attendance-section"
                  value={sectionId}
                  onChange={(event) => {
                    setBusy(true);
                    setSectionId(event.target.value);
                  }}
                >
                  <option value="">All sections</option>
                  {references.sections.map((section) => (
                    <option key={section.section_id} value={section.section_id}>
                      {section.section_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="attendance-company">Company</label>
                <select
                  id="attendance-company"
                  value={companyId}
                  onChange={(event) => {
                    setBusy(true);
                    setCompanyId(event.target.value);
                  }}
                >
                  <option value="">All companies</option>
                  {references.companies.map((company) => (
                    <option key={company.company_id} value={company.company_id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
          <SimpleButton
            type="button"
            onClick={downloadReport}
            disabled={
              busy ||
              !records.length ||
              (isStudent ? false : !date || !sectionId || !companyId)
            }
          >
            Download Attendance Report.xlsx
          </SimpleButton>
        </div>
      </section>
      {message ? (
        <p className="dashboard-message dashboard-message--error" role="status">
          {message}
        </p>
      ) : null}
      {busy ? (
        <p className="dashboard-section-sub">Loading attendance…</p>
      ) : null}
      {!busy && !message && records.length === 0 ? (
        <p className="dashboard-section-sub">
          No attendance records match these filters.
        </p>
      ) : null}
      {records.length ? (
        <div className="attendance-table-wrap">
          <table className="placeholder-table">
            <thead>
              <tr>
                {!isStudent ? <th scope="col">Student</th> : null}
                <th scope="col">Section</th>
                <th scope="col">Company</th>
                <th scope="col">Date</th>
                <th scope="col">Time in</th>
                <th scope="col">Time out</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  {!isStudent ? <td>{record.full_name}</td> : null}
                  <td>{record.section_name}</td>
                  <td>{record.company_name}</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{formatTo12Hour(record.time_in)}</td>
                  <td>
                    {record.time_out ? formatTo12Hour(record.time_out) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

export default AttendancePage;
