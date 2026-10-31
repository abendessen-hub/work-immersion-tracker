import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../context/useAuth";
import { getCurrentLocation } from "../../lib/geolocation";
import SimpleButton from "../../components/simple-button";
import DashboardLayout from "./layout";

type Company = {
  company_id: number;
  company_name: string;
  latitude: number | string | null;
  longitude: number | string | null;
  radius_meters: number;
};

type AccessReference = {
  access_id: number;
  access_name: string;
};

type Section = {
  section_id: number;
  section_name: string;
  company_id: number | null;
  teacher_id: number | null;
  company_name: string | null;
  teacher_name: string | null;
};

type ReferencesResponse = {
  companies: Company[];
  accessReferences: AccessReference[];
  sections: Section[];
};

type CompanyValues = {
  companyName: string;
  latitude: string;
  longitude: string;
  radiusMeters: string;
};

type SectionValues = {
  sectionName: string;
  companyId: string;
};

const emptyCompany: CompanyValues = {
  companyName: "",
  latitude: "",
  longitude: "",
  radiusMeters: "100",
};

const emptySection: SectionValues = { sectionName: "", companyId: "" };

async function sendReference(method: string, values: object) {
  const response = await fetch("/api/reference", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error ?? "Reference could not be saved.");
  }
  return result;
}

function ManageReferences() {
  const { user } = useAuth();
  const isAdmin = user?.accessId === 3;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [accessReferences, setAccessReferences] = useState<AccessReference[]>(
    [],
  );
  const [sections, setSections] = useState<Section[]>([]);
  const [companyValues, setCompanyValues] =
    useState<CompanyValues>(emptyCompany);
  const [sectionValues, setSectionValues] =
    useState<SectionValues>(emptySection);
  const [accessName, setAccessName] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
  const [editingAccessId, setEditingAccessId] = useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const loadReferences = useCallback(async () => {
    const response = await fetch("/api/reference");
    const result = (await response.json()) as ReferencesResponse & {
      error?: string;
    };
    if (!response.ok) {
      throw new Error(result.error ?? "Could not load references.");
    }
    return result;
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadReferences()
      .then((result) => {
        setCompanies(result.companies);
        setAccessReferences(result.accessReferences);
        setSections(result.sections);
      })
      .catch((error: unknown) => {
        setIsError(true);
        setMessage(
          error instanceof Error ? error.message : "Could not load references.",
        );
      })
      .finally(() => setLoading(false));
  }, [isAdmin, loadReferences]);

  const useCurrentLocation = async () => {
    setLocationBusy(true);
    setMessage("");
    try {
      const location = await getCurrentLocation();
      setCompanyValues((values) => ({
        ...values,
        latitude: location.latitude.toFixed(7),
        longitude: location.longitude.toFixed(7),
      }));
      setIsError(false);
      setMessage(`Location set from this device (±${Math.ceil(location.accuracy)} m accuracy).`);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "Could not get your location.",
      );
    } finally {
      setLocationBusy(false);
    }
  };

  const submitCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await sendReference(
        editingCompanyId === null ? "POST" : "PUT",
        {
          referenceType: "company",
          ...(editingCompanyId === null
            ? {}
            : { companyId: editingCompanyId }),
          companyName: companyValues.companyName,
          latitude: Number(companyValues.latitude),
          longitude: Number(companyValues.longitude),
          radiusMeters: Number(companyValues.radiusMeters),
        },
      );
      setCompanies((current) =>
        [
          ...current.filter(
            (company) => company.company_id !== result.company.company_id,
          ),
          result.company,
        ].sort((a, b) => a.company_name.localeCompare(b.company_name)),
      );
      setCompanyValues(emptyCompany);
      setEditingCompanyId(null);
      setIsError(false);
      setMessage(
        editingCompanyId === null
          ? `Company "${result.company.company_name}" created.`
          : `Company "${result.company.company_name}" updated.`,
      );
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "Company could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  };

  const editCompany = (company: Company) => {
    setEditingCompanyId(company.company_id);
    setCompanyValues({
      companyName: company.company_name,
      latitude: company.latitude == null ? "" : String(company.latitude),
      longitude: company.longitude == null ? "" : String(company.longitude),
      radiusMeters: String(company.radius_meters),
    });
    setMessage("");
  };

  const submitAccessReference = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await sendReference(
        editingAccessId === null ? "POST" : "PUT",
        {
          referenceType: "access",
          ...(editingAccessId === null ? {} : { accessId: editingAccessId }),
          accessName,
        },
      );
      setAccessReferences((current) =>
        [
          ...current.filter(
            (reference) =>
              reference.access_id !== result.accessReference.access_id,
          ),
          result.accessReference,
        ].sort((a, b) => a.access_id - b.access_id),
      );
      setAccessName("");
      setEditingAccessId(null);
      setIsError(false);
      setMessage(
        editingAccessId === null
          ? `Access reference "${result.accessReference.access_name}" created.`
          : `Access reference "${result.accessReference.access_name}" updated.`,
      );
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Access reference could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  };

  const submitSection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await sendReference(
        editingSectionId === null ? "POST" : "PUT",
        {
          referenceType: "section",
          ...(editingSectionId === null
            ? {}
            : { sectionId: editingSectionId }),
          sectionName: sectionValues.sectionName,
          companyId: sectionValues.companyId
            ? Number(sectionValues.companyId)
            : null,
        },
      );
      const section: Section = {
        ...result.section,
        company_name:
          companies.find(
            (company) =>
              company.company_id === result.section.company_id,
          )?.company_name ?? null,
        teacher_name:
          sections.find(
            (item) => item.section_id === result.section.section_id,
          )?.teacher_name ?? null,
      };
      setSections((current) =>
        [
          ...current.filter(
            (item) => item.section_id !== section.section_id,
          ),
          section,
        ].sort((a, b) => a.section_name.localeCompare(b.section_name)),
      );
      setSectionValues(emptySection);
      setEditingSectionId(null);
      setIsError(false);
      setMessage(
        editingSectionId === null
          ? `Section "${section.section_name}" created.`
          : `Section "${section.section_name}" updated.`,
      );
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "Section could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  };

  const editSection = (section: Section) => {
    setEditingSectionId(section.section_id);
    setSectionValues({
      sectionName: section.section_name,
      companyId:
        section.company_id === null ? "" : String(section.company_id),
    });
    setMessage("");
  };

  const deleteReference = async (
    referenceType: "company" | "access" | "section",
    id: number,
    name: string,
  ) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusy(true);
    setMessage("");
    try {
      await sendReference("DELETE", {
        referenceType,
        ...(referenceType === "company"
          ? { companyId: id }
          : referenceType === "access"
            ? { accessId: id }
            : { sectionId: id }),
      });
      if (referenceType === "company") {
        setCompanies((current) =>
          current.filter((company) => company.company_id !== id),
        );
      } else if (referenceType === "access") {
        setAccessReferences((current) =>
          current.filter((reference) => reference.access_id !== id),
        );
      } else {
        setSections((current) =>
          current.filter((section) => section.section_id !== id),
        );
      }
      if (referenceType === "company" && editingCompanyId === id) {
        setEditingCompanyId(null);
        setCompanyValues(emptyCompany);
      }
      if (referenceType === "access" && editingAccessId === id) {
        setEditingAccessId(null);
        setAccessName("");
      }
      if (referenceType === "section" && editingSectionId === id) {
        setEditingSectionId(null);
        setSectionValues(emptySection);
      }
      setIsError(false);
      setMessage(`"${name}" deleted.`);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "Reference could not be deleted.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout
      eyebrow="Work Immersion Monitoring System (WIMS) · Manage References"
      title="Manage References"
      description="Admin only. Manage company check-in locations and access references."
    >
      {!isAdmin ? (
        <p className="dashboard-message dashboard-message--error" role="status">
          Admin access is required to manage references.
        </p>
      ) : loading ? (
        <p className="dashboard-message" role="status">
          Loading references...
        </p>
      ) : (
        <div className="reference-management">
          <section className="dashboard-section reference-panel">
            <h2 className="dashboard-section-title">Company references</h2>
            <p className="dashboard-section-sub">
              Each company needs a location and check-in radius before students
              can record attendance there.
            </p>
            <form className="dashboard-form reference-form" onSubmit={submitCompany}>
              <div className="reference-form-grid">
                <label className="form-field" htmlFor="reference-company-name">
                  Company name
                  <input
                    id="reference-company-name"
                    value={companyValues.companyName}
                    onChange={(event) =>
                      setCompanyValues({
                        ...companyValues,
                        companyName: event.target.value,
                      })
                    }
                    maxLength={160}
                    required
                  />
                </label>
                <label className="form-field" htmlFor="reference-radius">
                  Allowed radius (meters)
                  <input
                    id="reference-radius"
                    type="number"
                    min="1"
                    max="50000"
                    step="1"
                    value={companyValues.radiusMeters}
                    onChange={(event) =>
                      setCompanyValues({
                        ...companyValues,
                        radiusMeters: event.target.value,
                      })
                    }
                    required
                  />
                </label>
                <label className="form-field" htmlFor="reference-latitude">
                  Latitude
                  <input
                    id="reference-latitude"
                    type="number"
                    min="-90"
                    max="90"
                    step="any"
                    value={companyValues.latitude}
                    onChange={(event) =>
                      setCompanyValues({
                        ...companyValues,
                        latitude: event.target.value,
                      })
                    }
                    required
                  />
                </label>
                <label className="form-field" htmlFor="reference-longitude">
                  Longitude
                  <input
                    id="reference-longitude"
                    type="number"
                    min="-180"
                    max="180"
                    step="any"
                    value={companyValues.longitude}
                    onChange={(event) =>
                      setCompanyValues({
                        ...companyValues,
                        longitude: event.target.value,
                      })
                    }
                    required
                  />
                </label>
              </div>
              <div className="dashboard-inline-actions">
                <SimpleButton
                  type="button"
                  variant="secondary"
                  onClick={useCurrentLocation}
                  disabled={busy || locationBusy}
                >
                  {locationBusy ? "Getting Location..." : "Use Current Location"}
                </SimpleButton>
                <SimpleButton type="submit" disabled={busy || locationBusy}>
                  {busy
                    ? "Saving..."
                    : editingCompanyId === null
                      ? "Create Company"
                      : "Save Company"}
                </SimpleButton>
                {editingCompanyId !== null ? (
                  <SimpleButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingCompanyId(null);
                      setCompanyValues(emptyCompany);
                    }}
                    disabled={busy}
                  >
                    Cancel Edit
                  </SimpleButton>
                ) : null}
              </div>
            </form>

            <div className="reference-list" aria-label="Company references">
              {companies.map((company) => (
                <article className="reference-card" key={company.company_id}>
                  <div>
                    <h3 className="reference-card-title">{company.company_name}</h3>
                    <p className="reference-card-detail">
                      {company.latitude == null || company.longitude == null
                        ? "Location not configured"
                        : `${Number(company.latitude).toFixed(6)}, ${Number(company.longitude).toFixed(6)}`}
                      {` · ${company.radius_meters} m radius`}
                    </p>
                  </div>
                  <div className="dashboard-inline-actions">
                    <SimpleButton
                      type="button"
                      variant="secondary"
                      onClick={() => editCompany(company)}
                      disabled={busy}
                    >
                      Edit
                    </SimpleButton>
                    <SimpleButton
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        void deleteReference(
                          "company",
                          company.company_id,
                          company.company_name,
                        )
                      }
                      disabled={busy}
                    >
                      Delete
                    </SimpleButton>
                  </div>
                </article>
              ))}
              {!companies.length ? (
                <p className="dashboard-message">No company references yet.</p>
              ) : null}
            </div>
          </section>

          <section className="dashboard-section reference-panel">
            <h2 className="dashboard-section-title">Section references</h2>
            <p className="dashboard-section-sub">
              Assign sections to a company. Existing teacher assignments are
              preserved when editing a section.
            </p>
            <form
              className="dashboard-form reference-form"
              onSubmit={submitSection}
            >
              <div className="reference-form-grid">
                <label className="form-field" htmlFor="reference-section-name">
                  Section name
                  <input
                    id="reference-section-name"
                    value={sectionValues.sectionName}
                    onChange={(event) =>
                      setSectionValues({
                        ...sectionValues,
                        sectionName: event.target.value,
                      })
                    }
                    maxLength={160}
                    required
                  />
                </label>
                <label className="form-field" htmlFor="reference-section-company">
                  Company
                  <select
                    id="reference-section-company"
                    value={sectionValues.companyId}
                    onChange={(event) =>
                      setSectionValues({
                        ...sectionValues,
                        companyId: event.target.value,
                      })
                    }
                  >
                    <option value="">No company assigned</option>
                    {companies.map((company) => (
                      <option
                        key={company.company_id}
                        value={company.company_id}
                      >
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="dashboard-inline-actions">
                <SimpleButton type="submit" disabled={busy}>
                  {busy
                    ? "Saving..."
                    : editingSectionId === null
                      ? "Create Section"
                      : "Save Section"}
                </SimpleButton>
                {editingSectionId !== null ? (
                  <SimpleButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingSectionId(null);
                      setSectionValues(emptySection);
                    }}
                    disabled={busy}
                  >
                    Cancel Edit
                  </SimpleButton>
                ) : null}
              </div>
            </form>

            <div className="reference-list" aria-label="Section references">
              {sections.map((section) => (
                <article className="reference-card" key={section.section_id}>
                  <div>
                    <h3 className="reference-card-title">
                      {section.section_name}
                    </h3>
                    <p className="reference-card-detail">
                      {section.company_name ?? "No company assigned"}
                      {section.teacher_name
                        ? ` · Teacher: ${section.teacher_name}`
                        : ""}
                      {` · Section ID ${section.section_id}`}
                    </p>
                  </div>
                  <div className="dashboard-inline-actions">
                    <SimpleButton
                      type="button"
                      variant="secondary"
                      onClick={() => editSection(section)}
                      disabled={busy}
                    >
                      Edit
                    </SimpleButton>
                    <SimpleButton
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        void deleteReference(
                          "section",
                          section.section_id,
                          section.section_name,
                        )
                      }
                      disabled={busy}
                    >
                      Delete
                    </SimpleButton>
                  </div>
                </article>
              ))}
              {!sections.length ? (
                <p className="dashboard-message">No section references yet.</p>
              ) : null}
            </div>
          </section>

          <section className="dashboard-section reference-panel">
            <h2 className="dashboard-section-title">Access references</h2>
            <p className="dashboard-section-sub">
              Built-in roles with IDs 1–3 are reserved by the app. Additional
              access references do not receive permissions automatically.
            </p>
            <form
              className="dashboard-form reference-form"
              onSubmit={submitAccessReference}
            >
              <label className="form-field" htmlFor="access-reference-name">
                Access reference name
                <input
                  id="access-reference-name"
                  value={accessName}
                  onChange={(event) => setAccessName(event.target.value)}
                  maxLength={160}
                  required
                />
              </label>
              <div className="dashboard-inline-actions">
                <SimpleButton type="submit" disabled={busy}>
                  {busy
                    ? "Saving..."
                    : editingAccessId === null
                      ? "Create Access Reference"
                      : "Save Access Reference"}
                </SimpleButton>
                {editingAccessId !== null ? (
                  <SimpleButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingAccessId(null);
                      setAccessName("");
                    }}
                    disabled={busy}
                  >
                    Cancel Edit
                  </SimpleButton>
                ) : null}
              </div>
            </form>

            <div className="reference-list" aria-label="Access references">
              {accessReferences.map((reference) => (
                <article className="reference-card" key={reference.access_id}>
                  <div>
                    <h3 className="reference-card-title">
                      {reference.access_name}
                    </h3>
                    <p className="reference-card-detail">
                      Access ID {reference.access_id}
                      {reference.access_id <= 3 ? " · Built-in role" : ""}
                    </p>
                  </div>
                  {reference.access_id > 3 ? (
                    <div className="dashboard-inline-actions">
                      <SimpleButton
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setEditingAccessId(reference.access_id);
                          setAccessName(reference.access_name);
                          setMessage("");
                        }}
                        disabled={busy}
                      >
                        Edit
                      </SimpleButton>
                      <SimpleButton
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          void deleteReference(
                            "access",
                            reference.access_id,
                            reference.access_name,
                          )
                        }
                        disabled={busy}
                      >
                        Delete
                      </SimpleButton>
                    </div>
                  ) : null}
                </article>
              ))}
              {!accessReferences.length ? (
                <p className="dashboard-message">No access references yet.</p>
              ) : null}
            </div>
          </section>
        </div>
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

export default ManageReferences;
