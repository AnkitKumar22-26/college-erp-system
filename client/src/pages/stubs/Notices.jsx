// client/src/pages/stubs/Notices.jsx
import { useEffect, useState } from "react";
import { Box, Button, Paper, Grid, TextField, MenuItem, Select, Chip, OutlinedInput, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { toast } from "react-toastify";
import { noticeApi } from "../../api/misc.api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/common/StatCard";
import DataTable from "../../components/common/DataTable";

const ROLES = ["ADMIN", "PRINCIPAL", "HOD", "FACULTY", "STUDENT", "ACCOUNTANT", "LIBRARIAN", "RECEPTIONIST"];
const CAN_MANAGE = ["ADMIN", "PRINCIPAL", "HOD"];

export default function Notices() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "", audience: ["STUDENT", "FACULTY"] });

  const fetchNotices = () => {
    setLoading(true);
    noticeApi.list({ page, limit }).then(({ data }) => { setRows(data.data); setTotal(data.pagination.total); }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotices(); }, [page, limit]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    form.audience.forEach((a) => formData.append("audience[]", a));
    try {
      await noticeApi.create(formData);
      toast.success("Notice published");
      setForm({ title: "", content: "", audience: ["STUDENT", "FACULTY"] });
      fetchNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish notice");
    }
  };

  const handleDelete = async (id) => {
    try {
      await noticeApi.remove(id);
      toast.success("Notice deleted");
      fetchNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const columns = [
    { key: "title", label: "Title" },
    { key: "content", label: "Content", render: (r) => r.content.slice(0, 60) + (r.content.length > 60 ? "..." : "") },
    { key: "audience", label: "Audience", render: (r) => r.audience.map((a) => <Chip key={a} size="small" label={a} sx={{ mr: 0.5, mb: 0.5 }} />) },
    { key: "createdAt", label: "Posted", render: (r) => new Date(r.createdAt).toLocaleDateString("en-IN") },
    ...(CAN_MANAGE.includes(user?.role)
      ? [{ key: "actions", label: "", render: (r) => (
          <IconButton size="small" color="error" onClick={() => handleDelete(r.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        ) }]
      : []),
  ];

  return (
    <Box>
      <PageHeader title="Notice Board" subtitle="Publish announcements to students, faculty, and staff" />

      {CAN_MANAGE.includes(user?.role) && (
        <Paper component="form" onSubmit={handleCreate} variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                fullWidth
                multiple
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
                input={<OutlinedInput />}
                renderValue={(selected) => selected.join(", ")}
              >
                {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required multiline rows={3} label="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button type="submit" variant="contained" startIcon={<AddIcon />} fullWidth>Publish</Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />
    </Box>
  );
}
