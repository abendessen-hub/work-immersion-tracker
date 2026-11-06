import { useEffect, useState } from "react";
import DashboardLayout from "./layout";
import { useAuth } from "../../context/useAuth";
import SimpleButton from "../../components/simple-button";

type Company = { company_id: number; company_name: string };

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function todayInManila() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
  }).format(new Date());
}

function GenerateQrPage() {
  const { user } = useAuth();
  const isStudent = user?.accessId === 1;
  const canGenerateCompanyQr = [3, 4].includes(user?.accessId ?? 0);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!canGenerateCompanyQr) return;
    fetch("/api/reference-data")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error ?? "Could not load companies.");
        setCompanies(data.companies as Company[]);
      })
      .catch((error: unknown) => {
        setIsError(true);
        setMessage(
          error instanceof Error ? error.message : "Could not load companies.",
        );
      });
  }, [canGenerateCompanyQr]);

  const selectedCompany = companies.find(
    (company) => String(company.company_id) === companyId,
  );

  const generate = async () => {
    if (isStudent && !attendanceDate) {
      setIsError(true);
      setMessage("Choose the date you need attendance recorded for.");
      return;
    }
    if (canGenerateCompanyQr && !selectedCompany) {
      setIsError(true);
      setMessage("Select a company first.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      let payload: string;
      if (isStudent) {
        const response = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate-temporary",
            date: attendanceDate,
          }),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error ?? "Temporary attendance QR could not be generated.",
          );
        payload = JSON.stringify({
          type: "work-immersion-temporary-attendance",
          token: result.token,
        });
      } else if (selectedCompany) {
        payload = JSON.stringify({
          type: "work-immersion-company",
          companyId: selectedCompany.company_id,
        });
      } else {
        throw new Error("Select a company first.");
      }

      const QRCode = await import("qrcode");
      setQrDataUrl(
        await QRCode.toDataURL(payload, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 600,
        }),
      );
      setIsError(false);
      setMessage(
        isStudent
          ? `Temporary attendance QR created for ${attendanceDate}. Download and send the PNG to your teacher.`
          : `Company check-in QR created for ${selectedCompany?.company_name}.`,
      );
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "QR code could not be generated.",
      );
      setQrDataUrl("");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    if (isStudent) {
      link.download = `temporary-attendance-${attendanceDate}.png`;
    } else if (selectedCompany) {
      link.download = `${
        selectedCompany.company_name
          .toLocaleLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "company"
      }-check-in-qr.png`;
    } else {
      return;
    }
    link.click();
  };

  const handlePrint = () => {
    if (!qrDataUrl || isStudent) return;

    const companyName = selectedCompany?.company_name ?? "";
    const title = companyName || "Attendance QR Code";
    const subTitle = "Work Immersion Partner Company Check-in";
    const instruction =
      "Scan using the WIMS App on your device to record daily Time In and Time Out.";

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)} - QR Code</title>
  <style>
    @page {
      size: auto;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f2756;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      text-align: center;
    }
    .print-card {
      width: 100%;
      max-width: 680px;
      padding: 48px 40px;
      border: 3px solid #1456ce;
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: none;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #1456ce;
      background: #edf4ff;
      border: 1px solid #cfe0ff;
      padding: 6px 14px;
      border-radius: 999px;
      margin-bottom: 20px;
    }
    .company-title {
      font-size: 38px;
      font-weight: 800;
      line-height: 1.25;
      color: #0f2756;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
      word-break: break-word;
    }
    .subtitle {
      font-size: 15px;
      font-weight: 600;
      color: #536b8a;
      margin-bottom: 28px;
    }
    .qr-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      border: 2px solid #d5e3fb;
      border-radius: 20px;
      background: #ffffff;
      margin-bottom: 24px;
    }
    .qr-container img {
      width: 500px;
      height: 500px;
      max-width: 100%;
      display: block;
      image-rendering: pixelated;
    }
    .instruction {
      font-size: 15px;
      line-height: 1.55;
      color: #2b3e5a;
      max-width: 480px;
    }
    .footer-note {
      margin-top: 26px;
      font-size: 11px;
      font-weight: 700;
      color: #8fa0ba;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="print-card">
    <div class="badge">Work Immersion Monitoring System</div>
    <h1 class="company-title">${escapeHtml(companyName || title)}</h1>
    <p class="subtitle">${escapeHtml(subTitle)}</p>
    <div class="qr-container">
      <img src="${qrDataUrl}" alt="${escapeHtml(title)} QR Code" />
    </div>
    <p class="instruction">${escapeHtml(instruction)}</p>
    <div class="footer-note">Official Immersion Attendance Check-in Point</div>
  </div>
</body>
</html>
    `);
    doc.close();

    const frameWindow = printFrame.contentWindow;
    if (!frameWindow) return;

    const firePrint = () => {
      frameWindow.focus();
      frameWindow.print();
      setTimeout(() => {
        if (printFrame.parentNode) {
          printFrame.parentNode.removeChild(printFrame);
        }
      }, 1500);
    };

    const qrImg = frameWindow.document.querySelector("img");
    if (qrImg && !qrImg.complete) {
      qrImg.onload = () => setTimeout(firePrint, 100);
      qrImg.onerror = () => firePrint();
    } else {
      setTimeout(firePrint, 250);
    }
  };

  return (
    <DashboardLayout
      eyebrow="Work Immersion Monitoring System (WIMS) · Generate QR"
      title="Generate QR"
      description={
        isStudent
          ? "Create a temporary QR for a missed attendance date and send its downloaded PNG to your teacher."
          : "Generate a unique company check-in QR Code PNG."
      }
    >
      {isStudent ? (
        <div className="dashboard-form dashboard-form--wide">
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">
              Temporary attendance QR
            </h2>
            <p className="dashboard-section-sub">
              Choose a date with no attendance record. Once generated, download
              the PNG and send it to your teacher. A staff member must scan the
              QR to record the missed attendance.
            </p>
          </div>
          <div className="form-field">
            <label htmlFor="qr-attendance-date">Attendance date</label>
            <input
              id="qr-attendance-date"
              type="date"
              value={attendanceDate}
              max={todayInManila()}
              onChange={(event) => {
                setAttendanceDate(event.target.value);
                setQrDataUrl("");
                setMessage("");
              }}
              required
            />
          </div>
          <div className="dashboard-inline-actions">
            <SimpleButton
              type="button"
              onClick={generate}
              disabled={busy || !attendanceDate}
            >
              {busy ? "Generating..." : "Generate Temporary QR"}
            </SimpleButton>
            <SimpleButton
              type="button"
              variant="secondary"
              onClick={download}
              disabled={!qrDataUrl}
            >
              Download PNG
            </SimpleButton>
          </div>
          {qrDataUrl ? (
            <div className="qr-preview-card" id="printable-qr-card">
              <div className="qr-preview-header">
                <span className="qr-preview-badge">Temporary Attendance</span>
                <h3 className="qr-preview-company">{user?.fullname || "Student"}</h3>
                <p className="qr-preview-date">{attendanceDate}</p>
              </div>
              <img
                className="qr-preview"
                src={qrDataUrl}
                alt={`Temporary attendance QR code for ${attendanceDate}`}
              />
              <p className="qr-preview-instructions">
                Present or send to your teacher to record missed attendance
              </p>
            </div>
          ) : null}
        </div>
      ) : canGenerateCompanyQr ? (
        <>
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Company check-in QR</h2>
            <p className="dashboard-section-sub">
              Students scan their assigned company&apos;s code while signed in
              to record their own time in or time out.
            </p>
          </div>
          <div className="dashboard-form dashboard-form--wide">
            <div className="form-field">
              <label htmlFor="qr-company">Company</label>
              <select
                id="qr-company"
                value={companyId}
                onChange={(event) => {
                  setCompanyId(event.target.value);
                  setQrDataUrl("");
                  setMessage("");
                }}
                required
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="dashboard-inline-actions">
              <SimpleButton
                type="button"
                onClick={generate}
                disabled={busy || !companies.length}
              >
                {busy ? "Generating..." : "Generate QR Code"}
              </SimpleButton>
              <SimpleButton
                type="button"
                variant="secondary"
                onClick={download}
                disabled={!qrDataUrl}
              >
                Download PNG
              </SimpleButton>
              <SimpleButton
                type="button"
                variant="secondary"
                onClick={handlePrint}
                disabled={!qrDataUrl}
              >
                Print QR
              </SimpleButton>
            </div>
            {qrDataUrl ? (
              <div className="qr-preview-card" id="printable-qr-card">
                <div className="qr-preview-header">
                  <span className="qr-preview-badge">Work Immersion Check-in</span>
                  <h3 className="qr-preview-company">{selectedCompany?.company_name}</h3>
                </div>
                <img
                  className="qr-preview"
                  src={qrDataUrl}
                  alt={`Company check-in QR code for ${selectedCompany?.company_name ?? "selected company"}`}
                />
                <p className="qr-preview-instructions">
                  Scan with the WIMS App to record Time In and Time Out
                </p>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <p className="dashboard-message dashboard-message--error" role="status">
          Student QR generation is available to student accounts. Company QR
          generation is available to admins and deployers.
        </p>
      )}
      {message ? (
        <p
          className={
            isError
              ? "dashboard-message dashboard-message--error"
              : "dashboard-message"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}
    </DashboardLayout>
  );
}

export default GenerateQrPage;
