// client/src/pages/fees/FeeList.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Chip, MenuItem, TextField } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PaymentIcon from "@mui/icons-material/Payment";
import { toast } from "react-toastify";
import { feeApi } from "../../api/fee.api";
import useDepartments from "../../hooks/useDepartments";
import useDebounce from "../../hooks/useDebounce";
import DataTable from "../../components/common/DataTable";
import { PageHeader } from "../../components/common/StatCard";

const STATUS_COLOR = { PAID: "success", PARTIAL: "warning", PENDING: "default", OVERDUE: "error" };

export default function FeeList() {
  const navigate = useNavigate();
  const { departments } = useDepartments();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search);

  const fetchFees = useCallback(() => {
    setLoading(true);
    feeApi
      .getPending({ page, limit, search: debouncedSearch, departmentId: departmentId || undefined, status: status || undefined })
      .then(({ data }) => {
        setRows(data.data);
        setTotal(data.pagination.total);
      })
      .catch(() => toast.error("Failed to load fee records"))
      .finally(() => setLoading(false));
  }, [page, limit, debouncedSearch, departmentId, status]);

  useEffect(() => { fetchFees(); }, [fetchFees]);

  const handleExport = async () => {
    try {
      const res = await feeApi.exportExcel({ departmentId: departmentId || undefined, status: status || undefined });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "fees-report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Export failed");
    }
  };

  const columns = [
    { key: "student", label: "Student", render: (r) => `${r.student.firstName} ${r.student.lastName}` },
    { key: "admissionNo", label: "Admission No", render: (r) => r.student.admissionNo },
    { key: "structure", label: "Fee Structure", render: (r) => r.feeStructure.name },
    { key: "total", label: "Total", render: (r) => `₹${Number(r.totalAmount).toLocaleString("en-IN")}` },
    { key: "paid", label: "Paid", render: (r) => `₹${Number(r.paidAmount).toLocaleString("en-IN")}` },
    { key: "dueDate", label: "Due Date", render: (r) => new Date(r.dueDate).toLocaleDateString("en-IN") },
    { key: "status", label: "Status", render: (r) => <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <Button size="small" startIcon={<PaymentIcon />} onClick={() => navigate(`/fees/collect/${r.id}`)} disabled={r.status === "PAID"}>
          Collect
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Fee Management"
        subtitle="Track pending, partial, and completed fee payments"
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
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or admission no..."
        toolbar={
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField select size="small" label="Department" value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }} sx={{ minWidth: 180 }}>
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} sx={{ minWidth: 150 }}>
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PARTIAL">Partial</MenuItem>
              <MenuItem value="OVERDUE">Overdue</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
            </TextField>
          </Box>
        }
      />
    </Box>
  );
}
