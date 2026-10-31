import { useEffect, useState } from "react";
import DashboardLayout from "./layout";
import SimpleButton from "../../components/simple-button";

type Company = { company_id: number; company_name: string };

function GenerateQrPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetch("/api/reference-data")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Could not load companies.");
        setCompanies(data.companies as Company[]);
      })
      .catch((error: unknown) => {
        setIsError(true);
        setMessage(error instanceof Error ? error.message : "Could not load companies.");
      });
  }, []);

  const selectedCompany = companies.find(
    (company) => String(company.company_id) === companyId,
  );

  const generate = async () => {
    if (!selectedCompany) {
      setIsError(true);
      setMessage("Select a company first.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const QRCode = await import("qrcode");
      const payload = JSON.stringify({
        type: "work-immersion-company",
        companyId: selectedCompany.company_id,
      });
      setQrDataUrl(
        await QRCode.toDataURL(payload, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 360,
        }),
      );
      setIsError(false);
      setMessage(`Company check-in QR created for ${selectedCompany.company_name}.`);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "QR code could not be generated.");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!qrDataUrl || !selectedCompany) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${selectedCompany.company_name
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "company"}-check-in-qr.png`;
    link.click();
  };

  return (
    <DashboardLayout
      eyebrow="Work Immersion Monitoring System (WIMS) · Generate QR"
      title="Generate QR"
      description="Generate a unique company check-in QR Code PNG."
    >
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Company check-in QR</h2>
        <p className="dashboard-section-sub">
          Students scan their assigned company&apos;s code while signed in to record
          their own time in or time out.
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
          <SimpleButton type="button" onClick={generate} disabled={busy || !companies.length}>
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
      {message ? (
        <p className={isError ? "dashboard-message dashboard-message--error" : "dashboard-message"} role="status">
          {message}
        </p>
      ) : null}
    </DashboardLayout>
  );
}

export default GenerateQrPage;
