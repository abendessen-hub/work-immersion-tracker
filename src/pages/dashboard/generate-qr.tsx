import { useEffect, useState } from "react";
import DashboardLayout from "./layout";
import { useAuth } from "../../context/useAuth";
import SimpleButton from "../../components/simple-button";

type Company = { company_id: number; company_name: string };

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
          width: 360,
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
        <div className="dashboard-form">
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
            <img
              className="qr-preview"
              src={qrDataUrl}
              alt={`Temporary attendance QR code for ${attendanceDate}`}
            />
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
          <div className="dashboard-form">
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
            </div>
            {qrDataUrl ? (
              <img
                className="qr-preview"
                src={qrDataUrl}
                alt={`Company check-in QR code for ${selectedCompany?.company_name ?? "selected company"}`}
              />
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
