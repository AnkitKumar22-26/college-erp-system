// client/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box, Skeleton } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import ApartmentIcon from "@mui/icons-material/ApartmentOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailableOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import ReportProblemIcon from "@mui/icons-material/ReportProblemOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import WorkIcon from "@mui/icons-material/WorkOutlineOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import { dashboardApi } from "../api/dashboard.api";
import { attendanceApi } from "../api/attendance.api"; // 👈 अटेंडेंस एपीआई इम्पोर्ट की गई
import { StatCard, PageHeader } from "../components/common/StatCard";
import { useAuth } from "../context/AuthContext";

const PIE_COLORS = ["#4338CA", "#0D9488", "#D97706", "#E11D48", "#6366F1", "#14B8A6"];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [feeTrend, setFeeTrend] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👉 स्टूडेंट के लिए अटेंडेंस परसेंटेज स्टेट
  const [studentAttendancePct, setStudentAttendancePct] = useState("--");

  const isStudent = user?.role === "STUDENT";

  useEffect(() => {
    if (isStudent) {
      // अगर स्टूडेंट है, तो उसकी खुद की अटेंडेंस का डेटा लाएं
      attendanceApi.getMyAttendance()
        .then((res) => {
          const data = res.data?.data || res.data;
          if (data && data.overallPercentage !== undefined) {
            setStudentAttendancePct(data.overallPercentage);
          }
        })
        .catch((err) => console.error("Error fetching student attendance summary:", err))
        .finally(() => setLoading(false));
      return;
    }

    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getAttendanceChart(),
      dashboardApi.getFeeChart(),
      dashboardApi.getDepartmentChart(),
    ])
      .then(([s, a, f, d]) => {
        setStats(s.data.data);
        setAttendanceTrend(a.data.data);
        setFeeTrend(f.data.data);
        setDeptData(d.data.data);
      })
      .finally(() => setLoading(false));
  }, [isStudent]);

  const currency = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

  const cardSx = {
    borderRadius: "12px",
    bgcolor: (theme) => (theme.palette.mode === "dark" ? "#131c31" : "rgba(255, 255, 255, 0.85)"),
    backdropFilter: "blur(8px)",
    boxShadow: (theme) => (theme.palette.mode === "dark" ? "none" : "0 4px 20px rgba(0, 131, 143, 0.08)"),
    border: (theme) => (theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(255, 255, 255, 0.6)"),
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    '&:hover': {
      transform: "translateY(-2px)",
      boxShadow: (theme) => (theme.palette.mode === "dark" ? "none" : "0 6px 24px rgba(0, 131, 143, 0.12)"),
    },
  };

  // यदि यूजर स्टूडेंट है, तो उसके लिए अपडेटेड स्टूडेंट डैशबोर्ड रेंडर करें
  if (isStudent) {
    return (
      <Box>
        <PageHeader 
          title={`Welcome, ${user?.name?.split(" ")[0] || "Student"}! 👋`} 
          subtitle="Here is your academic overview and quick shortcuts." 
        />

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              icon={<EventAvailableIcon />} 
              label="My Attendance" 
              value={studentAttendancePct !== "--" ? `${studentAttendancePct}%` : "-- %"} 
              color="#0D9488" 
              sx={cardSx} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard icon={<AssignmentIcon />} label="Upcoming Exams" value="View Schedule" color="#4338CA" sx={cardSx} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard icon={<MenuBookIcon />} label="Library Books" value="0 Issued" color="#D97706" sx={cardSx} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, p: 4, borderRadius: "12px", bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Student Portal Notice</Typography>
          <Typography variant="body2" color="text.secondary">
            You can check your detailed marksheets, attendance records, and exam timetables using the navigation menu on the left.
          </Typography>
        </Box>
      </Box>
    );
  }

  // एडमिन और स्टाफ के लिए फुल एडवांस्ड डैशबोर्ड
  return (
    <Box>
      <PageHeader 
        title={`Welcome, ${user?.name?.split(" ")[0] || "there"}`} 
        subtitle="Here's what's happening across your college today." 
      />

      <Grid container spacing={2.5}>
        {loading || !stats ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={92} sx={{ borderRadius: "12px" }} />
            </Grid>
          ))
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard icon={<SchoolIcon />} label="Total Students" value={stats.totalStudents} sx={cardSx} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard icon={<PeopleIcon />} label="Total Faculty" value={stats.totalFaculty} color="secondary.main" sx={cardSx} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard icon={<ApartmentIcon />} label="Departments" value={stats.totalDepartments} color="#D97706" sx={cardSx} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<EventAvailableIcon />}
                label="Today's Attendance"
                value={`${stats.todayAttendance.percentage}%`}
                color="#0D9488"
                sx={cardSx}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard icon={<PaymentsIcon />} label="Fees Collected" value={currency(stats.feesCollected)} color="secondary.main" sx={cardSx} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard icon={<ReportProblemIcon />} label="Pending Fees" value={currency(stats.pendingFees)} color="#E11D48" sx={cardSx} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard icon={<MenuBookIcon />} label="Books Issued" value={stats.booksIssued} color="#D97706" sx={cardSx} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard icon={<WorkIcon />} label="Placements" value={stats.placements} sx={cardSx} />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={7}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: (theme) => theme.palette.text.primary }}>
                Attendance — Last 7 Days
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#4338CA" radius={[4, 4, 0, 0]} name="Present" />
                  <Bar dataKey="absent" fill="#E11D48" radius={[4, 4, 0, 0]} name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ ...cardSx, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: (theme) => theme.palette.text.primary }}>
                Department-wise Students
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={deptData}
                    dataKey="students"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: (theme) => theme.palette.text.primary }}>
                Fee Collection — {new Date().getFullYear()}
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={feeTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v) => currency(v)} />
                  <Line type="monotone" dataKey="collected" stroke="#0D9488" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}