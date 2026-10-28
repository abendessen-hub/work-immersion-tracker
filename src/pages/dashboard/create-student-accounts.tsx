import { useState, type ChangeEvent, type FormEvent } from "react";
import DashboardLayout from "./layout";
import SimpleButton from "../../components/simple-button";
import { downloadWorkbook } from "../../utils/download-workbook";

type ImportRow = {
  lrn: string;
  lastName: string;
  firstName: string;
  middleName: string;
  section: string;
  company: string;
  contactNumber: string;
};

type CreatedAccount = {
  user_id: number;
  username: string;
  temporaryPassword: string;
  section_id: number;
  company_id: number;
  contact_number: string;
  access_id: number;
};

const expectedHeaders = [
  "LRN",
  "Last Name",
  "First Name",
  "Middle Name",
  "Section",
  "Company",
  "ContactNumber",
];

const fieldByHeader: Record<string, keyof ImportRow> = {
  lrn: "lrn",
  lastname: "lastName",
  firstname: "firstName",
  middlename: "middleName",
  section: "section",
  company: "company",
  contactnumber: "contactNumber",
};

function normalizeHeader(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[\s_]/g, "");
}

async function downloadTemplate() {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet("Students");
  sheet.addRow(expectedHeaders);
  sheet.getRow(1).font = { bold: true };
  sheet.getColumn(1).numFmt = "@";
  sheet.getColumn(7).numFmt = "@";
  await downloadWorkbook(workbook, "student-account-template.xlsx");
}

function cellText(value: { text: string }) {
  return value.text.trim();
}

function CreateStudentAccountsPage() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  const readSpreadsheet = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setRows([]);
    setMessage("");
    setFileName(file?.name ?? "");
    if (!file) return;

    try {
      if (!file.name.toLocaleLowerCase().endsWith(".xlsx")) {
        throw new Error("Choose an .xlsx workbook.");
      }
      const { Workbook } = await import("exceljs");
      const workbook = new Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const sheet = workbook.worksheets[0];
      if (!sheet) throw new Error("The workbook does not contain a worksheet.");
      const columnByHeader = new Map<string, number>();
      sheet.getRow(1).eachCell((cell, column) => {
        columnByHeader.set(normalizeHeader(cell.text), column);
      });
      const missingHeaders = expectedHeaders.filter(
        (header) => !columnByHeader.has(normalizeHeader(header)),
      );
      if (missingHeaders.length) {
        throw new Error(`Missing template columns: ${missingHeaders.join(", ")}`);
      }

      const importedRows: ImportRow[] = [];
      for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
        const excelRow = sheet.getRow(rowNumber);
        const row: ImportRow = {
          lrn: "",
          lastName: "",
          firstName: "",
          middleName: "",
          section: "",
          company: "",
          contactNumber: "",
        };
        for (const [header, field] of Object.entries(fieldByHeader)) {
          const column = columnByHeader.get(header);
          if (column) row[field] = cellText(excelRow.getCell(column));
        }
        if (Object.values(row).some(Boolean)) importedRows.push(row);
      }
      if (!importedRows.length) throw new Error("The worksheet has no student rows.");
      setRows(importedRows);
      setIsError(false);
      setMessage(`${importedRows.length} student row(s) ready to import.`);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Could not read the spreadsheet.");
    }
  };

  const createAccounts = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rows.length || busy) return;

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Student accounts could not be created.");

      const accounts = result.accounts as CreatedAccount[];
      const { Workbook } = await import("exceljs");
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("Created Accounts");
      worksheet.columns = [
        { header: "user_id", key: "user_id", width: 12 },
        { header: "Username", key: "username", width: 22 },
        { header: "Temporary Password", key: "temporaryPassword", width: 26 },
        { header: "section_id", key: "section_id", width: 12 },
        { header: "company_id", key: "company_id", width: 12 },
        { header: "contact_number", key: "contact_number", width: 18 },
        { header: "access_id", key: "access_id", width: 12 },
      ];
      worksheet.getColumn(6).numFmt = "@";
      worksheet.addRows(accounts);
      worksheet.getRow(1).font = { bold: true };
      await downloadWorkbook(workbook, "student-accounts.xlsx");
      setRows([]);
      setFileName("");
      setIsError(false);
      setMessage(`Created ${accounts.length} account(s). Downloaded student-accounts.xlsx with temporary passwords.`);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Student accounts could not be created.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout
      eyebrow="Dashboard · Create Accounts"
      title="Create Accounts"
      description="Teacher only. Create accounts for students using Spreadsheets."
    >
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Import from spreadsheet</h2>
        <p className="dashboard-section-sub">
          Use the supplied template. Section and company names must match reference data.
          Temporary password is the last four LRN digits followed by the student&apos;s
          lowercase last name without spaces. LRN and names are used only during import
          and are not saved to the database.
        </p>
        <p className="dashboard-section-sub">
          The account workbook is downloaded after creation; share temporary passwords
          securely with students.
        </p>
      </div>
      <div className="dashboard-inline-actions">
        <SimpleButton
          type="button"
          variant="secondary"
          onClick={() => {
            void downloadTemplate().catch((error: unknown) => {
              setIsError(true);
              setMessage(error instanceof Error ? error.message : "Template could not be downloaded.");
            });
          }}
        >
          Download Template
        </SimpleButton>
        <label className="simple-button simple-button--medium simple-button--primary file-picker">
          Choose Spreadsheet
          <input
            type="file"
            accept=".xlsx"
            onChange={readSpreadsheet}
            aria-label="Choose student spreadsheet"
          />
        </label>
      </div>
      {fileName ? <p className="dashboard-section-sub">Selected: {fileName}</p> : null}
      {rows.length ? (
        <form className="dashboard-form" onSubmit={createAccounts}>
          <p className="dashboard-section-sub">
            Ready to create {rows.length} account(s). Blank Middle Name values are allowed.
          </p>
          <SimpleButton type="submit" disabled={busy}>
            {busy ? "Creating Accounts..." : "Create Accounts & Download XLSX"}
          </SimpleButton>
        </form>
      ) : null}
      {message ? (
        <p className={isError ? "dashboard-message dashboard-message--error" : "dashboard-message"} role="status">
          {message}
        </p>
      ) : null}
    </DashboardLayout>
  );
}

export default CreateStudentAccountsPage;
