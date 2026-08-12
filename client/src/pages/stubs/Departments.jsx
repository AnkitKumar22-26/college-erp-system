// client/src/pages/stubs/Departments.jsx
import { useEffect, useState } from "react";
import { Box, Button, Paper, Grid, TextField, IconButton, Chip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { toast } from "react-toastify";
import { departmentApi } from "../../api/department.api";
import { PageHeader } from "../../components/common/StatCard";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function Departments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDepartments = () => {
    setLoading(true);
    departmentApi.list()
      .then(({ data }) => {
        // Safe check for data format
        setRows(data?.data || data || []);
      })
      .catch(() => toast.error("Failed to load departments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchDepartments(); 
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.warning("Please fill in all fields");
      return;
    }
    try {
      await departmentApi.create({ name: name.trim(), code: code.trim().toUpperCase() });
      toast.success("Department created successfully");
      setName(""); 
      setCode("");
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create department");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await departmentApi.remove(deleteTarget.id);
      toast.success("Department deleted successfully");
      setDeleteTarget(null);
      fetchDepartments();
    } catch (err) {
      // 500 or constraint error handling
      const errorMsg = err.response?.data?.message || "Cannot delete department. It may have active students or faculty assigned.";
      toast.error(errorMsg);
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: "name", label: "Department" },
    { key: "code", label: "Code", render: (r) => <Chip size="small" label={r?.code || "N/A"} /> },
    { key: "hod", label: "HOD", render: (r) => r?.hod ? `${r.hod.firstName} ${r.hod.lastName}` : "—" },
    { key: "students", label: "Students", render: (r) => r?._count?.students ?? 0 },
    { key: "faculty", label: "Faculty", render: (r) => r?._count?.faculty ?? 0 },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <IconButton size="small" color="error" onClick={() => setDeleteTarget(r)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title="Departments" subtitle="Manage academic departments, HOD assignments, and subjects" />

      <Paper component="form" onSubmit={handleCreate} variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Add New Department</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField 
              fullWidth 
              required 
              label="Department Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField 
              fullWidth 
              required 
              label="Code" 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              placeholder="CSE" 
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button type="submit" variant="contained" startIcon={<AddIcon />} fullWidth>
              Add Department
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <DataTable columns={columns} rows={rows} loading={loading} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete department?"
        message={`This will remove ${deleteTarget?.name || "this department"}. Departments with active students or faculty cannot be deleted.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}