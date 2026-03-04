import { FC } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, CheckCircle, AlertTriangle, Package } from "lucide-react";
import { ICustomerContract } from "../types/ICustomer";

interface ContractCardProps {
  contract: ICustomerContract;
  variant?: "default" | "debtor" | "paid";
  onClick?: () => void;
}

const MotionBox = motion(Box);

const variantConfig = {
  default: {
    border: "1px solid #E2E8F0",
    bg: "white",
    accentColor: "#4F46E5",
    accentBg: "#EEF2FF",
    badge: null,
  },
  debtor: {
    border: "1.5px solid #FECACA",
    bg: "white",
    accentColor: "#EF4444",
    accentBg: "#FEF2F2",
    badge: { label: "Qarzdor", icon: AlertTriangle, color: "#EF4444", bg: "#FEF2F2" },
  },
  paid: {
    border: "1.5px solid #A7F3D0",
    bg: "#F0FDF4",
    accentColor: "#10B981",
    accentBg: "#D1FAE5",
    badge: { label: "To'langan", icon: CheckCircle, color: "#10B981", bg: "#D1FAE5" },
  },
};

const ContractCard: FC<ContractCardProps> = ({ contract, variant = "default", onClick }) => {
  const cfg = variantConfig[variant];

  const totalDebt = (contract.monthlyPayment || 0) * (contract.durationMonths || 0);
  const totalPaid = contract.totalPaid || 0;
  const remainingDebt = contract.remainingDebt || 0;
  const paidPct = totalDebt > 0 ? Math.round((totalPaid / totalDebt) * 100) : 0;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileTap={onClick ? { scale: 0.99 } : {}}
      onClick={onClick}
      sx={{
        mb: 1.5,
        p: 1.75,
        bgcolor: cfg.bg,
        border: cfg.border,
        borderRadius: "16px",
        cursor: onClick ? "pointer" : "default",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "all 0.2s",
        ...(onClick && {
          "&:hover": {
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            transform: "translateY(-1px)",
          },
        }),
      }}
    >
      {/* ── Top row: product + badge ── */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1} mb={1.25}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box display="flex" alignItems="center" gap={0.75} mb={0.4}>
            {/* Day chip */}
            {contract.startDate && (
              <Box
                sx={{
                  px: 0.75,
                  py: 0.15,
                  borderRadius: "6px",
                  bgcolor: cfg.accentBg,
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: cfg.accentColor }}>
                  {new Date(contract.startDate).getDate().toString().padStart(2, "0")}
                </Typography>
              </Box>
            )}
            {/* Contract ID */}
            {(contract as any).customId && (
              <Box
                sx={{
                  px: 0.75,
                  py: 0.15,
                  borderRadius: "6px",
                  bgcolor: "#EEF2FF",
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#4F46E5" }}>
                  {(contract as any).customId}
                </Typography>
              </Box>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={0.6}>
            <Package size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
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
              {contract.productName}
            </Typography>
          </Box>

          <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: 0.3 }}>
            {contract.paidMonthsCount || 0}/{contract.durationMonths || 0} oy to'langan
          </Typography>
        </Box>

        {cfg.badge && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              px: 0.9,
              py: 0.4,
              borderRadius: "20px",
              bgcolor: cfg.badge.bg,
              flexShrink: 0,
            }}
          >
            <cfg.badge.icon size={12} color={cfg.badge.color} />
            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: cfg.badge.color }}>
              {cfg.badge.label}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Info row: total debt + duration ── */}
      <Box display="flex" gap={1} mb={1.5}>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            p: 1,
            bgcolor: `${cfg.accentColor}08`,
            borderRadius: "10px",
          }}
        >
          <TrendingUp size={14} color={cfg.accentColor} />
          <Box>
            <Typography sx={{ fontSize: "0.6rem", color: "#94A3B8", lineHeight: 1.1 }}>
              Jami qarz
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#1E293B" }}>
              {totalDebt.toLocaleString()} $
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            p: 1,
            bgcolor: "#F0F9FF",
            borderRadius: "10px",
          }}
        >
          <Calendar size={14} color="#0EA5E9" />
          <Box>
            <Typography sx={{ fontSize: "0.6rem", color: "#94A3B8", lineHeight: 1.1 }}>
              Muddat
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#1E293B" }}>
              {contract.durationMonths} oy
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Progress bar ── */}
      <Box mb={1.25}>
        <Box
          sx={{
            height: 5,
            borderRadius: "4px",
            bgcolor: "#F1F5F9",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${paidPct}%`,
              bgcolor: cfg.accentColor,
              borderRadius: "4px",
              transition: "width 0.4s ease",
            }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mt={0.5}>
          <Typography sx={{ fontSize: "0.62rem", color: "#94A3B8" }}>
            {paidPct}% to'langan
          </Typography>
          <Typography sx={{ fontSize: "0.62rem", color: "#94A3B8" }}>
            {contract.monthlyPayment?.toLocaleString()} $/oy
          </Typography>
        </Box>
      </Box>

      {/* ── Bottom: totals ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 0.75,
          pt: 1.25,
          borderTop: "1px solid #F1F5F9",
        }}
      >
        {[
          { label: "Jami", value: totalDebt, color: "#475569" },
          { label: "To'langan", value: totalPaid, color: "#10B981" },
          { label: "Qarz", value: remainingDebt, color: remainingDebt > 0 ? "#EF4444" : "#10B981" },
        ].map(({ label, value, color }) => (
          <Box key={label} textAlign="center">
            <Typography sx={{ fontSize: "0.6rem", color: "#94A3B8", mb: 0.2 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color }}>
              {value.toLocaleString()}$
            </Typography>
          </Box>
        ))}
      </Box>
    </MotionBox>
  );
};

export default ContractCard;
