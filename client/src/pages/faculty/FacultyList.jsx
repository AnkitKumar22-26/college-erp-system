// client/src/pages/faculty/FacultyList.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Avatar, Box, MenuItem, TextField, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { toast } from "react-toastify";
import { facultyApi } from "../../api/faculty.api";
import useDepartments from "../../hooks/useDepartments";
import useDebounce from "../../hooks/useDebounce";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/StatCard";

export default function FacultyList() {
  const navigate = useNavigate();
  const { departments } = useDepartments();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  const fetchFaculty = useCallback(() => {
    setLoading(true);
    facultyApi
      .list({ page, limit, search: debouncedSearch, departmentId: departmentId || undefined })
      .then(({ data }) => {
        setRows(data.data);
        setTotal(data.pagination.total);
      })
      .catch(() => toast.error("Failed to load faculty"))
      .finally(() => setLoading(false));
  }, [page, limit, debouncedSearch, departmentId]);

  useEffect(() => { fetchFaculty(); }, [fetchFaculty]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await facultyApi.remove(deleteTarget.id);
      toast.success("Faculty deactivated");
      setDeleteTarget(null);
      fetchFaculty();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await facultyApi.exportExcel({ search: debouncedSearch, departmentId: departmentId || undefined });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "faculty.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Export failed");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Faculty",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar src={row.photoUrl ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${row.photoUrl}` : undefined} sx={{ width: 32, height: 32 }}>
            {row.firstName[0]}
          </Avatar>
          <Box>
            <Box sx={{ fontWeight: 600, fontSize: 14 }}>{row.firstName} {row.lastName}</Box>
            <Box sx={{ fontSize: 12, color: "text.secondary" }}>{row.employeeCode}</Box>
          </Box>
        </Box>
      ),
    },
    { key: "department", label: "Department", render: (row) => row.department?.name },
    { key: "designation", label: "Designation" },
    { key: "experienceYrs", label: "Experience", render: (row) => `${row.experienceYrs} yrs` },
    { key: "phone", label: "Phone" },
    {
      key: "isActive",
      label: "Status",
      render: (row) => <Chip size="small" label={row.isActive ? "Active" : "Inactive"} color={row.isActive ? "success" : "default"} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => navigate(`/faculty/${row.id}/edit`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deactivate">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Faculty"
        subtitle="Manage teaching staff, subjects, and departmental assignments"
        action={
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>Export</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/faculty/new")}>Add Faculty</Button>
          </Box>
        }
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
        searchPlaceholder="Search by name, employee code..."
        toolbar={
          <TextField select size="small" label="Department" value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }} sx={{ minWidth: 200 }}>
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </TextField>
        }
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Deactivate faculty?"
        message={`${deleteTarget?.firstName} ${deleteTarget?.lastName} will be marked inactive and lose dashboard access.`}
        confirmLabel="Deactivate"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </Box>
  );
}
