// client/src/components/common/StatCard.jsx
import { Card, CardContent, Box, Typography, Avatar } from "@mui/material";

export function StatCard({ icon, label, value, color = "primary.main", suffix }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: `${color}`, width: 48, height: 48 }}>{icon}</Avatar>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {value}
            {suffix && (
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                {suffix}
              </Typography>
            )}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 3, flexWrap: "wrap", gap: 2 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
