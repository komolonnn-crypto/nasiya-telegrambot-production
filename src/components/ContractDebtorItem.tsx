import { memo } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Clock, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { IDebtorContract } from "../types/ICustomer";

interface ContractDebtorItemProps {
  contract: IDebtorContract;
  onClick: (contract: IDebtorContract) => void;
}

const MotionBox = motion(Box);

const ContractDebtorItem: React.FC<ContractDebtorItemProps> = memo(
  ({ contract, onClick }) => {
    const getDelayColor = (days: number) => {
      if (days > 30) return "#EF4444";
      if (days > 7) return "#F59E0B";
      return "#64748B";
    };

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

    const truncateProductName = (name: string) => {
      const maxLen = 28;
      return name.length > maxLen ? `${name.slice(0, maxLen)}…` : name;
    };

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

    const currencySymbol =
      contract.currency === "UZS" ? "so'm"
      : contract.currency === "EUR" ? "€"
      : "$";

    const isPending = contract.isPending;
    const isOverdue = !isPending && contract.delayDays > 0;

    const borderColor =
      isPending ? "#10B981"
      : isOverdue ? "#EF4444"
      : "#E2E8F0";

    const bgColor =
      isPending ? "#F0FDF4"
      : isOverdue ? "rgba(239,68,68,0.03)"
      : "white";

    return (
      <MotionBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onClick(contract)}
        sx={{
          borderRadius: "14px",
          mb: 1.25,
          px: 1.75,
          py: 1.25,
          bgcolor: bgColor,
          border: `1.5px solid ${borderColor}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          cursor: "pointer",
          transition: "all 0.2s",
          ...(isPending && {
            "&:hover, &:active": {
              bgcolor: "#10B981",
              borderColor: "#059669",
              boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
              "& .MuiTypography-root": { color: "#fff !important" },
            },
          }),
          ...(!isPending && {
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transform: "translateY(-1px)",
            },
          }),
        }}
      >
        {/* ── Row 1: day chip + name + amount ── */}
        <Box display="flex" alignItems="center" gap={0.75} mb={0.75}>
          {/* Day chip */}
          {(contract.initialPaymentDueDate || contract.startDate) && (
            <Box
              sx={{
                px: 0.75,
                py: 0.15,
                borderRadius: "6px",
                bgcolor: isPending ? "rgba(255,255,255,0.4)" : "#EEF2FF",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: isPending ? "#065f46" : "#4F46E5",
                }}
              >
                {new Date(
                  contract.initialPaymentDueDate || contract.startDate!,
                )
                  .getDate()
                  .toString()
                  .padStart(2, "0")}
              </Typography>
            </Box>
          )}

          {/* Name */}
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#1E293B",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {getDisplayName(contract.fullName)}
          </Typography>

          {/* Amount */}
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 800,
              color:
                isPending ? "#059669"
                : isOverdue ? "#EF4444"
                : "#10B981",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {contract.monthlyPayment?.toLocaleString()} {currencySymbol}
          </Typography>
        </Box>

        {/* ── Row 2: product + status chips + months ── */}
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={0.5}>
          {/* Product name */}
          <Box display="flex" alignItems="center" gap={0.5} sx={{ minWidth: 0, flex: 1 }}>
            <Package size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "#64748B",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {truncateProductName(contract.productName)}
            </Typography>
          </Box>

          {/* Status chips + months */}
          <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
            {/* PENDING state */}
            {isPending && (
              <>
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.2,
                    borderRadius: "20px",
                    bgcolor:
                      contract.remainingDebt <= 0
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(239,68,68,0.1)",
                    border: `1px solid ${contract.remainingDebt <= 0 ? "#6ee7b7" : "#fca5a5"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.3,
                  }}
                >
                  {contract.remainingDebt <= 0 ? (
                    <CheckCircle2 size={10} color="#065f46" />
                  ) : (
                    <AlertCircle size={10} color="#b91c1c" />
                  )}
                  <Typography
                    sx={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color: contract.remainingDebt <= 0 ? "#065f46" : "#b91c1c",
                    }}
                  >
                    {contract.remainingDebt <= 0 ? "To'liq" : "Qisman"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    px: 0.75,
                    py: 0.2,
                    borderRadius: "20px",
                    bgcolor: "#fef3c7",
                    border: "1px solid #fcd34d",
                    animation: "pulse 2s infinite ease-in-out",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1 },
                      "50%": { opacity: 0.6 },
                    },
                  }}
                >
                  <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#92400e" }}>
                    ⏳ Kassa
                  </Typography>
                </Box>
              </>
            )}

            {/* Overdue */}
            {!isPending && isOverdue && (
              <Box
                sx={{
                  px: 0.75,
                  py: 0.2,
                  borderRadius: "20px",
                  bgcolor: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.3,
                }}
              >
                <Clock size={10} color={getDelayColor(contract.delayDays)} />
                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    color: getDelayColor(contract.delayDays),
                  }}
                >
                  {contract.delayDays > 99 ? "99+" : contract.delayDays} kun kech
                </Typography>
              </Box>
            )}

            {/* Today / Upcoming */}
            {!isPending &&
              contract.delayDays === 0 &&
              contract.nextPaymentStatus &&
              contract.nextPaymentStatus !== "OVERDUE" && (
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.2,
                    borderRadius: "20px",
                    bgcolor:
                      contract.nextPaymentStatus === "TODAY"
                        ? "rgba(102,126,234,0.15)"
                        : "rgba(240,147,251,0.15)",
                    border: `1px solid ${
                      contract.nextPaymentStatus === "TODAY" ? "#a5b4fc" : "#e9d5ff"
                    }`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color:
                        contract.nextPaymentStatus === "TODAY" ? "#4338ca" : "#9333ea",
                    }}
                  >
                    {contract.nextPaymentStatus === "TODAY" ? "Bugun" : "Yaqinda"}
                  </Typography>
                </Box>
              )}

            {/* Month progress */}
            {totalMonths > 0 && (
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#94A3B8",
                  whiteSpace: "nowrap",
                }}
              >
                <Box component="span" sx={{ fontWeight: 700, color: "#4F46E5" }}>
                  {paidMonths}
                </Box>
                /{totalMonths} oy
              </Typography>
            )}
          </Box>
        </Box>
      </MotionBox>
    );
  },
);

ContractDebtorItem.displayName = "ContractDebtorItem";

export default ContractDebtorItem;
