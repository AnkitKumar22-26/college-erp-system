// client/src/pages/stubs/Transport.jsx
import { useEffect, useState } from "react";
import { Box, Button, Paper, Grid, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import { transportApi } from "../../api/misc.api";
import { PageHeader } from "../../components/common/StatCard";
import DataTable from "../../components/common/DataTable";

export default function Transport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const fetchRoutes = () => {
    setLoading(true);
    transportApi.getRoutes().then(({ data }) => setRows(data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRoutes(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await transportApi.createRoute({ name });
      toast.success("Route created");
      setName("");
      fetchRoutes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create route");
    }
  };

  const columns = [
    { key: "name", label: "Route Name" },
    { key: "vehicles", label: "Vehicles Assigned", render: (r) => r.vehicles?.length ?? 0 },
  ];

  return (
    <Box>
      <PageHeader title="Transport" subtitle="Manage routes, vehicles, drivers, and student allocation" />

      <Paper component="form" onSubmit={handleCreate} variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}><TextField fullWidth required label="Route Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="City Center - Campus" /></Grid>
          <Grid item xs={12} sm={4}><Button type="submit" variant="contained" startIcon={<AddIcon />} fullWidth>Add Route</Button></Grid>
        </Grid>
      </Paper>

      <DataTable columns={columns} rows={rows} loading={loading} />
    </Box>
  );
}
