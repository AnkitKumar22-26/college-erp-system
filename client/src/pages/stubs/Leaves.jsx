// client/src/pages/stubs/Leaves.jsx
import { useEffect, useState } from "react";
import { Box, Button, Paper, Grid, TextField, Chip } from "@mui/material";
import { toast } from "react-toastify";
import { leaveApi } from "../../api/misc.api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/common/StatCard";
import DataTable from "../../components/common/DataTable";

const STATUS_COLOR = { PENDING: "warning", APPROVED: "success", REJECTED: "error" };

export default function Leaves() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fromDate: "", toDate: "", reason: "" });

  const fetchLeaves = () => {
    setLoading(true);
    leaveApi.list({ page, limit }).then(({ data }) => { setRows(data.data); setTotal(data.pagination.total); }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, [page, limit]);

  const handleApply = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (user.role === "STUDENT") payload.studentId = user.id;
    else payload.facultyId = user.id;
    try {
      await leaveApi.apply(payload);
      toast.success("Leave application submitted");
      setForm({ fromDate: "", toDate: "", reason: "" });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply for leave");
    }
  };

  const handleAction = async (id, status) => {
    try {
      await leaveApi.updateStatus(id, { status });
      toast.success(`Leave ${status.toLowerCase()}`);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  // कौन अप्रूव कर सकता है उसके नियम
  const canApproveRecord = (r) => {
    if (user?.role === "ADMIN" || user?.role === "PRINCIPAL") {
      return r.status === "PENDING"; // एडमिन सभी की पेंडिंग लीव अप्रूव कर सकता है
    }
    if (user?.role === "FACULTY") {
      // फैकल्टी केवल 'Student' की लीव अप्रूव कर सकती है, अपनी खुद की या अन्य फैकल्टी की नहीं
      return r.status === "PENDING" && r.studentId !== null && r.facultyId === null;
    }
    return false;
  };

  const columns = [
    {
      key: "applicant",
      label: "Applicant",
      render: (r) => r.student ? `${r.student.firstName} ${r.student.lastName} (Student)` : r.faculty ? `${r.faculty.firstName} ${r.faculty.lastName} (Faculty)` : "—",
    },
    { key: "fromDate", label: "From", render: (r) => new Date(r.fromDate).toLocaleDateString("en-IN") },
    { key: "toDate", label: "To", render: (r) => new Date(r.toDate).toLocaleDateString("en-IN") },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status", render: (r) => <Chip size="small" label={r.status} color={STATUS_COLOR[r.status]} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) =>
        canApproveRecord(r) ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" color="success" onClick={() => handleAction(r.id, "APPROVED")}>Approve</Button>
            <Button size="small" color="error" onClick={() => handleAction(r.id, "REJECTED")}>Reject</Button>
          </Box>
        ) : "—",
    },
  ];

  return (
    <Box>
      <PageHeader title="Leave Management" subtitle="Apply for leave and manage approval workflow" />

      <Paper component="form" onSubmit={handleApply} variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth required type="date" label="From Date" InputLabelProps={{ shrink: true }} value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth required type="date" label="To Date" InputLabelProps={{ shrink: true }} value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth required label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button type="submit" variant="contained" fullWidth>Apply</Button>
          </Grid>
        </Grid>
      </Paper>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChannel={(l) => { setLimit(l); setPage(1); }}
      />
    </Box>
  );
}