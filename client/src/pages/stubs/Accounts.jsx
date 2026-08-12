// client/src/pages/stubs/Accounts.jsx
import { useEffect, useState } from "react";
import { Box, Button, Paper, Grid, TextField, Tabs, Tab } from "@mui/material";
import { toast } from "react-toastify";
import { accountApi } from "../../api/misc.api";
import { PageHeader, StatCard } from "../../components/common/StatCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownIcon from "@mui/icons-material/TrendingDownOutlined";
import DataTable from "../../components/common/DataTable";

export default function Accounts() {
  const [summary, setSummary] = useState(null);
  const [tab, setTab] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", category: "", amount: "" });

  const currency = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

  const fetchData = () => {
    setLoading(true);
    accountApi.getSummary().then(({ data }) => setSummary(data.data));
    const call = tab === 0 ? accountApi.getExpenses : accountApi.getIncomes;
    call({ limit: 20 }).then(({ data }) => setRows(data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [tab]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const call = tab === 0 ? accountApi.createExpense : accountApi.createIncome;
      await call(form);
      toast.success(`${tab === 0 ? "Expense" : "Income"} recorded`);
      setForm({ title: "", category: "", amount: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save entry");
    }
  };

  const columns = [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount", render: (r) => currency(r.amount) },
    { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleDateString("en-IN") },
  ];

  return (
    <Box>
      <PageHeader title="Accounts" subtitle="Track income, expenses, salaries, and net balance" />

      {summary && (
        <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
          <Grid item xs={12} sm={4}><StatCard icon={<TrendingUpIcon />} label="Total Income" value={currency(summary.totalIncome)} color="secondary.main" /></Grid>
          <Grid item xs={12} sm={4}><StatCard icon={<TrendingDownIcon />} label="Total Expense" value={currency(summary.totalExpense)} color="#E11D48" /></Grid>
          <Grid item xs={12} sm={4}><StatCard icon={<AccountBalanceWalletIcon />} label="Net Balance" value={currency(summary.netBalance)} /></Grid>
        </Grid>
      )}

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Expenses" />
        <Tab label="Income" />
      </Tabs>

      <Paper component="form" onSubmit={handleAdd} variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField fullWidth required label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
          <Grid item xs={12} sm={3}><TextField fullWidth required label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Grid>
          <Grid item xs={12} sm={3}><TextField fullWidth required type="number" label="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Grid>
          <Grid item xs={12} sm={2}><Button type="submit" variant="contained" fullWidth>Add {tab === 0 ? "Expense" : "Income"}</Button></Grid>
        </Grid>
      </Paper>

      <DataTable columns={columns} rows={rows} loading={loading} />
    </Box>
  );
}
