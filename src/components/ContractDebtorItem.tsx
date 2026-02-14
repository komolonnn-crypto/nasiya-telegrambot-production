import { memo } from "react";
import {
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { Clock, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { IDebtorContract } from "../types/ICustomer";
import { borderRadius, shadows } from "../theme/colors";
import { responsive } from "../theme/responsive";

interface ContractDebtorItemProps {
  contract: IDebtorContract;
  onClick: (contract: IDebtorContract) => void;
}

const MotionListItemButton = motion(ListItemButton);

const ContractDebtorItem: React.FC<ContractDebtorItemProps> = memo(
  ({ contract, onClick }) => {
    // Kechikish rangini aniqlash
    const getDelayColor = (days: number) => {
      if (days > 30) return "error.main";
      if (days > 7) return "warning.main";
      return "text.secondary";
    };

    // Ismni qisqartirish (mobil uchun)
    const getDisplayName = (fullName: string) => {
      if (fullName.length > 18) {
        const parts = fullName.split(" ");
        if (parts.length > 1) {
          return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
        }
        return `${fullName.slice(0, 16)}…`;
      }
      return fullName;
    };

    // Mahsulot nomini qisqartirish
    const truncateProductName = (name: string) => {
      const maxLen = 28;
      return name.length > maxLen ? `${name.slice(0, maxLen)}…` : name;
    };

    // To'langan oylarni hisoblash
    const getPaidMonths = () => {
      if (contract.paidMonthsCount !== undefined) return contract.paidMonthsCount;
      if (contract.period && contract.monthlyPayment && contract.initialPayment !== undefined) {
        return Math.floor(
          (contract.totalPaid - contract.initialPayment) / contract.monthlyPayment,
        );
      }
      return 0;
    };

    const paidMonths = getPaidMonths();
    const totalMonths = contract.period || 0;

    // Pul birligi belgisi
    const currencySymbol =
      contract.currency === "UZS" ? "so'm"
      : contract.currency === "EUR" ? "€"
      : "$"; // default USD

    // Border va background rang (status bo'yicha)
    const cardBorderColor =
      contract.isPending ? "#10b981"   // yashil — tasdiq kutilmoqda
      : contract.delayDays > 0 ? "#ef4444"  // qizil — kechikkan
      : "#10b981";  // yashil — normal

    const cardBgColor =
      contract.isPending ? "rgba(16, 185, 129, 0.1)"   // yengil yashil
      : contract.delayDays > 0 ? "rgba(239, 68, 68, 0.04)"
      : "background.paper";

    return (
      <MotionListItemButton
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onClick(contract)}
        sx={{
          borderRadius: borderRadius.md,
          mb: 1.5,
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1.25, sm: 1.5 },
          bgcolor: cardBgColor,
          border: `2px solid ${cardBorderColor}`,
          boxShadow: shadows.sm,
          transition: "all 0.25s ease",
          alignItems: "flex-start",
          ...(contract.isPending && {
            "&:hover, &:active": {
              bgcolor: "#10b981",
              borderColor: "#059669",
              boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
              // Barcha matnlar — qora
              "& .MuiTypography-root": { color: "#111827 !important" },
              // Chiplar — qora matn, oq background
              "& .MuiChip-root": {
                bgcolor: "rgba(255,255,255,0.75) !important",
                color: "#111827 !important",
                borderColor: "rgba(0,0,0,0.15) !important",
                "& .MuiChip-label": { color: "#111827 !important" },
                "& svg": { color: "#111827 !important" },
              },
            },
          }),
          ...(!contract.isPending && {
            "&:hover": {
              boxShadow: shadows.md,
              filter: "brightness(0.97)",
            },
          }),
        }}>
        <ListItemText
          disableTypography
          primary={
            <Box>
              {/* ── QATOR 1: Kun belgisi | Ism | Summa ── */}
              <Box
                display="flex"
                alignItems="center"
                gap={{ xs: 0.75, sm: 1 }}
                mb={0.75}>
                {/* Kun belgisi */}
                {(contract.initialPaymentDueDate || contract.startDate) && (
                  <Chip
                    label={new Date(
                      contract.initialPaymentDueDate || contract.startDate!,
                    )
                      .getDate()
                      .toString()
                      .padStart(2, "0")}
                    size="small"
                    sx={{
                      height: { xs: 24, sm: 26 },
                      minWidth: { xs: 28, sm: 32 },
                      fontSize: { xs: "0.72rem", sm: "0.78rem" },
                      fontWeight: 800,
                      bgcolor: "primary.main",
                      color: "white",
                      flexShrink: 0,
                      "& .MuiChip-label": { px: { xs: 0.5, sm: 0.75 } },
                    }}
                  />
                )}

                {/* Ism */}
                <Typography
                  fontWeight={700}
                  sx={{
                    fontSize: { xs: "15px", sm: "16px" },
                    lineHeight: 1.3,
                    flex: 1,
                    color: "text.primary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                  {getDisplayName(contract.fullName)}
                </Typography>

                {/* Oylik summa + pul birligi */}
                <Typography
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: "16px", sm: "18px" },
                    color:
                      contract.isPending ? "#059669"
                      : contract.delayDays > 0 ? "error.main"
                      : "success.main",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}>
                  {contract.monthlyPayment?.toLocaleString()} {currencySymbol}
                </Typography>
              </Box>

              {/* ── QATOR 2: Mahsulot | Statuslar | Oylar ── */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={0.5}
                flexWrap="wrap">
                {/* Chap: mahsulot nomi */}
                <Box
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  sx={{ minWidth: 0, flex: 1 }}>
                  <Package
                    size={responsive.icon.small.xs}
                    color="#9CA3AF"
                    style={{ flexShrink: 0 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "12px", sm: "13px" },
                      color: "text.secondary",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    {truncateProductName(contract.productName)}
                  </Typography>
                </Box>

                {/* O'ng: statuslar va oylar */}
                <Box
                  display="flex"
                  alignItems="center"
                  gap={{ xs: 0.5, sm: 1 }}
                  flexShrink={0}>
                  {/* TASDIQ KUTILMOQDA holati */}
                  {contract.isPending && (
                    <>
                      {/* To'liq/Qisman berildi */}
                      <Chip
                        icon={
                          contract.remainingDebt <= 0 ?
                            <CheckCircle2 size={12} />
                          : <AlertCircle size={12} />
                        }
                        label={
                          contract.remainingDebt <= 0 ?
                            "To'liq berildi"
                          : "Qisman berildi"
                        }
                        size="small"
                        sx={{
                          height: { xs: 20, sm: 22 },
                          fontSize: { xs: "0.62rem", sm: "0.68rem" },
                          fontWeight: 700,
                          bgcolor:
                            contract.remainingDebt <= 0 ?
                              "rgba(16, 185, 129, 0.12)"
                            : "rgba(239, 68, 68, 0.1)",
                          color:
                            contract.remainingDebt <= 0 ?
                              "#065f46"
                            : "#b91c1c",
                          border: "1px solid",
                          borderColor:
                            contract.remainingDebt <= 0 ?
                              "#6ee7b7"
                            : "#fca5a5",
                          "& .MuiChip-label": { px: 0.75 },
                          "& .MuiChip-icon": {
                            ml: 0.5,
                            color: "inherit",
                          },
                        }}
                      />
                      {/* Kassa kutilmoqda */}
                      <Chip
                        label="⏳ Kassa kutmoqda"
                        size="small"
                        sx={{
                          height: { xs: 20, sm: 22 },
                          fontSize: { xs: "0.62rem", sm: "0.68rem" },
                          fontWeight: 700,
                          bgcolor: "#fef3c7",
                          color: "#92400e",
                          border: "1px solid #fcd34d",
                          animation: "pulse 2s infinite ease-in-out",
                          "@keyframes pulse": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0.6 },
                          },
                          "& .MuiChip-label": { px: 0.75 },
                        }}
                      />
                    </>
                  )}

                  {/* Kechikkan holati */}
                  {!contract.isPending && contract.delayDays > 0 && (
                    <Chip
                      icon={<Clock size={11} />}
                      label={`${contract.delayDays > 99 ? "99+" : contract.delayDays} kun kech`}
                      size="small"
                      sx={{
                        height: { xs: 20, sm: 22 },
                        fontSize: { xs: "0.62rem", sm: "0.68rem" },
                        fontWeight: 700,
                        bgcolor: "rgba(239, 68, 68, 0.1)",
                        color: getDelayColor(contract.delayDays),
                        border: "1px solid",
                        borderColor: "rgba(239, 68, 68, 0.3)",
                        "& .MuiChip-icon": { ml: 0.5, color: "inherit" },
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  )}

                  {/* Bugun / Yaqinda */}
                  {!contract.isPending &&
                    contract.delayDays === 0 &&
                    contract.nextPaymentStatus &&
                    contract.nextPaymentStatus !== "OVERDUE" && (
                      <Chip
                        label={
                          contract.nextPaymentStatus === "TODAY" ? "Bugun"
                          : contract.nextPaymentStatus === "UPCOMING" ? "Yaqinda"
                          : ""
                        }
                        size="small"
                        sx={{
                          height: { xs: 20, sm: 22 },
                          fontSize: { xs: "0.62rem", sm: "0.68rem" },
                          fontWeight: 700,
                          bgcolor:
                            contract.nextPaymentStatus === "TODAY" ?
                              "rgba(102, 126, 234, 0.15)"
                            : "rgba(240, 147, 251, 0.15)",
                          color:
                            contract.nextPaymentStatus === "TODAY" ?
                              "#4338ca"
                            : "#9333ea",
                          border: "1px solid",
                          borderColor:
                            contract.nextPaymentStatus === "TODAY" ?
                              "#a5b4fc"
                            : "#e9d5ff",
                          "& .MuiChip-label": { px: 0.75 },
                        }}
                      />
                    )}

                  {/* Oylar progressi */}
                  {totalMonths > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: "11px", sm: "12px" },
                        fontWeight: 600,
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                      }}>
                      <Typography
                        component="span"
                        fontWeight={700}
                        sx={{ color: "primary.main", fontSize: "inherit" }}>
                        {paidMonths}
                      </Typography>
                      /{totalMonths} oy
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          }
        />
      </MotionListItemButton>
    );
  },
);

ContractDebtorItem.displayName = "ContractDebtorItem";

export default ContractDebtorItem;
