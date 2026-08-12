// client/src/pages/attendance/AttendanceMark.jsx
import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Typography,
  Chip,
} from "@mui/material";
import { toast } from "react-toastify";
import { attendanceApi } from "../../api/attendance.api";
import useDepartments from "../../hooks/useDepartments";
import { PageHeader } from "../../components/common/StatCard";

const STATUS_OPTIONS = ["PRESENT", "ABSENT", "LATE", "HALF_DAY", "LEAVE"];
const STATUS_COLOR = {
  PRESENT: "success",
  ABSENT: "error",
  LATE: "warning",
  HALF_DAY: "info",
  LEAVE: "default",
};

export default function AttendanceMark() {
  const { departments } = useDepartments();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [departmentId, setDepartmentId] = useState("");
  const [section, setSection] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchStudents = useCallback(() => {
    setLoading(true);
    attendanceApi
      .getStudentAttendance({ date, departmentId: departmentId || undefined, section: section || undefined })
      .then(({ data }) => {
        setStudents(data.data.map((s) => ({ ...s, status: s.status || "PRESENT" })));
      })
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setLoading(false));
  }, [date, departmentId, section]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const setStatus = (studentId, status) => {
    setStudents((prev) => prev.map((s) => (s.studentId === studentId ? { ...s, status } : s)));
  };

  const markAllPresent = () => setStudents((prev) => prev.map((s) => ({ ...s, status: "PRESENT" })));

  const handleSave = async () => {
    if (!students.length) return;
    setSaving(true);
    try {
      await attendanceApi.markStudentAttendance({
        date,
        records: students.map((s) => ({ studentId: s.studentId, status: s.status })),
      });
      toast.success("Attendance saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Mark Attendance" subtitle="Record daily attendance for students" />

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField select fullWidth label="Department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField fullWidth label="Section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="A" />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: "flex", gap: 1.5, justifyContent: { sm: "flex-end" } }}>
            <Button variant="outlined" onClick={markAllPresent}>Mark All Present</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving || !students.length}>
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">Loading students...</Typography>
          </Box>
        ) : students.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No students found for the selected filters</Typography>
          </Box>
        ) : (
          students.map((s, idx) => (
            <Box
              key={s.studentId}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 2.5,
                py: 1.5,
                borderBottom: idx !== students.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
                flexWrap: "wrap",
              }}
            >
              <Avatar sx={{ width: 36, height: 36 }}>{s.firstName[0]}</Avatar>
              <Box sx={{ minWidth: 180, flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</Typography>
                <Typography variant="caption" color="text.secondary">{s.rollNo} · {s.department}</Typography>
              </Box>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={s.status}
                onChange={(e, val) => val && setStatus(s.studentId, val)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <ToggleButton key={opt} value={opt} sx={{ px: 1.5, textTransform: "none" }}>
                    <Chip size="small" label={opt.replace("_", " ")} color={s.status === opt ? STATUS_COLOR[opt] : "default"} variant={s.status === opt ? "filled" : "outlined"} />
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
}
