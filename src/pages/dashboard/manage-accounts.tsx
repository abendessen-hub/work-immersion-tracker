import { useEffect, useState, type FormEvent } from "react";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../../context/useAuth";
import DashboardLayout from "./layout";
import SimpleButton from "../../components/simple-button";
import RecordSearchPagination from "../../components/record-search-pagination";

type Account = {
  user_id: number;
  username: string;
  full_name: string;
  access_id: number;
  access_name: string | null;
  section_id: number | null;
  section_name: string | null;
  company_id: number | null;
  company_name: string | null;
  contact_number: string | null;
  changedPassword: boolean | null;
};

type References = {
  sections: { section_id: number; section_name: string }[];
  companies: { company_id: number; company_name: string }[];
  accessReferences: { access_id: number; access_name: string }[];
};

type AccountValues = {
  username: string;
  fullName: string;
  accessId: string;
  sectionId: string;
  companyId: string;
  contactNumber: string;
  password: string;
};

const emptyValues: AccountValues = {
  username: "",
  fullName: "",
  accessId: "",
  sectionId: "",
  companyId: "",
  contactNumber: "",
  password: "",
};

function ManageAccounts() {
  const { user } = useAuth();
  const isAdmin = user?.accessId === 3;
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [references, setReferences] = useState<References>({
    sections: [],
    companies: [],
    accessReferences: [],
  });
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [values, setValues] = useState<AccountValues>(emptyValues);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), search: query });
      fetch(`/api/accounts?${params}`, { signal: controller.signal })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok)
            throw new Error(result.error ?? "Accounts could not be loaded.");
          const nextTotalPages = Number(result.totalPages);
          if (page > nextTotalPages) setPage(nextTotalPages);
          setAccounts(result.accounts as Account[]);
          setTotal(Number(result.total));
          setTotalPages(nextTotalPages);
          setMessage("");
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setIsError(true);
          setMessage(
            error instanceof Error
              ? error.message
              : "Accounts could not be loaded.",
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isAdmin, page, query, refresh]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/reference-data")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error ?? "Reference data could not be loaded.");
        setReferences(result as References);
      })
      .catch((error: unknown) => {
        setIsError(true);
        setMessage(
          error instanceof Error
            ? error.message
            : "Reference data could not be loaded.",
        );
      });
  }, [isAdmin]);

  const editAccount = (account: Account) => {
    setEditingId(account.user_id);
    setShowResetPassword(false);
    setValues({
      username: account.username,
      fullName: account.full_name,
      accessId: String(account.access_id),
      sectionId: account.section_id === null ? "" : String(account.section_id),
      companyId:
        account.company_id === null ? "" : String(account.company_id),
      contactNumber: account.contact_number ?? "",
      password: "",
    });
    setMessage("");
  };

  const saveAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || editingId === null) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingId,
          username: values.username,
          fullName: values.fullName,
          accessId: Number(values.accessId),
          sectionId: values.sectionId ? Number(values.sectionId) : null,
          companyId: values.companyId ? Number(values.companyId) : null,
          contactNumber: values.contactNumber,
          password: values.password,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Account could not be updated.");
      setEditingId(null);
      setValues(emptyValues);
      setShowResetPassword(false);
      setIsError(false);
      setMessage(`Account "${result.user.username}" updated.`);
      setRefresh((value) => value + 1);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "Account could not be updated.",
      );
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async (account: Account) => {
    if (
      !window.confirm(
        `Delete account "${account.username}"? This will also permanently delete its attendance records.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: account.user_id }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Account could not be deleted.");
      setIsError(false);
      setMessage(`Account "${account.username}" deleted.`);
      if (editingId === account.user_id) {
        setEditingId(null);
        setValues(emptyValues);
      }
      setRefresh((value) => value + 1);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "Account could not be deleted.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout
      eyebrow="Work Immersion Monitoring System (WIMS) · Manage Accounts"
      title="Manage Accounts"
      description="Admin only. Search, update, and delete user accounts."
    >
      {!isAdmin ? (
        <p className="dashboard-message dashboard-message--error" role="status">
          Admin access is required to manage accounts.
        </p>
      ) : (
        <>
          <RecordSearchPagination
            id="accounts"
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            page={page}
            totalPages={totalPages}
            resultCount={total}
            onPageChange={setPage}
          />
          {loading ? (
            <p className="dashboard-section-sub" role="status">
              Loading accounts...
            </p>
          ) : accounts.length ? (
            <div className="attendance-table-wrap">
              <table className="placeholder-table account-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Username</th>
                    <th scope="col">Access</th>
                    <th scope="col">Section</th>
                    <th scope="col">Company</th>
                    <th scope="col">Contact number</th>
                    <th scope="col">Password status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.user_id}>
                      <td>{account.full_name}</td>
                      <td>{account.username}</td>
                      <td>{account.access_name ?? `ID ${account.access_id}`}</td>
                      <td>{account.section_name ?? "—"}</td>
                      <td>{account.company_name ?? "—"}</td>
                      <td>{account.contact_number ?? "—"}</td>
                      <td>
                        {account.changedPassword
                          ? "Password active"
                          : "Password change required"}
                      </td>
                      <td>
                        <div className="dashboard-inline-actions">
                          <SimpleButton
                            type="button"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => editAccount(account)}
                          >
                            Edit
                          </SimpleButton>
                          <SimpleButton
                            type="button"
                            variant="secondary"
                            disabled={busy || account.user_id === user?.userId}
                            onClick={() => void deleteAccount(account)}
                          >
                            Delete
                          </SimpleButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="dashboard-section-sub">
              {query ? "No accounts match your search." : "No accounts found."}
            </p>
          )}
          {editingId !== null ? (
            <section className="dashboard-section account-edit-panel">
              <h2 className="dashboard-section-title">Update account</h2>
              <form className="dashboard-form" onSubmit={saveAccount}>
                <label className="form-field" htmlFor="account-full-name">
                  Full name
                  <input
                    id="account-full-name"
                    value={values.fullName}
                    onChange={(event) =>
                      setValues({ ...values, fullName: event.target.value })
                    }
                    required
                  />
                </label>
                <label className="form-field" htmlFor="account-username">
                  Username
                  <input
                    id="account-username"
                    value={values.username}
                    onChange={(event) =>
                      setValues({ ...values, username: event.target.value })
                    }
                    required
                  />
                </label>
                <label className="form-field" htmlFor="account-access">
                  Access reference
                  <select
                    id="account-access"
                    value={values.accessId}
                    onChange={(event) =>
                      setValues({ ...values, accessId: event.target.value })
                    }
                    required
                  >
                    <option value="">Select access</option>
                    {references.accessReferences.map((access) => (
                      <option key={access.access_id} value={access.access_id}>
                        {access.access_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-field" htmlFor="account-section">
                  Section
                  <select
                    id="account-section"
                    value={values.sectionId}
                    onChange={(event) =>
                      setValues({ ...values, sectionId: event.target.value })
                    }
                  >
                    <option value="">No section assigned</option>
                    {references.sections.map((section) => (
                      <option key={section.section_id} value={section.section_id}>
                        {section.section_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-field" htmlFor="account-company">
                  Company
                  <select
                    id="account-company"
                    value={values.companyId}
                    onChange={(event) =>
                      setValues({ ...values, companyId: event.target.value })
                    }
                  >
                    <option value="">No company assigned</option>
                    {references.companies.map((company) => (
                      <option key={company.company_id} value={company.company_id}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-field" htmlFor="account-contact">
                  Contact number
                  <input
                    id="account-contact"
                    value={values.contactNumber}
                    onChange={(event) =>
                      setValues({
                        ...values,
                        contactNumber: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="form-field" htmlFor="account-password">
                  Reset password (leave blank to keep current password)
                  <span className="account-password-control">
                    <input
                      id="account-password"
                      type={showResetPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={6}
                      value={values.password}
                      onChange={(event) =>
                        setValues({ ...values, password: event.target.value })
                      }
                    />
                    <IconButton
                      className="account-password-toggle"
                      type="button"
                      aria-label={
                        showResetPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showResetPassword}
                      onClick={() =>
                        setShowResetPassword((visible) => !visible)
                      }
                    >
                      {showResetPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </span>
                </label>
                <div className="dashboard-inline-actions">
                  <SimpleButton type="submit" disabled={busy}>
                    {busy ? "Saving..." : "Save account"}
                  </SimpleButton>
                  <SimpleButton
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => {
                      setEditingId(null);
                      setValues(emptyValues);
                      setShowResetPassword(false);
                    }}
                  >
                    Cancel
                  </SimpleButton>
                </div>
              </form>
            </section>
          ) : null}
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
        </>
      )}
    </DashboardLayout>
  );
}

export default ManageAccounts;
