// client/src/pages/faculty/FacultyForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Paper, Grid, TextField, MenuItem, Button, Avatar, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { facultyApi } from "../../api/faculty.api";
import useDepartments from "../../hooks/useDepartments";
import { PageHeader } from "../../components/common/StatCard";

const emptyForm = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  gender: "MALE",
  dob: "",
  phone: "",
  email: "",
  address: "",
  departmentId: "",
  designation: "",
  qualification: "",
  experienceYrs: 0,
  salary: "",
};

export default function FacultyForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { departments } = useDepartments();

  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    facultyApi.getById(id).then(({ data }) => {
      const f = data.data;
      setForm({ ...emptyForm, ...f, dob: f.dob?.slice(0, 10), salary: Number(f.salary) });
      if (f.photoUrl) setPreview(`${import.meta.env.VITE_API_URL.replace("/api", "")}${f.photoUrl}`);
    });
  }, [id, isEdit]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    if (photo) formData.append("photo", photo);

    try {
      if (isEdit) {
        await facultyApi.update(id, formData);
        toast.success("Faculty updated successfully");
      } else {
        await facultyApi.create(formData);
        toast.success("Faculty created successfully");
      }
      navigate("/faculty");
    } catch (err) {
      if (err.response?.status === 422 && err.response.data.details) {
        const fieldErrors = {};
        err.response.data.details.forEach((d) => { fieldErrors[d.field] = d.message; });
        setErrors(fieldErrors);
      }
      toast.error(err.response?.data?.message || "Failed to save faculty");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title={isEdit ? "Edit Faculty" : "Add Faculty"} subtitle="Enter employment and qualification details" />

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }} variant="outlined">
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
          <Avatar src={preview} sx={{ width: 72, height: 72 }}>{form.firstName?.[0]}</Avatar>
          <Button component="label" variant="outlined" size="small">
            Upload Photo
            <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
          </Button>
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Personal Details</Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required label="Employee Code" value={form.employeeCode} onChange={handleChange("employeeCode")} error={!!errors.employeeCode} helperText={errors.employeeCode} disabled={isEdit} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required label="First Name" value={form.firstName} onChange={handleChange("firstName")} error={!!errors.firstName} helperText={errors.firstName} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required label="Last Name" value={form.lastName} onChange={handleChange("lastName")} error={!!errors.lastName} helperText={errors.lastName} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select fullWidth label="Gender" value={form.gender} onChange={handleChange("gender")}>
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} value={form.dob} onChange={handleChange("dob")} error={!!errors.dob} helperText={errors.dob} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required label="Phone" value={form.phone} onChange={handleChange("phone")} error={!!errors.phone} helperText={errors.phone} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required type="email" label="Email" value={form.email} onChange={handleChange("email")} error={!!errors.email} helperText={errors.email} disabled={isEdit} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Address" value={form.address} onChange={handleChange("address")} />
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>Employment Details</Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select fullWidth required label="Department" value={form.departmentId} onChange={handleChange("departmentId")} error={!!errors.departmentId} helperText={errors.departmentId}>
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required label="Designation" value={form.designation} onChange={handleChange("designation")} placeholder="Assistant Professor" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required label="Qualification" value={form.qualification} onChange={handleChange("qualification")} placeholder="M.Tech / Ph.D." />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required type="number" label="Experience (years)" value={form.experienceYrs} onChange={handleChange("experienceYrs")} inputProps={{ min: 0 }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required type="number" label="Salary (₹ / month)" value={form.salary} onChange={handleChange("salary")} error={!!errors.salary} helperText={errors.salary} />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate("/faculty")}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Faculty" : "Create Faculty"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
