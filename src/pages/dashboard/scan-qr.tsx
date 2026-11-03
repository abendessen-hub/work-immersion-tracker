import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import type { Html5Qrcode as Html5QrcodeInstance } from "html5-qrcode";
import { useAuth } from "../../context/useAuth";
import { getCurrentLocation } from "../../lib/geolocation";
import DashboardLayout from "./layout";
import SimpleButton from "../../components/simple-button";

function ScanQrPage() {
  const { user } = useAuth();
  const isStudent = user?.accessId === 1;
  const canRecordStudentAttendance = [2, 3, 4].includes(user?.accessId ?? 0);
  const isLocationTestAccount =
    isStudent &&
    user?.username.toLowerCase() === "1059student" &&
    user.sectionId === 1059 &&
    user.companyId === 1059;
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const processingRef = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const processQr = useCallback(
    async (value: string) => {
      let payload: { type?: unknown; companyId?: unknown; token?: unknown };
      try {
        payload = JSON.parse(value) as {
          type?: unknown;
          companyId?: unknown;
          token?: unknown;
        };
      } catch {
        throw new Error("This is not a valid WIMS QR code.");
      }

      if (payload.type === "work-immersion-temporary-attendance") {
        if (typeof payload.token !== "string" || !payload.token) {
          throw new Error("This temporary attendance QR code is invalid.");
        }
        const response = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "record-temporary",
            token: payload.token,
          }),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error ?? "Attendance could not be recorded.");
        setIsError(false);
        setMessage(
          `Attendance recorded for ${result.studentName} on ${result.record.date} (11:00 AM–1:00 PM).`,
        );
        return;
      }

      if (payload.type !== "work-immersion-company") {
        throw new Error("This QR code is not a WIMS attendance code.");
      }
      if (!isStudent) {
        throw new Error(
          "Staff can scan temporary student attendance QR codes, not company check-in codes.",
        );
      }

      const companyId =
        typeof payload.companyId === "number"
          ? payload.companyId
          : typeof payload.companyId === "string" &&
              /^\d+$/.test(payload.companyId)
            ? Number(payload.companyId)
            : NaN;
      if (!Number.isSafeInteger(companyId) || companyId < 1) {
        throw new Error("This QR code is not a company check-in code.");
      }

      const location = await getCurrentLocation();
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, location }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Attendance could not be recorded.");

      if (result.testOnly === true) {
        setIsError(false);
        setMessage(
          `Location check passed for ${result.companyName} (${result.distanceMeters} m away; ${result.allowedDistanceMeters} m allowed for this GPS fix, including the ${result.radiusMeters} m company radius). Attendance was not recorded.`,
        );
        return;
      }

      const action = result.action === "time-in" ? "Time in" : "Time out";
      setIsError(false);
      setMessage(`${action} recorded successfully.`);
    },
    [isStudent],
  );

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

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || busy || isScanning || processingRef.current) return;

    setBusy(true);
    setMessage("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const decoder = new Html5Qrcode("attendance-qr-reader");
      const decodedText = await decoder.scanFile(file, true);
      setBusy(false);
      await handleScan(decodedText);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? `QR image could not be read: ${error.message}`
          : "QR image could not be read.",
      );
    } finally {
      setBusy(false);
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
      eyebrow="Work Immersion Monitoring System (WIMS) · Scan QR"
      title="Scan QR"
      description={
        isLocationTestAccount
          ? "In production environments, this account can scan any company QR to test its location without recording attendance."
          : isStudent
            ? "Scan your assigned company QR while signed in to record your own attendance."
            : "Scan a student's temporary attendance QR using the camera or upload the PNG they sent."
      }
    >
      {isStudent || canRecordStudentAttendance ? (
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">
            {isStudent ? "Company check-in" : "Record temporary attendance"}
          </h2>
          <p className="dashboard-section-sub">
            {isLocationTestAccount
              ? "The location must be within the scanned company's check-in radius. This test does not record attendance. Allow location access when prompted."
              : isStudent
                ? "First scan records time in; the next scan records time out. Your assigned company and location are checked."
                : user?.accessId === 2
                  ? "Teachers can record temporary attendance only for students in their assigned section. The record uses 11:00 AM, 1:00 PM, and 20 meters."
                  : "Admins and deployers can record temporary attendance for any student. The record uses 11:00 AM, 1:00 PM, and 20 meters."}
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
          {canRecordStudentAttendance ? (
            <div className="form-field">
              <label htmlFor="attendance-qr-upload">
                Or upload the student&apos;s QR PNG
              </label>
              <input
                id="attendance-qr-upload"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={busy || isScanning}
              />
            </div>
          ) : null}
          <div id="attendance-qr-reader" className="qr-reader" />
        </div>
      ) : (
        <p className="dashboard-message dashboard-message--error" role="status">
          Scan access is available to students, teachers, admins, and deployers.
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
