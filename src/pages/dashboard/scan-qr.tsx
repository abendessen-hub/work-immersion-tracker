import { useCallback, useEffect, useRef, useState } from "react";
import type { Html5Qrcode as Html5QrcodeInstance } from "html5-qrcode";
import { useAuth } from "../../context/useAuth";
import DashboardLayout from "./layout";
import SimpleButton from "../../components/simple-button";

function ScanQrPage() {
  const { user } = useAuth();
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const processingRef = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const processQr = useCallback(async (value: string) => {
    let payload: { type?: unknown; companyId?: unknown };
    try {
      payload = JSON.parse(value) as { type?: unknown; companyId?: unknown };
    } catch {
      throw new Error("This is not a valid company check-in QR code.");
    }

    const companyId =
      typeof payload.companyId === "number"
        ? payload.companyId
        : typeof payload.companyId === "string" &&
            /^\d+$/.test(payload.companyId)
          ? Number(payload.companyId)
          : NaN;
    if (
      payload.type !== "work-immersion-company" ||
      !Number.isSafeInteger(companyId) ||
      companyId < 1
    ) {
      throw new Error("This QR code is not a company check-in code.");
    }

    const response = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error ?? "Attendance could not be recorded.");

    const action = result.action === "time-in" ? "Time in" : "Time out";
    setIsError(false);
    setMessage(`${action} recorded successfully.`);
  }, []);

  const handleScan = useCallback(
    async (value: string) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setBusy(true);
      setMessage("");
      try {
        await processQr(value);
      } catch (error) {
        setIsError(true);
        setMessage(
          error instanceof Error
            ? error.message
            : "Attendance could not be recorded.",
        );
      } finally {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        if (scanner) {
          try {
            await scanner.stop();
          } catch (error) {
            console.error("Could not stop the QR scanner:", error);
          }
        }
        setIsScanning(false);
        setBusy(false);
        processingRef.current = false;
      }
    },
    [processQr],
  );

  const startScanner = async () => {
    setMessage("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("attendance-qr-reader");
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => void handleScan(decodedText),
        () => undefined,
      );
      scannerRef.current = scanner;
      setIsScanning(true);
    } catch (error) {
      setIsError(true);
      setMessage(`Camera could not start: ${error}`);
    }
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
      } catch (error) {
        setIsError(true);
        setMessage(
          error instanceof Error ? error.message : "Could not stop the camera.",
        );
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      if (scanner) {
        void scanner.stop().catch((error: unknown) => {
          console.error("Could not stop the QR scanner during cleanup:", error);
        });
      }
    };
  }, []);

  return (
    <DashboardLayout
      eyebrow="Dashboard · Scan QR"
      title="Scan QR"
      description="Scan your assigned company QR while signed in to record your own attendance."
    >
      {user?.accessId === 1 ? (
        <>
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Camera scanner</h2>
            <p className="dashboard-section-sub">
              First scan records time in; the next scan records time out. A
              company code that does not match your account will be rejected.
            </p>
            <div className="dashboard-inline-actions">
              <SimpleButton
                type="button"
                onClick={startScanner}
                disabled={isScanning || busy}
              >
                Start Camera
              </SimpleButton>
              {isScanning ? (
                <SimpleButton
                  type="button"
                  variant="secondary"
                  onClick={stopScanner}
                >
                  Stop Camera
                </SimpleButton>
              ) : null}
            </div>
            <div id="attendance-qr-reader" className="qr-reader" />
          </div>
        </>
      ) : (
        <p className="dashboard-message dashboard-message--error" role="status">
          Company check-in is available to student accounts. Higher access
          levels can review attendance from the Attendance page.
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

export default ScanQrPage;
