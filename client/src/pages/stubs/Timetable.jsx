// client/src/pages/stubs/Timetable.jsx
import { useEffect, useState } from "react";
import { Box, Paper, Grid, TextField, MenuItem, Typography, Chip } from "@mui/material";
import { timetableApi } from "../../api/misc.api";
import useDepartments from "../../hooks/useDepartments";
import { PageHeader } from "../../components/common/StatCard";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Timetable() {
  const { departments } = useDepartments();
  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [timetables, setTimetables] = useState([]);

  useEffect(() => {
    timetableApi
      .list({ departmentId: departmentId || undefined, semester: semester || undefined, section: section || undefined })
      .then(({ data }) => setTimetables(data.data));
  }, [departmentId, semester, section]);

  return (
    <Box>
      <PageHeader title="Timetable" subtitle="Class schedules, faculty timetables, and room allocation" />

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
            <TextField fullWidth label="Section" value={section} onChange={(e) => setSection(e.target.value)} />
          </Grid>
        </Grid>
      </Paper>

      {timetables.length === 0 && (
        <Typography color="text.secondary">No timetable found for the selected filters.</Typography>
      )}

      {timetables.map((tt) => (
        <Paper key={tt.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            {tt.department?.name} · Semester {tt.semester} · Section {tt.section}
          </Typography>
          {tt.slots.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No slots added yet</Typography>
          ) : (
            tt.slots.map((slot) => (
              <Box key={slot.id} sx={{ display: "flex", gap: 2, alignItems: "center", py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                <Chip size="small" label={DAYS[slot.dayOfWeek]} />
                <Typography variant="body2">{slot.startTime} - {slot.endTime}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{slot.subject.name}</Typography>
                <Typography variant="body2" color="text.secondary">{slot.faculty.firstName} {slot.faculty.lastName}</Typography>
                {slot.room && <Chip size="small" variant="outlined" label={`Room ${slot.room}`} />}
              </Box>
            ))
          )}
        </Paper>
      ))}
    </Box>
  );
}
