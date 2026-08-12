// client/src/pages/stubs/Exams.jsx
import { useEffect, useState } from "react";
import { Box, Button, Paper, Grid, TextField, MenuItem, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import { examApi } from "../../api/misc.api";
import axios from "../../api/axios";
import { PageHeader } from "../../components/common/StatCard";
import DataTable from "../../components/common/DataTable";

export default function Exams() {
  const [rows, setRows] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subjectId: "", examType: "INTERNAL", examDate: "", maxMarks: 100 });

  // चेक करें कि क्या लॉगिन यूजर एक स्टूडेंट है
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStudent = user.role === "STUDENT";

  const fetchSchedules = () => {
    setLoading(true);
    examApi.getSchedules()
      .then(({ data }) => setRows(data.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchSchedules(); 
    
    // अगर यूजर स्टूडेंट नहीं है, तभी सब्जेक्ट्स की लिस्ट लोड करें
    if (!isStudent) {
      axios.get("/exams/subjects")
        .then((res) => {
          setSubjects(res.data.data || res.data || []);
        })
        .catch((err) => {
          console.log("Error loading subjects:", err);
        });
    }
  }, [isStudent]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subjectId) {
      toast.error("Please select a subject");
      return;
    }
    try {
      await examApi.createSchedule(form);
      toast.success("Exam scheduled successfully!");
      setForm({ subjectId: "", examType: "INTERNAL", examDate: "", maxMarks: 100 });
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule exam. Please check all fields.");
    }
  };

  const columns = [
    { key: "subject", label: "Subject", render: (r) => r.subject ? `${r.subject.name} (${r.subject.code})` : "N/A" },
    { key: "examType", label: "Type", render: (r) => <Chip size="small" label={r.examType} /> },
    { key: "examDate", label: "Date", render: (r) => r.examDate ? new Date(r.examDate).toLocaleDateString("en-IN") : "N/A" },
    { key: "maxMarks", label: "Max Marks" },
  ];

  return (
    <Box>
      <PageHeader 
        title="Examination" 
        subtitle={isStudent ? "View upcoming exam schedules" : "Schedule exams, enter marks, and generate results"} 
      />

      {/* अगर यूजर स्टूडेंट नहीं है (यानी स्टाफ/एडमिन है) तभी शेड्यूल फॉर्म दिखेगा */}
      {!isStudent && (
        <Paper component="form" onSubmit={handleCreate} variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                required
                label="Select Subject"
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                helperText={subjects.length === 0 ? "Loading subjects..." : "Choose a subject from the list"}
              >
                {subjects.length > 0 ? (
                  subjects.map((sub) => (
                    <MenuItem key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No subjects found.
                  </MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField select fullWidth label="Exam Type" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                <MenuItem value="INTERNAL">Internal</MenuItem>
                <MenuItem value="EXTERNAL">External</MenuItem>
                <MenuItem value="ASSIGNMENT">Assignment</MenuItem>
                <MenuItem value="PRACTICAL">Practical</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth required type="date" label="Exam Date" InputLabelProps={{ shrink: true }} value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button type="submit" variant="contained" startIcon={<AddIcon />} fullWidth sx={{ height: '56px' }}>Schedule</Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* परीक्षा का टेबल स्टूडेंट और स्टाफ दोनों को दिखेगा */}
      <DataTable columns={columns} rows={rows} loading={loading} />
    </Box>
  );
}