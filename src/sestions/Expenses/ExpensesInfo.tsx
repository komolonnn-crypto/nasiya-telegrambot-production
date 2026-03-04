import { Box, SwipeableDrawer, Typography } from "@mui/material";
import { FC } from "react";
import { DollarSign, Banknote, FileText, X, Receipt } from "lucide-react";
import { IExpenses } from "../../types/IExpenses";

interface DrawerProps {
  open: IExpenses | null;
  onClose: () => void;
}

const InfoRow: FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg: string;
}> = ({ icon, label, value, iconBg }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      p: 1.5,
      bgcolor: "white",
      borderRadius: "12px",
      border: "1px solid #F1F5F9",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "10px",
        bgcolor: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8", mb: 0.2 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.875rem",
          fontWeight: 700,
          color: "#1E293B",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

const ExpensesInfo: FC<DrawerProps> = ({ open, onClose }) => {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={!!open}
      onClose={onClose}
      onOpen={() => {}}
      sx={{ zIndex: 1301 }}
      PaperProps={{
        sx: {
          borderRadius: 0,
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          bgcolor: "#F8FAFC",
          overflow: "hidden",
        },
      }}
    >
      {/* Handle bar */}
      <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
        <Box sx={{ width: 40, height: 4, borderRadius: "4px", bgcolor: "#E2E8F0" }} />
      </Box>

      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E2E8F0",
          bgcolor: "white",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "#EEF2FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Receipt size={18} color="#4F46E5" />
          </Box>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>
            Xarajat tafsilotlari
          </Typography>
        </Box>
        <Box
          onClick={onClose}
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: "#F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": { bgcolor: "#E2E8F0" },
          }}
        >
          <X size={16} color="#64748B" />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5, pb: 4 }}>
        {open ? (
          <Box display="flex" flexDirection="column" gap={1.25}>
            <InfoRow
              icon={<DollarSign size={16} color="#4F46E5" />}
              label="Dollar"
              value={`${open.currencyDetails.dollar.toLocaleString()} $`}
              iconBg="#EEF2FF"
            />
            <InfoRow
              icon={<Banknote size={16} color="#10B981" />}
              label="So'm"
              value={`${open.currencyDetails.sum.toLocaleString()} UZS`}
              iconBg="#D1FAE5"
            />
            <InfoRow
              icon={<FileText size={16} color="#F59E0B" />}
              label="Izoh"
              value={open.notes || "—"}
              iconBg="#FEF3C7"
            />
          </Box>
        ) : (
          <Typography textAlign="center" sx={{ color: "#94A3B8", py: 4, fontSize: "0.875rem" }}>
            Ma'lumotlar topilmadi.
          </Typography>
        )}
      </Box>
    </SwipeableDrawer>
  );
};

export default ExpensesInfo;
