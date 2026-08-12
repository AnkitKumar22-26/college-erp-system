import { useState, useEffect } from "react";
import { Box, Paper, Typography, Grid, LinearProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { EventAvailable as AttendanceIcon, WarningAmber, CheckCircleOutline } from "@mui/icons-material";
import { attendanceApi } from "../../api/attendance.api";
import { toast } from "react-toastify";

export default function StudentAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({
    overallPercentage: 0,
    totalClasses: 0,
    presentCount: 0,
    recentHistory: [],
    subjectBreakdown: []
  });

  useEffect(() => {
    attendanceApi.getMyAttendance()
      .then(({ data }) => {
        if (data.success) {
          setAttendanceData(data);
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to load attendance data");
      })
      .finally(() => setLoading(false));
  }, []);

  const { overallPercentage, totalClasses, presentCount, recentHistory } = attendanceData;

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, md: 3 } }}>
      
      {/* पेज हेडर */}
      <Typography variant="h4" fontWeight="800" sx={{ mb: 1, color: "text.primary" }}>
        My Attendance Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive view of your overall percentage, total classes attended, and daily records from database.
      </Typography>

      {/* 1. ओवरऑल परसेंटेज कार्ड */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3.5, 
          borderRadius: 4, 
          mb: 4, 
          background: overallPercentage >= 75 
            ? "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)" 
            : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
          border: "1px solid",
          borderColor: overallPercentage >= 75 ? "primary.light" : "error.light"
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              {overallPercentage >= 75 ? <CheckCircleOutline color="success" /> : <WarningAmber color="error" />}
              <Typography variant="h6" fontWeight="800" color={overallPercentage >= 75 ? "primary.dark" : "error.dark"}>
                Overall Attendance: {overallPercentage}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {overallPercentage >= 75 
                ? "✅ You are safe! Your attendance meets the 75% university criteria for examinations." 
                : "⚠️ Shortage Warning! Your attendance is below 75%. Please attend upcoming classes regularly."}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 600 }} color="text.secondary">
              Attended {presentCount} out of {totalClasses} total recorded classes.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: { sm: "right" } }}>
            <Typography variant="h3" fontWeight="800" color={overallPercentage >= 75 ? "success.main" : "error.main"}>
              {overallPercentage}%
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <LinearProgress 
              variant="determinate" 
              value={overallPercentage} 
              sx={{ height: 10, borderRadius: 5, backgroundColor: "#fff" }} 
              color={overallPercentage >= 75 ? "success" : "error"}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 2. डेली अटेंडेंस हिस्ट्री */}
      <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
        Recent Daily History
      </Typography>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
        {loading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">Loading attendance history...</Typography>
          </Box>
        ) : recentHistory.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">No attendance records found yet.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {recentHistory.map((record, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider"
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight="700">
                    {record.remarks || "Regular Class Attendance"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Date: {record.date}
                  </Typography>
                </Box>
                <Chip 
                  label={record.status} 
                  color={record.status === "PRESENT" || record.status === "LATE" || record.status === "HALF_DAY" ? "success" : "error"} 
                  size="small" 
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Paper>

    </Box>
  );
}