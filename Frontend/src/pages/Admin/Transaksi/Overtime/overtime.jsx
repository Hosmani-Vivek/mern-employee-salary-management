import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../../../layout";
import { Breadcrumb } from "../../../../components";

const OvertimeForm = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    id_pegawai: "", // matches data_pegawai.id_pegawai
    date: "",
    hours: "",
    reason: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3000/data_pegawai") // your employees endpoint
      .then((res) => setEmployees(res.data))
      .catch(() => setServerError("Failed to load employee list."));
  }, []);

  const validate = () => {
    const errs = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!form.id_pegawai) errs.id_pegawai = "Employee is required.";

    if (!form.date) {
      errs.date = "Date is required.";
    } else {
      const inputDate = new Date(form.date);
      inputDate.setHours(0, 0, 0, 0);
      const diffDays = (today - inputDate) / (1000 * 60 * 60 * 24);
      if (inputDate > today) errs.date = "Date cannot be in the future.";
      else if (diffDays > 7)
        errs.date = "Cannot log overtime older than 7 days.";
    }

    if (!form.hours) {
      errs.hours = "Hours is required.";
    } else if (Number(form.hours) < 1 || Number(form.hours) > 6) {
      errs.hours = "Overtime hours must be between 1 and 6.";
    }

    if (!form.reason.trim()) {
      errs.reason = "Reason is required.";
    } else if (form.reason.trim().length < 10) {
      errs.reason = `Reason must be at least 10 characters (${
        form.reason.trim().length
      }/10).`;
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);
    setErrors({});

    try {
      setLoading(true);
      await axios.post("http://localhost:3000/overtime", form);
      setSuccess("Overtime submitted successfully for payroll processing.");
      setForm({ id_pegawai: "", date: "", hours: "", reason: "" });
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Server error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-md border bg-transparent px-4 py-2.5 text-sm outline-none transition
     focus:border-primary dark:bg-meta-4 dark:text-white
     ${
       errors[field]
         ? "border-red-500 dark:border-red-500"
         : "border-stroke dark:border-strokedark"
     }`;

  return (
    <Layout>
      <Breadcrumb pageName="Overtime Data" />

      <div className="rounded-sm border border-stroke bg-white px-5 pb-8 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h2 className="text-gray-400 dark:text-gray-500 mb-6 text-xs font-semibold uppercase tracking-widest">
          Overtime Entry
        </h2>

        {serverError && (
          <div className="border-red-700 bg-red-950 text-red-300 mb-5 flex items-center gap-2 rounded-md border px-4 py-3 text-sm">
            ⚠ {serverError}
          </div>
        )}
        {success && (
          <div className="border-green-700 bg-green-950 text-green-300 mb-5 flex items-center gap-2 rounded-md border px-4 py-3 text-sm">
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* ── Employee select ─────────────────────────────── */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={form.id_pegawai}
                onChange={(e) =>
                  setForm({ ...form, id_pegawai: e.target.value })
                }
                className={inputClass("id_pegawai")}>
                <option value="">— Select Employee —</option>
                {employees.map((emp) => (
                  // <option key={emp.id_pegawai} value={emp.id_pegawai}>
                  //   {/*
                  //     Shows: "EMP-001 · Ahmad Fauzi (Site Manager)"
                  //     id_pegawai  →  the employee code from your table
                  //     nama_pegawai → full name
                  //     jabatan      → job title / position
                  //      {emp.id_pegawai} · {emp.nama_pegawai} ({emp.jabatan})
                  //   */}
                  //   {emp.id_pegawai} ({emp.jabatan})
                  // </option>
                  <option key={emp.id_pegawai} value={emp.id_pegawai}>
                    {emp.nama_pegawai}
                  </option>
                ))}
              </select>

              {errors.id_pegawai && (
                <p className="text-red-400 text-xs">{errors.id_pegawai}</p>
              )}
            </div>

            {/* ── Date ───────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass("date")}
              />
              {errors.date && (
                <p className="text-red-400 text-xs">{errors.date}</p>
              )}
            </div>

            {/* ── Hours ──────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Overtime Hours (1–6) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 2"
                min={1}
                max={6}
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                className={inputClass("hours")}
              />
              {errors.hours && (
                <p className="text-red-400 text-xs">{errors.hours}</p>
              )}
            </div>

            {/* ── Reason ─────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Minimum 10 characters — describe why overtime was needed"
                rows={4}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className={inputClass("reason")}
              />
              <div className="flex justify-between">
                {errors.reason ? (
                  <p className="text-red-400 text-xs">{errors.reason}</p>
                ) : (
                  <span />
                )}
                <span
                  className={`text-xs ${
                    form.reason.trim().length >= 10
                      ? "text-green-400"
                      : "text-gray-500"
                  }`}>
                  {form.reason.trim().length} chars
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Submitting…
              </>
            ) : (
              "Submit Overtime"
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default OvertimeForm;
