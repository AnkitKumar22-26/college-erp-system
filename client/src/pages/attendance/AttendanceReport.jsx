// client/src/pages/attendance/AttendanceReport.jsx
import { useEffect, useState, useCallback } from "react";
import { Box, Button, Chip, MenuItem, TextField } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { toast } from "react-toastify";
import { attendanceApi } from "../../api/attendance.api";
import useDepartments from "../../hooks/useDepartments";
import DataTable from "../../components/common/DataTable";
import { PageHeader } from "../../components/common/StatCard";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AttendanceReport() {
  const { departments } = useDepartments();
  const now = new Date();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(() => {
    setLoading(true);
    attendanceApi
      .getStudentReport({ page, limit, month, year, departmentId: departmentId || undefined })
      .then(({ data }) => {
        setRows(data.data);
        setTotal(data.pagination.total);
      })
      .catch(() => toast.error("Failed to load report"))
      .finally(() => setLoading(false));
  }, [page, limit, month, year, departmentId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExport = async () => {
    try {
      const res = await attendanceApi.exportStudentExcel({ month, year, departmentId: departmentId || undefined });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendance-report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Export failed");
    }
  };

  const columns = [
    { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleDateString("en-IN") },
    { key: "student", label: "Student", render: (r) => `${r.student.firstName} ${r.student.lastName}` },
    { key: "rollNo", label: "Roll No", render: (r) => r.student.rollNo },
    {
      key: "status",
      label: "Status",
      render: (r) => <Chip size="small" label={r.status} color={r.status === "PRESENT" ? "success" : r.status === "ABSENT" ? "error" : "default"} />,
    },
    { key: "remarks", label: "Remarks", render: (r) => r.remarks || "—" },
  ];

  return (
    <Box>
      <PageHeader
        title="Attendance Report"
        subtitle="Monthly attendance history across departments"
        action={<Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>Export Excel</Button>}
      />

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
        toolbar={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <TextField select size="small" label="Month" value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }} sx={{ minWidth: 140 }}>
              {MONTHS.map((m, idx) => <MenuItem key={m} value={idx + 1}>{m}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Year" value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }} sx={{ minWidth: 110 }}>
              {[year - 1, year, year + 1].map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Department" value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }} sx={{ minWidth: 180 }}>
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
          </Box>
        }
      />
    </Box>
  );
}
