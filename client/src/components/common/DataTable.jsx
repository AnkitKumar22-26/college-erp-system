// client/src/components/common/DataTable.jsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  InputAdornment,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

/**
 * Generic table component.
 * columns: [{ key, label, render?: (row) => node }]
 */
export default function DataTable({
  columns,
  rows,
  loading,
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  toolbar,
  emptyMessage = "No records found",
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Box sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        {onSearchChange && (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        )}
        <Box sx={{ flexGrow: 1 }} />
        {toolbar}
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "background.default" } }}>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={row.id || idx} hover>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {onPageChange && (
        <TablePagination
          component="div"
          count={total || 0}
          page={(page || 1) - 1}
          onPageChange={(e, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={limit || 10}
          onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50]}
        />
      )}
    </Paper>
  );
}
