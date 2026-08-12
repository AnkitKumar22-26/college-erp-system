// client/src/pages/stubs/Reports.jsx
import { Box, Card, CardContent, Typography, Button, Grid } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { PageHeader } from "../../components/common/StatCard";

const REPORTS = [
  { key: "students", label: "Student Report", desc: "Full student directory with department and status", endpoint: "/reports/students/excel", filename: "student-report.xlsx" },
  { key: "faculty", label: "Faculty Report", desc: "Faculty roster with designation and active status", endpoint: "/reports/faculty/excel", filename: "faculty-report.xlsx" },
  { key: "library", label: "Library Report", desc: "Book issue history and outstanding fines", endpoint: "/reports/library/excel", filename: "library-report.xlsx" },
  { key: "placements", label: "Placement Report", desc: "Selected students, companies, and packages", endpoint: "/reports/placements/excel", filename: "placement-report.xlsx" },
];

export default function Reports() {
  const handleDownload = async (report) => {
    try {
      const res = await api.get(report.endpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", report.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Failed to generate report");
    }
  };

  return (
    <Box>
      <PageHeader title="Reports" subtitle="Generate and download Excel reports across every module" />
      <Grid container spacing={2.5}>
        {REPORTS.map((r) => (
          <Grid item xs={12} sm={6} md={3} key={r.key}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{r.label}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>{r.desc}</Typography>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleDownload(r)} fullWidth>
                  Download
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
