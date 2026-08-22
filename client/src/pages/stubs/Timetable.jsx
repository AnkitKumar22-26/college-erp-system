// client/src/pages/stubs/Timetable.jsx
import { useEffect, useState } from "react";
import { 
  Box, Paper, Grid, TextField, MenuItem, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip 
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { timetableApi } from "../../api/misc.api";
import useDepartments from "../../hooks/useDepartments";
import { PageHeader } from "../../components/common/StatCard";
import { useAuth } from "../../context/AuthContext";

const ADMIN_ROLES = ["ADMIN", "PRINCIPAL", "HOD"];
const DAYS = [
  { id: 1, name: "MONDAY" },
  { id: 2, name: "TUESDAY" },
  { id: 3, name: "WEDNESDAY" },
  { id: 4, name: "THURSDAY" },
  { id: 5, name: "FRIDAY" },
  { id: 6, name: "SATURDAY" },
];

const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:10 AM - 12:05 PM",
  "12:05 PM - 01:00 PM",
  "01:50 PM - 02:40 PM",
  "02:50 PM - 03:40 PM",
  "03:40 PM - 04:30 PM",
];

export default function Timetable() {
  const { departments } = useDepartments();
  const { user } = useAuth();
  const userRole = user?.role ? String(user.role).trim().toUpperCase() : "";
  const isAdmin = ADMIN_ROLES.includes(userRole);

  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState("3");
  const [section, setSection] = useState("");
  const [timetables, setTimetables] = useState([]);

  // Upload Modal State
  const [openUpload, setOpenUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadDept, setUploadDept] = useState("");
  const [uploadSem, setUploadSem] = useState("3");
  const [uploadSec, setUploadSec] = useState("S1");
  const [uploadYear, setUploadYear] = useState("2026-2027");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (departments.length > 0 && !uploadDept) {
      setUploadDept(departments[0].id);
      setDepartmentId(departments[0].id);
    }
  }, [departments]);

  const fetchTimetables = () => {
    timetableApi
      .list({ 
        departmentId: departmentId || undefined, 
        semester: semester || undefined, 
        section: section || undefined 
      })
      .then(({ data }) => setTimetables(data.data || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTimetables();
  }, [departmentId, semester, section]);

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an Excel file first.");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("departmentId", uploadDept);
    formData.append("semester", uploadSem);
    formData.append("section", uploadSec || "S1");
    formData.append("academicYear", uploadYear);

    try {
      setError("");
      setSuccess("");
      await timetableApi.uploadExcel(formData);
      setSuccess("Timetable Excel Uploaded & PDF Matrix Generated Successfully!");
      setOpenUpload(false);
      setFile(null);
      fetchTimetables();
    } catch (err) {
      console.error("Upload Error:", err);
      setError(err.response?.data?.message || "Failed to upload excel file.");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <PageHeader title="College Master Timetable" subtitle="PDF Matrix Grid View matching College Routine" />
        {isAdmin && (
          <Button variant="contained" color="secondary" startIcon={<CloudUploadIcon />} onClick={() => setOpenUpload(true)}>
            Upload Excel Routine
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Filter Toolbar */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField select fullWidth label="Department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. S1, S2" />
          </Grid>
        </Grid>
      </Paper>

      {timetables.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Typography color="text.secondary">No timetable found for this filter. Please upload your section Excel routine.</Typography>
        </Paper>
      )}

      {/* PDF Style Matrix Grid View */}
      {timetables.map((tt) => {
        // Map slots by day and timing for quick lookup
        const slotMatrix = {};
        tt.slots.forEach(slot => {
          const day = slot.dayOfWeek ?? 1;
          const timeKey = `${slot.startTime} - ${slot.endTime}`;
          if (!slotMatrix[day]) slotMatrix[day] = {};
          slotMatrix[day][timeKey] = slot;
        });

        return (
          <Paper key={tt.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3, overflow: "hidden" }}>
            <Box sx={{ bgcolor: "#1e293b", color: "#fff", p: 2, borderRadius: 2, mb: 2, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {tt.department?.name || "Department"} — SEMESTER {tt.semester} (SECTION: {tt.section}) [{tt.academicYear || "2026-2027"}]
              </Typography>
            </Box>

            <TableContainer sx={{ overflowX: "auto", border: "1px solid #cbd5e1" }}>
              <Table size="small" sx={{ minWidth: 900, "& th, & td": { border: "1px solid #cbd5e1" } }}>
                <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center", width: "120px" }}>DAY / SECTION</TableCell>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center", width: "100px" }}>ROOM NO</TableCell>
                    {TIME_SLOTS.map((time, idx) => (
                      <TableCell key={idx} sx={{ fontWeight: "bold", textAlign: "center", fontSize: "0.75rem" }}>
                        {time}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DAYS.map((day) => {
                    const firstSlot = tt.slots.find(s => (s.dayOfWeek ?? 1) === day.id);
                    const roomNo = firstSlot?.room || "B-302";

                    return (
                      <TableRow key={day.id} sx={{ "&:nth-of-type(odd)": { bgcolor: "#fafafa" } }}>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#f8fafc", textAlign: "center" }}>
                          {day.name}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", fontWeight: 600, color: "text.secondary" }}>
                          {roomNo}
                        </TableCell>
                        {TIME_SLOTS.map((timeStr, tIdx) => {
                          // Find matching slot for this day and time
                          const matchedSlot = tt.slots.find(s => {
                            const sDay = s.dayOfWeek ?? 1;
                            const sTime = `${s.startTime} - ${s.endTime}`;
                            return sDay === day.id && sTime === timeStr;
                          });

                          return (
                            <TableCell key={tIdx} sx={{ textAlign: "center", p: 1, minWidth: "130px" }}>
                              {matchedSlot ? (
                                <Box sx={{ p: 0.8, bgcolor: "#e2e8f0", borderRadius: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.dark", fontSize: "0.8rem" }}>
                                    {matchedSlot.subject?.name || "Subject"}
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontSize: "0.7rem" }}>
                                    {matchedSlot.faculty ? `${matchedSlot.faculty.firstName} ${matchedSlot.faculty.lastName}` : ""}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.disabled">—</Typography>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );
      })}

      {/* Excel Upload Dialog with Inputs */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Upload College Routine Excel (.xlsx)</DialogTitle>
        <form onSubmit={handleExcelUpload}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField select label="Department" value={uploadDept} onChange={(e) => setUploadDept(e.target.value)} required>
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
            <TextField label="Semester" value={uploadSem} onChange={(e) => setUploadSem(e.target.value)} required />
            <TextField label="Section (e.g. S1, S2, A)" value={uploadSec} onChange={(e) => setUploadSec(e.target.value)} required />
            <TextField label="Academic Year" value={uploadYear} onChange={(e) => setUploadYear(e.target.value)} required />
            
            <Button variant="outlined" component="label" sx={{ mt: 1, py: 1.5, borderStyle: "dashed" }}>
              <CloudUploadIcon sx={{ mr: 1 }} />
              {file ? file.name : "Choose Excel File (.xlsx)"}
              <input type="file" hidden accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} required />
            </Button>
            <Typography variant="caption" color="text.secondary">
              Note: Excel file should contain columns like <b>Section</b>, <b>Subject</b>, <b>Faculty</b>, <b>dayOfWeek</b> (0-6), <b>startTime</b>, <b>endTime</b>, <b>Room</b>.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Upload & Generate Matrix</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}