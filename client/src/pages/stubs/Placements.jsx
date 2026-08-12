// client/src/pages/stubs/Placements.jsx
import { useEffect, useState } from "react";
import { Box, Button, Paper, Grid, TextField, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import { placementApi } from "../../api/misc.api"; // या आपकी सही पाथ फाइल
import { PageHeader } from "../../components/common/StatCard";
import DataTable from "../../components/common/DataTable";
import { useAuth } from "../../context/AuthContext";

export default function Placements() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "PRINCIPAL";

  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // फॉर्म स्टेट (कंपनी और ड्राइव दोनों के लिए)
  const [form, setForm] = useState({
    companyName: "",
    role: "",
    packageLPA: "",
    driveDate: ""
  });

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const [driveRes, compRes] = await Promise.all([
        placementApi.getDrives(),
        placementApi.getCompanies()
      ]);
      setDrives(driveRes.data.data || []);
      setCompanies(compRes.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch placement data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchDrives(); 
  }, []);

  const handleScheduleDrive = async (e) => {
    e.preventDefault();
    try {
      // 1. पहले चेक करें कि क्या कंपनी पहले से मौजूद है
      let existingComp = companies.find(
        (c) => c.name.toLowerCase() === form.companyName.trim().toLowerCase()
      );
      let companyId = existingComp?.id;

      // 2. अगर कंपनी नहीं है, तो पहले नई कंपनी बनाएँ
      if (!companyId) {
        const compRes = await placementApi.createCompany({ name: form.companyName.trim() });
        companyId = compRes.data.data.id;
      }

      // 3. अब प्लेसमेंट ड्राइव शेड्यूल करें (आपके बैकएंड createDrive कंट्रोलर के मुताबिक)
      await placementApi.createDrive({
        companyId,
        role: form.role,
        packageLPA: Number(form.packageLPA),
        driveDate: form.driveDate,
      });

      toast.success("Placement drive scheduled successfully!");
      setForm({ companyName: "", role: "", packageLPA: "", driveDate: "" });
      fetchDrives();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule drive");
    }
  };

  const columns = [
    { key: "company", label: "Company", render: (r) => r.company?.name || "N/A" },
    { key: "role", label: "Role" },
    { key: "packageLPA", label: "Package (LPA)", render: (r) => `₹${Number(r.packageLPA)} LPA` },
    { key: "driveDate", label: "Drive Date", render: (r) => new Date(r.driveDate).toLocaleDateString("en-IN") },
    { key: "selected", label: "Selected", render: (r) => <Chip size="small" label={r.selections?.length ?? 0} color="primary" /> },
  ];

  return (
    <Box>
      <PageHeader title="Placements" subtitle="Track companies, drives, interviews, and selected students" />

      {/* अगर एडमिन है, तभी फॉर्म दिखाई देगा */}
      {isAdmin && (
        <Paper component="form" onSubmit={handleScheduleDrive} variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField 
                fullWidth 
                required 
                label="Company Name" 
                placeholder="e.g. Infosys, TCS"
                value={form.companyName} 
                onChange={(e) => setForm({ ...form, companyName: e.target.value })} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField 
                fullWidth 
                required 
                label="Job Role" 
                placeholder="e.g. Software Engineer"
                value={form.role} 
                onChange={(e) => setForm({ ...form, role: e.target.value })} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField 
                fullWidth 
                required 
                type="number" 
                label="Package (LPA)" 
                placeholder="e.g. 5"
                value={form.packageLPA} 
                onChange={(e) => setForm({ ...form, packageLPA: e.target.value })} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField 
                fullWidth 
                required 
                type="date" 
                InputLabelProps={{ shrink: true }} 
                label="Drive Date" 
                value={form.driveDate} 
                onChange={(e) => setForm({ ...form, driveDate: e.target.value })} 
              />
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "center" }}>
              <Button type="submit" variant="contained" startIcon={<AddIcon />} fullWidth sx={{ height: "56px" }}>
                Add Drive
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <DataTable columns={columns} rows={drives} loading={loading} emptyMessage="No placement drives scheduled yet" />
    </Box>
  );
}