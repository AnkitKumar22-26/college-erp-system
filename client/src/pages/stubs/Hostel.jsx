// client/src/pages/stubs/Hostel.jsx
import { useEffect, useState } from "react";
import { Box, Button, Paper, Grid, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import { hostelApi } from "../../api/misc.api";
import { PageHeader } from "../../components/common/StatCard";
import DataTable from "../../components/common/DataTable";

export default function Hostel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [warden, setWarden] = useState("");

  const fetchVacancy = () => {
    setLoading(true);
    hostelApi.getVacancy().then(({ data }) => setRows(data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchVacancy(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hostelApi.createHostel({ name, warden });
      toast.success("Hostel created");
      setName(""); setWarden("");
      fetchVacancy();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create hostel");
    }
  };

  const columns = [
    { key: "hostel", label: "Hostel" },
    { key: "roomNo", label: "Room No" },
    { key: "capacity", label: "Capacity" },
    { key: "occupied", label: "Occupied" },
    { key: "vacant", label: "Vacant" },
  ];

  return (
    <Box>
      <PageHeader title="Hostel" subtitle="Manage hostels, rooms, beds, and student allocation" />

      <Paper component="form" onSubmit={handleCreate} variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}><TextField fullWidth required label="Hostel Name" value={name} onChange={(e) => setName(e.target.value)} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Warden Name" value={warden} onChange={(e) => setWarden(e.target.value)} /></Grid>
          <Grid item xs={12} sm={3}><Button type="submit" variant="contained" startIcon={<AddIcon />} fullWidth>Add Hostel</Button></Grid>
        </Grid>
      </Paper>

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No rooms configured yet" />
    </Box>
  );
}
