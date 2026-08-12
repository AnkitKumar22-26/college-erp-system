// client/src/pages/students/StudentForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Avatar,
  Typography,
  Divider,
} from "@mui/material";
import { toast } from "react-toastify";
import { studentApi } from "../../api/student.api";
import useDepartments from "../../hooks/useDepartments";
import { PageHeader } from "../../components/common/StatCard";

const emptyForm = {
  admissionNo: "",
  rollNo: "",
  firstName: "",
  lastName: "",
  gender: "MALE",
  dob: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  departmentId: "",
  semester: 1,
  section: "A",
  academicYear: "2025-2026",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianRelation: "",
};

export default function StudentForm() {
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
    studentApi.getById(id).then(({ data }) => {
      const s = data.data;
      setForm({
        ...emptyForm,
        ...s,
        dob: s.dob?.slice(0, 10),
        guardianEmail: s.guardianEmail || "",
      });
      if (s.photoUrl) {
        setPreview(`${import.meta.env.VITE_API_URL.replace("/api", "")}${s.photoUrl}`);
      }
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
        await studentApi.update(id, formData);
        toast.success("Student updated successfully");
      } else {
        await studentApi.create(formData);
        toast.success("Student created successfully");
      }
      navigate("/students");
    } catch (err) {
      if (err.response?.status === 422 && err.response.data.details) {
        const fieldErrors = {};
        err.response.data.details.forEach((d) => { fieldErrors[d.field] = d.message; });
        setErrors(fieldErrors);
      }
      toast.error(err.response?.data?.message || "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title={isEdit ? "Edit Student" : "Add Student"} subtitle="Fill in the student's academic and personal details" />

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
            <TextField fullWidth required label="Admission No" value={form.admissionNo} onChange={handleChange("admissionNo")} error={!!errors.admissionNo} helperText={errors.admissionNo} disabled={isEdit} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required label="Roll No" value={form.rollNo} onChange={handleChange("rollNo")} error={!!errors.rollNo} helperText={errors.rollNo} />
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
          <Grid item xs={12}>
            <TextField fullWidth label="Address" value={form.address} onChange={handleChange("address")} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="City" value={form.city} onChange={handleChange("city")} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="State" value={form.state} onChange={handleChange("state")} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Pincode" value={form.pincode} onChange={handleChange("pincode")} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Academic Details</Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select fullWidth required label="Department" value={form.departmentId} onChange={handleChange("departmentId")} error={!!errors.departmentId} helperText={errors.departmentId}>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required type="number" label="Semester" value={form.semester} onChange={handleChange("semester")} inputProps={{ min: 1, max: 12 }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required label="Section" value={form.section} onChange={handleChange("section")} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required label="Academic Year" value={form.academicYear} onChange={handleChange("academicYear")} placeholder="2025-2026" />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Guardian Details</Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required label="Guardian Name" value={form.guardianName} onChange={handleChange("guardianName")} error={!!errors.guardianName} helperText={errors.guardianName} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth required label="Guardian Phone" value={form.guardianPhone} onChange={handleChange("guardianPhone")} error={!!errors.guardianPhone} helperText={errors.guardianPhone} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth type="email" label="Guardian Email" value={form.guardianEmail} onChange={handleChange("guardianEmail")} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Relation" value={form.guardianRelation} onChange={handleChange("guardianRelation")} placeholder="Father / Mother / Guardian" />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate("/students")}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Student" : "Create Student"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
