import { FC, useState, useMemo } from "react";

import { Box, SwipeableDrawer, Typography, Button, Stack } from "@mui/material";
import { ICustomerContract } from "../../types/ICustomer";
import {
  X,
  Calendar,
  CreditCard,
  AlertTriangle,
  Package,
  TrendingUp,
  Clock,
} from "lucide-react";
import { getContract } from "../../store/actions/customerActions";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import PaymentModal from "../PaymentModal/PaymentModal";
import ModernDateTimePicker from "../ModernDateTimePicker";
import authApi from "../../server/auth";
import { useAlert } from "../AlertSystem";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  contract: ICustomerContract | null;
  customerId?: string;
  onPaymentSuccess?: () => void;
  readOnly?: boolean;
  selectedMonth?: number | null;
}

interface InfoRowProps {
  label: string;
  value: string;
  color?: string;
}

function InfoRow({ label, value, color = "#1E293B" }: InfoRowProps) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{ py: 0.875, borderBottom: "1px solid #F8FAFC" }}>
      <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color }}>
        {value}
      </Typography>
    </Box>
  );
}

const ContractInfo: FC<DrawerProps> = ({
  open,
  onClose,
  contract,
  customerId,
  onPaymentSuccess: externalOnPaymentSuccess,
  readOnly = false,
  selectedMonth = null,
}) => {
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useAlert();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [dateChangeModalOpen, setDateChangeModalOpen] = useState(false);

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    if (customerId) {
      dispatch(getContract(customerId));
    }
    if (externalOnPaymentSuccess) {
      externalOnPaymentSuccess();
    }
  };

  const handleDateChange = async (newDate: Date) => {
    try {
      await authApi.put(`/contract/update-payment-date`, {
        contractId: contract?._id,
        newPaymentDate: newDate.toISOString(),
      });
      showSuccess("Sana muvaffaqiyatli o'zgartirildi", "Muvaffaqiyat");
      if (customerId) {
        dispatch(getContract(customerId));
      }
      if (externalOnPaymentSuccess) {
        externalOnPaymentSuccess();
      }
      setDateChangeModalOpen(false);
    } catch (error) {
      console.error("To'lov sanasini o'zgartirishda xatolik:", error);
      showError("Sana o'zgartirishda xatolik yuz berdi", "Xatolik");
    }
  };

  const { amountToPay, paymentForDeficit } = useMemo(() => {
    if (!contract) return { amountToPay: 0, paymentForDeficit: undefined };

    const paymentForDeficit = contract.payments?.find(
      (p) =>
        p.status === "PENDING" ||
        (p.status === "UNDERPAID" &&
          p.remainingAmount &&
          p.remainingAmount > 0),
    );

    if (
      paymentForDeficit &&
      paymentForDeficit.remainingAmount &&
      paymentForDeficit.remainingAmount > 0
    ) {
      return {
        amountToPay: paymentForDeficit.remainingAmount,
        paymentForDeficit,
      };
    }

    const lastConfirmedPayment = contract.payments
      ?.filter((p) => p.status === "PAID" || p.status === "OVERPAID")
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0];

    const previousExcess = lastConfirmedPayment?.excessAmount || 0;
    const monthlyPayment = contract.monthlyPayment || 0;

    return {
      amountToPay: Math.max(0, monthlyPayment - previousExcess),
      paymentForDeficit: undefined,
    };
  }, [contract, selectedMonth]);

  if (!contract) return null;

  const nextPaymentDate =
    contract.nextPaymentDate ? new Date(contract.nextPaymentDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (nextPaymentDate) nextPaymentDate.setHours(0, 0, 0, 0);

  const isOverdue =
    nextPaymentDate && nextPaymentDate.getTime() < today.getTime();
  const hasPendingPayment = contract.payments?.some(
    (p) => p.status === "PENDING",
  );

  const totalDebt =
    (contract.monthlyPayment || 0) * (contract.durationMonths || 0);
  const totalPaid = contract.totalPaid || 0;
  const remainingDebt = contract.remainingDebt || 0;
  const paidPct = totalDebt > 0 ? Math.round((totalPaid / totalDebt) * 100) : 0;

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        sx={{ zIndex: 1300 }}
        PaperProps={{
          sx: {
            borderRadius: 0,
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            bgcolor: "#F8FAFC",
            maxHeight: "90vh",
            overflow: "auto",
          },
        }}>
        {/* Handle bar */}
        <Box
          sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
          <Box
            sx={{
              width: 40,
              height: 4,
              borderRadius: "4px",
              bgcolor: "#E2E8F0",
            }}
          />
        </Box>

        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "1px solid #E2E8F0",
            bgcolor: "white",
          }}>
          <Box display="flex" alignItems="center" gap={1.25}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "11px",
                bgcolor: "#EEF2FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
              <Package size={18} color="#4F46E5" />
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>
                {contract.productName}
                {selectedMonth ? ` — ${selectedMonth}-oy` : ""}
              </Typography>
              <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8" }}>
                {contract.paidMonthsCount || 0}/{contract.durationMonths || 0}{" "}
                oy to'langan
              </Typography>
            </Box>
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
              flexShrink: 0,
              "&:hover": { bgcolor: "#E2E8F0" },
            }}>
            <X size={16} color="#64748B" />
          </Box>
        </Box>

        <Box sx={{ px: 2.5, pt: 2, pb: 4 }}>
          {/* ── Progress bar ── */}
          <Box
            sx={{
              mb: 2,
              p: 1.75,
              bgcolor: "white",
              borderRadius: "14px",
              border: "1px solid #F1F5F9",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
            <Box display="flex" justifyContent="space-between" mb={0.75}>
              <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8" }}>
                To'lov holati
              </Typography>
              <Typography
                sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#4F46E5" }}>
                {paidPct}%
              </Typography>
            </Box>
            <Box
              sx={{
                height: 6,
                borderRadius: "4px",
                bgcolor: "#F1F5F9",
                overflow: "hidden",
                mb: 1.25,
              }}>
              <Box
                sx={{
                  height: "100%",
                  width: `${paidPct}%`,
                  bgcolor: isOverdue ? "#EF4444" : "#4F46E5",
                  borderRadius: "4px",
                  transition: "width 0.4s ease",
                }}
              />
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 0.75,
                pt: 1,
                borderTop: "1px solid #F8FAFC",
              }}>
              {[
                {
                  label: "Jami",
                  value: `${totalDebt.toLocaleString()}$`,
                  color: "#475569",
                },
                {
                  label: "To'langan",
                  value: `${totalPaid.toLocaleString()}$`,
                  color: "#10B981",
                },
                {
                  label: "Qolgan",
                  value: `${remainingDebt.toLocaleString()}$`,
                  color: remainingDebt > 0 ? "#EF4444" : "#10B981",
                },
              ].map(({ label, value, color }) => (
                <Box key={label} textAlign="center">
                  <Typography
                    sx={{ fontSize: "0.6rem", color: "#94A3B8", mb: 0.2 }}>
                    {label}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.82rem", fontWeight: 800, color }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── Next payment ── */}
          <Box
            sx={{
              mb: 2,
              p: 1.75,
              bgcolor: isOverdue ? "#FEF2F2" : "#F0F9FF",
              borderRadius: "14px",
              border: `1.5px solid ${isOverdue ? "#FECACA" : "#BAE6FD"}`,
            }}>
            {nextPaymentDate ?
              <Stack spacing={1.25}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={0.75}>
                    {isOverdue ?
                      <AlertTriangle size={16} color="#EF4444" />
                    : <Calendar size={16} color="#0EA5E9" />}
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: isOverdue ? "#EF4444" : "#0EA5E9",
                      }}>
                      {isOverdue ? "Kechikkan to'lov" : "Keyingi to'lov"}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: isOverdue ? "#EF4444" : "#0284C7",
                    }}>
                    {nextPaymentDate.toLocaleDateString("uz-UZ")}
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between">
                  <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8" }}>
                    Oylik to'lov
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 800,
                      color: isOverdue ? "#EF4444" : "#1E293B",
                    }}>
                    {contract.monthlyPayment.toLocaleString()} $
                  </Typography>
                </Box>

                {!readOnly && (
                  <Button
                    size="small"
                    startIcon={<Clock size={14} />}
                    onClick={() => setDateChangeModalOpen(true)}
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      py: 0.6,
                      borderColor: isOverdue ? "#FECACA" : "#BAE6FD",
                      color: isOverdue ? "#EF4444" : "#0EA5E9",
                      "&:hover": {
                        borderColor: isOverdue ? "#EF4444" : "#0EA5E9",
                        bgcolor: "transparent",
                      },
                    }}>
                    Sanani o'zgartirish
                  </Button>
                )}
              </Stack>
            : <Box display="flex" alignItems="center" gap={1}>
                <AlertTriangle size={16} color="#F59E0B" />
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    color: "#92400E",
                    fontWeight: 500,
                  }}>
                  To'lov sanasi aniqlanmagan
                </Typography>
              </Box>
            }
          </Box>

          {/* ── Payment button ── */}
          {!readOnly &&
            (hasPendingPayment ?
              <Box
                sx={{
                  mb: 2,
                  p: 1.5,
                  bgcolor: "#FEF3C7",
                  borderRadius: "12px",
                  border: "1px solid #FCD34D",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}>
                <Clock size={16} color="#92400E" />
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#92400E",
                  }}>
                  Tasdiqlash kutilmoqda
                </Typography>
              </Box>
            : <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<CreditCard size={18} />}
                onClick={() => setPaymentModalOpen(true)}
                sx={{
                  mb: 2,
                  py: 1.4,
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  bgcolor: "#4F46E5",
                  "&:hover": { bgcolor: "#4338CA" },
                  boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
                }}>
                To'lov qilish
              </Button>)}

          {/* ── Contract details ── */}
          <Box
            sx={{
              p: 1.75,
              bgcolor: "white",
              borderRadius: "14px",
              border: "1px solid #F1F5F9",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
            <Box display="flex" alignItems="center" gap={0.75} mb={1}>
              <TrendingUp size={14} color="#4F46E5" />
              <Typography
                sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>
                Shartnoma ma'lumotlari
              </Typography>
            </Box>
            <InfoRow
              label="Jami qarz"
              value={`${contract.totalDebt?.toLocaleString() || 0} $`}
            />
            <InfoRow
              label="To'langan"
              value={`${contract.totalPaid?.toLocaleString() || 0} $`}
              color="#10B981"
            />
            <InfoRow
              label="Qolgan"
              value={`${contract.remainingDebt?.toLocaleString() || 0} $`}
              color={remainingDebt > 0 ? "#EF4444" : "#10B981"}
            />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ pt: 0.875 }}>
              <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                Oylik to'lov
              </Typography>
              <Typography
                sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1E293B" }}>
                {contract.monthlyPayment?.toLocaleString() || 0} $
              </Typography>
            </Box>
          </Box>
        </Box>
      </SwipeableDrawer>

      {paymentModalOpen && (
        <PaymentModal
          open={paymentModalOpen}
          amount={amountToPay}
          contractId={contract.customId || contract._id}
          paymentId={paymentForDeficit?._id}
          customerId={customerId}
          targetMonth={selectedMonth || undefined}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <ModernDateTimePicker
        open={dateChangeModalOpen}
        onClose={() => setDateChangeModalOpen(false)}
        onConfirm={handleDateChange}
        initialDate={
          contract.nextPaymentDate ?
            new Date(contract.nextPaymentDate)
          : new Date()
        }
        minDate={new Date()}
      />
    </>
  );
};

export default ContractInfo;
