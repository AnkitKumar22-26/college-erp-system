// client/src/pages/students/StudentProfile.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Grid,
  Avatar,
  Typography,
  Chip,
  Button,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { studentApi } from "../../api/student.api";
import { PageHeader } from "../../components/common/StatCard";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    studentApi.getById(id).then(({ data }) => setStudent(data.data));
  }, [id]);

  if (!student) return null;

  const photoUrl = student.photoUrl
    ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${student.photoUrl}`
    : undefined;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/students")} sx={{ mb: 2 }}>
        Back to Students
      </Button>

      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        subtitle={`${student.admissionNo} · ${student.department?.name}`}
        action={
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/students/${id}/edit`)}>
            Edit Profile
          </Button>
        }
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
            <Avatar src={photoUrl} sx={{ width: 96, height: 96, mx: "auto", mb: 2, fontSize: 32 }}>
              {student.firstName[0]}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{student.firstName} {student.lastName}</Typography>
            <Chip size="small" label={student.status} color="success" sx={{ mt: 1 }} />

            <Divider sx={{ my: 2.5 }} />

            <Box sx={{ textAlign: "left" }}>
              {[
                ["Roll No", student.rollNo],
                ["Semester / Section", `${student.semester} - ${student.section}`],
                ["Academic Year", student.academicYear],
                ["Phone", student.phone],
                ["Email", student.email],
                ["Address", [student.address, student.city, student.state, student.pincode].filter(Boolean).join(", ") || "—"],
              ].map(([label, value]) => (
                <Box key={label} sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, textAlign: "left" }}>
              Guardian
            </Typography>
            <Box sx={{ textAlign: "left" }}>
              <Typography variant="body2">{student.guardianName} ({student.guardianRelation || "Guardian"})</Typography>
              <Typography variant="body2" color="text.secondary">{student.guardianPhone}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ borderRadius: 3 }}>
            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}>
              <Tab label="Attendance" />
              <Tab label="Fee History" />
            </Tabs>

            {tab === 0 && (
              <Box sx={{ p: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(student.attendances || []).length === 0 && (
                      <TableRow><TableCell colSpan={3} align="center">No attendance records yet</TableCell></TableRow>
                    )}
                    {(student.attendances || []).map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{new Date(a.date).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell>
                          <Chip size="small" label={a.status} color={a.status === "PRESENT" ? "success" : "default"} />
                        </TableCell>
                        <TableCell>{a.remarks || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            {tab === 1 && (
              <Box sx={{ p: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fee Structure</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Paid</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(student.studentFees || []).length === 0 && (
                      <TableRow><TableCell colSpan={4} align="center">No fee records yet</TableCell></TableRow>
                    )}
                    {(student.studentFees || []).map((f) => (
                      <TableRow key={f.id}>
                        <TableCell>{f.feeStructure?.name}</TableCell>
                        <TableCell>₹{Number(f.totalAmount).toLocaleString("en-IN")}</TableCell>
                        <TableCell>₹{Number(f.paidAmount).toLocaleString("en-IN")}</TableCell>
                        <TableCell><Chip size="small" label={f.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
