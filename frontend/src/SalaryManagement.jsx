import React, { useMemo, useState } from "react";
import {
  Plus, Search, Users, GraduationCap, BriefcaseBusiness,
  Wallet, Pencil, Trash2, X, Download, PhilippinePeso
} from "lucide-react";

const initialEmployees = [
  {
    id: "EMP-001",
    name: "Juan Dela Cruz",
    category: "Faculty",
    position: "Instructor",
    department: "Information Technology",
    basic: 25000,
    allowance: 2500,
    deduction: 1500
  },
  {
    id: "EMP-002",
    name: "Maria Santos",
    category: "Administration",
    position: "Administrative Officer",
    department: "Finance Office",
    basic: 28000,
    allowance: 3000,
    deduction: 1800
  },
  {
    id: "EMP-003",
    name: "Pedro Reyes",
    category: "Other Personnel",
    position: "IT Support Staff",
    department: "IT Services",
    basic: 20000,
    allowance: 1500,
    deduction: 1200
  }
];

const emptyForm = {
  id: "",
  name: "",
  category: "Faculty",
  position: "",
  department: "",
  basic: "",
  allowance: "",
  deduction: ""
};

const money = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2
  }).format(amount);

export default function SalaryManagement() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesCategory =
        category === "All" || employee.category === category;

      const term = search.toLowerCase();

      const matchesSearch = [
        employee.id,
        employee.name,
        employee.position,
        employee.department
      ].some((value) => value.toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [employees, search, category]);

  const totals = useMemo(() => {
    return employees.reduce(
      (result, employee) => {
        result.basic += Number(employee.basic);
        result.allowance += Number(employee.allowance);
        result.deduction += Number(employee.deduction);
        result.net +=
          Number(employee.basic) +
          Number(employee.allowance) -
          Number(employee.deduction);
        return result;
      },
      { basic: 0, allowance: 0, deduction: 0, net: 0 }
    );
  }, [employees]);

  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      id: `EMP-${String(Date.now()).slice(-6)}`
    });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (employee) => {
    setEditingId(employee.id);
    setForm({ ...employee });
    setError("");
    setModalOpen(true);
  };

  const saveEmployee = (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.position.trim() ||
      !form.department.trim()
    ) {
      setError("Please complete the employee's required details.");
      return;
    }

    const basic = Number(form.basic);
    const allowance = Number(form.allowance);
    const deduction = Number(form.deduction);

    if (
      !Number.isFinite(basic) ||
      !Number.isFinite(allowance) ||
      !Number.isFinite(deduction) ||
      basic < 0 ||
      allowance < 0 ||
      deduction < 0 ||
      deduction > basic + allowance
    ) {
      setError(
        "Enter valid non-negative amounts. Deductions cannot exceed gross pay."
      );
      return;
    }

    const employee = {
      ...form,
      id: editingId || form.id,
      basic,
      allowance,
      deduction
    };

    if (editingId) {
      setEmployees((current) =>
        current.map((item) =>
          item.id === editingId ? employee : item
        )
      );
    } else {
      setEmployees((current) => [...current, employee]);
    }

    setModalOpen(false);
    setForm(emptyForm);
    setError("");
  };

  const deleteEmployee = (id) => {
    if (window.confirm("Delete this salary record?")) {
      setEmployees((current) =>
        current.filter((employee) => employee.id !== id)
      );
    }
  };

  const exportCSV = () => {
    const headers = [
      "Employee ID",
      "Name",
      "Category",
      "Position",
      "Department",
      "Basic Salary",
      "Allowance",
      "Deductions",
      "Net Pay"
    ];

    const rows = filteredEmployees.map((employee) => [
      employee.id,
      employee.name,
      employee.category,
      employee.position,
      employee.department,
      employee.basic,
      employee.allowance,
      employee.deduction,
      employee.basic + employee.allowance - employee.deduction
    ]);

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "idsc-salary-records.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const categories = [
    { name: "All", label: "All Personnel", icon: Users },
    { name: "Faculty", label: "Faculty", icon: GraduationCap },
    {
      name: "Administration",
      label: "Administration",
      icon: BriefcaseBusiness
    },
    {
      name: "Other Personnel",
      label: "Other Personnel",
      icon: Wallet
    }
  ];

  return (
    <section className="salary-page">
      <div className="salary-heading">
        <div>
          <span className="salary-eyebrow">PAYROLL MANAGEMENT</span>
          <h2>Salary Management</h2>
          <p>Manage employee compensation and salary records.</p>
        </div>

        <div className="salary-heading-actions">
          <button className="salary-secondary" onClick={exportCSV}>
            <Download size={16} />
            Export CSV
          </button>
          <button className="salary-primary" onClick={openAdd}>
            <Plus size={17} />
            Add Employee
          </button>
        </div>
      </div>

      <div className="salary-demo-note">
        <strong>Demo data:</strong> The displayed employee names and salaries
        are examples only. Replace them with authorized IDSC payroll records.
      </div>

      <div className="salary-summary-grid">
        <div className="salary-summary-card">
          <div className="salary-summary-icon green">
            <Users size={20} />
          </div>
          <span>Total Personnel</span>
          <strong>{employees.length}</strong>
          <small>Salary records entered</small>
        </div>

        <div className="salary-summary-card">
          <div className="salary-summary-icon blue">
            <Wallet size={20} />
          </div>
          <span>Total Basic Salaries</span>
          <strong>{money(totals.basic)}</strong>
          <small>Monthly sample total</small>
        </div>

        <div className="salary-summary-card">
          <div className="salary-summary-icon orange">
            <PhilippinePeso size={20} />
          </div>
          <span>Total Deductions</span>
          <strong>{money(totals.deduction)}</strong>
          <small>Monthly sample total</small>
        </div>

        <div className="salary-summary-card">
          <div className="salary-summary-icon purple">
            <Wallet size={20} />
          </div>
          <span>Estimated Net Payroll</span>
          <strong>{money(totals.net)}</strong>
          <small>After listed deductions</small>
        </div>
      </div>

      <div className="salary-category-grid">
        {categories.map(({ name, label, icon: Icon }) => {
          const count =
            name === "All"
              ? employees.length
              : employees.filter((e) => e.category === name).length;

          return (
            <button
              key={name}
              className={`salary-category-card ${
                category === name ? "selected" : ""
              }`}
              onClick={() => setCategory(name)}
            >
              <Icon size={20} />
              <span>{label}</span>
              <strong>{count}</strong>
            </button>
          );
        })}
      </div>

      <div className="salary-table-panel">
        <div className="salary-table-heading">
          <div>
            <h3>Employee Salary Records</h3>
            <p>Basic pay, allowances, deductions, and net pay.</p>
          </div>

          <label className="salary-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee..."
              aria-label="Search employee salary records"
            />
          </label>
        </div>

        <div className="salary-table-wrap">
          <table className="salary-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Category</th>
                <th>Position / Department</th>
                <th>Basic Salary</th>
                <th>Allowance</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => {
                const net =
                  Number(employee.basic) +
                  Number(employee.allowance) -
                  Number(employee.deduction);

                return (
                  <tr key={employee.id}>
                    <td>
                      <div className="salary-employee">
                        <div className="salary-avatar">
                          {employee.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <strong>{employee.name}</strong>
                          <small>{employee.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="salary-badge">
                        {employee.category}
                      </span>
                    </td>
                    <td>
                      <strong>{employee.position}</strong>
                      <small className="salary-department">
                        {employee.department}
                      </small>
                    </td>
                    <td>{money(Number(employee.basic))}</td>
                    <td>{money(Number(employee.allowance))}</td>
                    <td>{money(Number(employee.deduction))}</td>
                    <td className="salary-net">{money(net)}</td>
                    <td>
                      <div className="salary-action">
                        <button
                          title="Edit employee"
                          aria-label={`Edit ${employee.name}`}
                          onClick={() => openEdit(employee)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          title="Delete employee"
                          aria-label={`Delete ${employee.name}`}
                          className="salary-delete"
                          onClick={() => deleteEmployee(employee.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="8" className="salary-empty">
                    No salary records found. Add an employee or change your
                    search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="salary-table-footer">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      {modalOpen && (
        <div
          className="salary-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <div
            className="salary-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="salary-modal-title"
          >
            <div className="salary-modal-heading">
              <div>
                <h3 id="salary-modal-title">
                  {editingId ? "Edit Salary Record" : "Add Employee"}
                </h3>
                <p>Enter the employee and compensation details.</p>
              </div>
              <button
                type="button"
                className="salary-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveEmployee}>
              <div className="salary-form-grid">
                <label>
                  Employee ID
                  <input value={form.id} disabled />
                </label>

                <label>
                  Employee Name *
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Full name"
                    required
                  />
                </label>

                <label>
                  Personnel Category *
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option>Faculty</option>
                    <option>Administration</option>
                    <option>Other Personnel</option>
                  </select>
                </label>

                <label>
                  Position *
                  <input
                    value={form.position}
                    onChange={(e) =>
                      setForm({ ...form, position: e.target.value })
                    }
                    placeholder="e.g. Instructor"
                    required
                  />
                </label>

                <label className="salary-full-width">
                  Department / Office *
                  <input
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    placeholder="e.g. Finance Office"
                    required
                  />
                </label>

                <label>
                  Basic Salary (₱) *
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.basic}
                    onChange={(e) =>
                      setForm({ ...form, basic: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Allowance (₱)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.allowance}
                    onChange={(e) =>
                      setForm({ ...form, allowance: e.target.value })
                    }
                  />
                </label>

                <label className="salary-full-width">
                  Deductions (₱)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.deduction}
                    onChange={(e) =>
                      setForm({ ...form, deduction: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="salary-net-preview">
                <span>Estimated Net Pay</span>
                <strong>
                  {money(
                    Math.max(
                      0,
                      (Number(form.basic) || 0) +
                        (Number(form.allowance) || 0) -
                        (Number(form.deduction) || 0)
                    )
                  )}
                </strong>
                <small>Basic salary + allowance − deductions</small>
              </div>

              {error && <p className="salary-form-error">{error}</p>}

              <div className="salary-modal-actions">
                <button
                  type="button"
                  className="salary-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="salary-primary">
                  {editingId ? "Save Changes" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
