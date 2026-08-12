// client/src/pages/students/StudentList.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Chip,
  Avatar,
  Box,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import { toast } from "react-toastify";
import { studentApi } from "../../api/student.api";
import useDepartments from "../../hooks/useDepartments";
import useDebounce from "../../hooks/useDebounce";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/StatCard";

const STATUS_COLORS = {
  ACTIVE: "success",
  PROMOTED: "info",
  TRANSFERRED: "warning",
  GRADUATED: "default",
  SUSPENDED: "error",
  INACTIVE: "default",
};

const DEPT_COLORS = ["#4338CA", "#0D9488", "#D97706", "#E11D48", "#6366F1", "#14B8A6"];

export default function StudentList() {
  const navigate = useNavigate();
  const { departments } = useDepartments();

  // यदि selectedDepartmentId सेट है, तो उस डिपार्टमेंट के स्टूडेंट्स की टेबल दिखेगी
  // अन्यथा सभी विभागों के प्रोफेशनल कार्ड्स (Grid) दिखेंगे
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedDepartmentName, setSelectedDepartmentName] = useState("");

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  const fetchStudents = useCallback(() => {
    if (!selectedDepartmentId) return;
    setLoading(true);
    studentApi
      .list({ page, limit, search: debouncedSearch, departmentId: selectedDepartmentId })
      .then(({ data }) => {
        setRows(data.data);
        setTotal(data.pagination.total);
      })
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setLoading(false));
  }, [page, limit, debouncedSearch, selectedDepartmentId]);

  useEffect(() => {
    if (selectedDepartmentId) {
      fetchStudents();
    }
  }, [fetchStudents, selectedDepartmentId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await studentApi.remove(deleteTarget.id);
      toast.success("Student deleted");
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await studentApi.exportExcel({ search: debouncedSearch, departmentId: selectedDepartmentId || undefined });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "students.xlsx");
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
      label: "Student",
      render: (row) => {
        const apiUrl = (import.meta.env?.VITE_API_URL || "").replace("/api", "");
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar 
              src={row?.photoUrl ? `${apiUrl}${row.photoUrl}` : undefined} 
              sx={{ width: 32, height: 32 }}
            >
              {row?.firstName ? row.firstName[0] : "S"}
            </Avatar>
            <Box>
              <Box sx={{ fontWeight: 600, fontSize: 14 }}>
                {row?.firstName || ""} {row?.lastName || ""}
              </Box>
              <Box sx={{ fontSize: 12, color: "text.secondary" }}>{row?.admissionNo || ""}</Box>
            </Box>
          </Box>
        );
      },
    },
    { key: "department", label: "Department", render: (row) => row?.department?.name || "N/A" },
    { key: "semester", label: "Sem / Sec", render: (row) => `${row?.semester || ""} - ${row?.section || ""}` },
    { key: "phone", label: "Phone", render: (row) => row?.phone || "N/A" },
    {
      key: "status",
      label: "Status",
      render: (row) => <Chip size="small" label={row?.status || "ACTIVE"} color={STATUS_COLORS[row?.status] || "default"} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(`/students/${row.id}`)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => navigate(`/students/${row.id}/edit`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // 1. यदि कोई डिपार्टमेंट सेलेक्ट नहीं किया है, तो सारे विभागों के प्रोफेशनल कार्ड्स दिखाएं
  if (!selectedDepartmentId) {
    return (
      <Box>
        <PageHeader
          title="Students Directory"
          subtitle="Select a department to manage and view student records"
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/students/new")}>
              Add Student
            </Button>
          }
        />

        <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700, color: "text.primary" }}>
          Select Department
        </Typography>

        <Grid container spacing={3}>
          {departments?.map((dept, index) => {
            const cardColor = DEPT_COLORS[index % DEPT_COLORS.length];
            return (
              <Grid item xs={12} sm={6} md={4} key={dept.id}>
                <Card
                  onClick={() => {
                    setSelectedDepartmentId(dept.id);
                    setSelectedDepartmentName(dept.name);
                    setPage(1);
                  }}
                  sx={{
                    borderRadius: "16px",
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.25s ease",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                      borderColor: cardColor,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2.5 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "12px",
                        bgcolor: `${cardColor}15`,
                        color: cardColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <SchoolIcon fontSize="large" />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                        {dept.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Code: {dept.code || "N/A"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
          {(!departments || departments.length === 0) && (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                No departments found. Please add departments first.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  }

  // 2. डिपार्टमेंट सेलेक्ट करने के बाद उस डिपार्टमेंट के छात्रों की टेबल दिखेगी
  return (
    <Box>
      <PageHeader
        title={`${selectedDepartmentName} - Students`}
        subtitle="Manage admissions, profiles, and academic records for this department"
        action={
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                setSelectedDepartmentId("");
                setSelectedDepartmentName("");
                setSearch("");
              }}
            >
              Back to Departments
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
              Export
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/students/new")}>
              Add Student
            </Button>
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
        searchPlaceholder="Search by name, admission no, roll no..."
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete student?"
        message={`This will permanently remove ${deleteTarget?.firstName || ""} ${deleteTarget?.lastName || ""} and their login access.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </Box>
  );
}