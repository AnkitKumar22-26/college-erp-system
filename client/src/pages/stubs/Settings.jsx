// client/src/pages/stubs/Settings.jsx
import { useEffect, useState } from "react";
import { Box, Paper, Grid, TextField, Button, Avatar, Typography, Divider } from "@mui/material";
import { toast } from "react-toastify";
import { settingsApi } from "../../api/misc.api";
import { authApi } from "../../api/auth.api";
import { PageHeader } from "../../components/common/StatCard";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ collegeName: "", address: "", email: "", phone: "", academicYear: "", currentSemester: 1 });
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);

  const canEditCollege = ["ADMIN", "PRINCIPAL"].includes(user?.role);

  useEffect(() => {
    settingsApi.get().then(({ data }) => {
      setForm({ ...data.data });
      if (data.data.logoUrl) setPreview(`${import.meta.env.VITE_API_URL.replace("/api", "")}${data.data.logoUrl}`);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, v); });
    if (logo) formData.append("logo", logo);
    try {
      await settingsApi.update(formData);
      toast.success("Settings updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSaving(true);
    try {
      await authApi.changePassword(pwForm.currentPassword, pwForm.newPassword);
      toast.success("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Settings" subtitle="College details, academic year, and account security" />

      <Grid container spacing={2.5}>
        {canEditCollege && (
          <Grid item xs={12} md={7}>
            <Paper component="form" onSubmit={handleSave} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>College Details</Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
                <Avatar src={preview} variant="rounded" sx={{ width: 64, height: 64 }} />
                <Button component="label" variant="outlined" size="small">
                  Upload Logo
                  <input type="file" hidden accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setLogo(f); setPreview(URL.createObjectURL(f)); } }} />
                </Button>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="College Name" value={form.collegeName || ""} onChange={(e) => setForm({ ...form, collegeName: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Academic Year" value={form.academicYear || ""} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Address" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Current Semester" value={form.currentSemester || 1} onChange={(e) => setForm({ ...form, currentSemester: e.target.value })} /></Grid>
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button type="submit" variant="contained" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </Box>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12} md={canEditCollege ? 5 : 12}>
          <Paper component="form" onSubmit={handlePasswordChange} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Change Password</Typography>
            <TextField fullWidth required type="password" label="Current Password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} sx={{ mb: 2.5 }} />
            <TextField fullWidth required type="password" label="New Password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} helperText="At least 6 characters" />
            <Divider sx={{ my: 3 }} />
            <Button type="submit" variant="contained" disabled={pwSaving} fullWidth>
              {pwSaving ? "Updating..." : "Update Password"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
