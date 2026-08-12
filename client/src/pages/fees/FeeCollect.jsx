// client/src/pages/fees/FeeCollect.jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLongOutlined";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { feeApi } from "../../api/fee.api";
import { PageHeader } from "../../components/common/StatCard";

export default function FeeCollect() {
  const { studentFeeId } = useParams();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("CASH");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastPaymentId, setLastPaymentId] = useState(null);

  const handleCollect = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await feeApi.collect({
        studentFeeId,
        amount: Number(amount),
        mode,
        remarks,
      });
      toast.success("Payment collected successfully");
      setLastPaymentId(data.data.id);
      setAmount("");
      setRemarks("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!lastPaymentId) return;
    try {
      const res = await api.get(`/fees/receipt/${lastPaymentId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${lastPaymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Failed to download receipt");
    }
  };

  return (
    <Box>
      <PageHeader title="Collect Fee Payment" subtitle="Record a new payment against this fee record" />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Paper component="form" onSubmit={handleCollect} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required type="number" label="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} inputProps={{ min: 1 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth required label="Payment Mode" value={mode} onChange={(e) => setMode(e.target.value)}>
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="CARD">Card</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="NET_BANKING">Net Banking</MenuItem>
                  <MenuItem value="CHEQUE">Cheque</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} multiline rows={2} />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={() => navigate("/fees")}>Back to List</Button>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Processing..." : "Collect Payment"}
              </Button>
            </Box>

            {lastPaymentId && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Payment recorded</Typography>
                    <Typography variant="caption" color="text.secondary">Download the receipt for the student's records</Typography>
                  </Box>
                  <Button variant="outlined" startIcon={<ReceiptLongIcon />} onClick={handleDownloadReceipt}>
                    Download Receipt
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Fee Record
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ID: {studentFeeId}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Full fee breakdown (total, discount, scholarship, fine, and balance) is shown on the
              student's profile page and the Fee Management list. Submit a payment here to update it.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
