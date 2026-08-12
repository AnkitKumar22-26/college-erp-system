// client/src/pages/stubs/Library.jsx
import { useEffect, useState } from "react";
import { Box, Button, Chip, Paper, Grid, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import { libraryApi } from "../../api/misc.api";
import { PageHeader } from "../../components/common/StatCard";
import DataTable from "../../components/common/DataTable";

export default function Library() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", author: "", category: "", isbn: "", totalCopies: 1 });

  const fetchBooks = () => {
    setLoading(true);
    libraryApi
      .getBooks({ page, limit, search })
      .then(({ data }) => { setRows(data.data); setTotal(data.pagination.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBooks(); }, [page, limit, search]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await libraryApi.createBook(form);
      toast.success("Book added to catalog");
      setForm({ title: "", author: "", category: "", isbn: "", totalCopies: 1 });
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add book");
    }
  };

  const columns = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "category", label: "Category", render: (r) => <Chip size="small" label={r.category} /> },
    { key: "isbn", label: "ISBN" },
    { key: "available", label: "Available", render: (r) => `${r.available} / ${r.totalCopies}` },
  ];

  return (
    <Box>
      <PageHeader title="Library" subtitle="Manage the book catalog, issues, and returns" />

      <Paper component="form" onSubmit={handleAdd} variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}><TextField fullWidth required label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
          <Grid item xs={12} sm={3}><TextField fullWidth required label="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></Grid>
          <Grid item xs={12} sm={2}><TextField fullWidth required label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Grid>
          <Grid item xs={12} sm={2}><TextField fullWidth required label="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} /></Grid>
          <Grid item xs={12} sm={2}>
            <Button type="submit" variant="contained" startIcon={<AddIcon />} fullWidth>Add Book</Button>
          </Grid>
        </Grid>
      </Paper>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by title, author, ISBN..."
      />
    </Box>
  );
}
