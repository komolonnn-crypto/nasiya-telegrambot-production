import { FC, useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { Box, CircularProgress, Typography } from "@mui/material";
import {
  Wallet,
  CheckCircle,
  Clock,
  CreditCard,
  TrendingUp,
} from "lucide-react";

import { getPrepaidRecords } from "../../server/prepaid";
import { IPrepaidRecord } from "../../types/IPrepaidRecord";
import { RootState } from "../../store";

interface Contract {
  _id: string;
  productName: string;
  prepaidBalance?: number;
  totalPrice: number;
  monthlyPayment: number;
  period: number;
  customId?: string;
}

interface IProps {
  contracts: Contract[];
  customerId: string;
}

const paymentMethodLabel = (method: string) => {
  switch (method) {
    case "som_cash":
      return "So'm naqd";
    case "som_card":
      return "So'm karta";
    case "dollar_cash":
      return "Dollar naqd";
    default:
      return "Dollar karta";
  }
};

const paymentMethodColor = (method: string) => {
  switch (method) {
    case "som_cash":
      return { bg: "#D1FAE5", color: "#065f46" };
    case "som_card":
      return { bg: "#DBEAFE", color: "#1e40af" };
    case "dollar_cash":
      return { bg: "#FEF3C7", color: "#92400e" };
    default:
      return { bg: "#EEF2FF", color: "#4338ca" };
  }
};

const formatDate = (dateStr: string | Date) => {
  try {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    const hour = d.getHours().toString().padStart(2, "0");
    const min = d.getMinutes().toString().padStart(2, "0");
    return `${day}.${month}.${year} ${hour}:${min}`;
  } catch {
    return "—";
  }
};

const DialogTabZapas: FC<IProps> = ({ contracts, customerId }) => {
  const [prepaidRecords, setPrepaidRecords] = useState<IPrepaidRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const { customerContracts } = useSelector(
    (state: RootState) => state.customer,
  );

  // Current remaining prepaid balance — use Redux contracts as fallback for debtors page
  const totalPrepaid = useMemo(() => {
    if (contracts.length > 0) {
      return contracts.reduce((sum, c) => sum + (c.prepaidBalance || 0), 0);
    }
    const allFromRedux = [
      ...(customerContracts?.allContracts || []),
      ...(customerContracts?.paidContracts || []),
    ];
    return allFromRedux.reduce((sum, c) => sum + (c.prepaidBalance || 0), 0);
  }, [contracts, customerContracts]);

  const contractsWithPrepaidCount = useMemo(() => {
    if (contracts.length > 0) {
      return contracts.filter((c) => (c.prepaidBalance || 0) > 0).length;
    }
    const allFromRedux = [
      ...(customerContracts?.allContracts || []),
      ...(customerContracts?.paidContracts || []),
    ];
    return allFromRedux.filter((c) => (c.prepaidBalance || 0) > 0).length;
  }, [contracts, customerContracts]);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    setLoadingRecords(true);
    getPrepaidRecords(customerId)
      .then((res) => {
        if (!cancelled && res.data) {
          setPrepaidRecords(
            [...res.data].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setPrepaidRecords([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingRecords(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  const isEmpty =
    !loadingRecords && prepaidRecords.length === 0 && totalPrepaid === 0;
  const hasData =
    !loadingRecords && (prepaidRecords.length > 0 || totalPrepaid > 0);

  // ── Loading state ──
  if (loadingRecords) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "260px",
          gap: 1.5,
        }}>
        <CircularProgress size={28} sx={{ color: "#4F46E5" }} />
        <Typography sx={{ fontSize: "0.82rem", color: "#94A3B8" }}>
          Zapaslar yuklanmoqda...
        </Typography>
      </Box>
    );
  }

  // ── Empty state ──
  if (isEmpty) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "320px",
          px: 3,
          gap: 0,
        }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "22px",
            bgcolor: "#F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}>
          <Wallet size={32} color="#CBD5E1" />
        </Box>
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#334155",
            mb: 0.75,
            textAlign: "center",
          }}>
          Zapas mavjud emas
        </Typography>
        <Typography
          sx={{
            fontSize: "0.82rem",
            color: "#94A3B8",
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: 260,
          }}>
          Bu mijozda hozircha ortiqcha to'lovlar (zapas) qayd etilmagan
        </Typography>
      </Box>
    );
  }

  // ── Has data ──
  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: "auto" }}>
      {/* ── Balance card ── */}
      <Box
        sx={{
          p: 2.25,
          mb: 2.5,
          borderRadius: "18px",
          background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
          boxShadow: "0 6px 24px rgba(79,70,229,0.28)",
          position: "relative",
          overflow: "hidden",
        }}>
        {/* Decorative circle */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
          }}
        />

        {/* Header render start*/}
        <Box display="flex" alignItems="center" gap={1.25} mb={1.75}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "11px",
              bgcolor: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <Wallet size={19} color="white" />
          </Box>
          <Typography
            sx={{
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
            }}>
            Umumiy Zapas Balansi
          </Typography>
        </Box>
        {/* Header render end*/}

        {/* Amount render srart*/}
        <Typography
          sx={{
            fontSize: "2.1rem",
            fontWeight: 800,
            color: "white",
            lineHeight: 1,
            mb: 0.5,
            letterSpacing: "-0.5px",
          }}>
          ${totalPrepaid.toFixed(2)}
        </Typography>
        {/* Amount render end */}

        {/* Subtitle render start */}
        <Box display="flex" alignItems="center" gap={0.75} mt={1.5}>
          <CheckCircle size={13} color="rgba(255,255,255,0.75)" />
          <Typography
            sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.75)" }}>
            {contractsWithPrepaidCount > 0 ?
              `${contractsWithPrepaidCount} ta shartnomada zapas mavjud`
            : "Joriy qoldiq balansi"}
          </Typography>
        </Box>
        {/* Subtitle render end */}
      </Box>

      {/* ── History section ── */}
      {hasData && (
        <>
          {/* Section header */}
          <Box display="flex" gap={0.75} mb={1.25}>
            <Box
              sx={{
                width: 3.5,
                height: 18,
                borderRadius: "4px",
                bgcolor: "#4F46E5",
              }}
            />
            <Box sx={{ color: "#4F46E5" }}>
              <Clock size={15} />
            </Box>
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#334155",
                flex: 1,
              }}>
              Zapas tarixi
            </Typography>
            {prepaidRecords.length > 0 && (
              <Box
                sx={{
                  px: 0.9,
                  py: 0.15,
                  borderRadius: "20px",
                  bgcolor: "#EEF2FF",
                  border: "1px solid rgba(79,70,229,0.25)",
                }}>
                <Typography
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#4F46E5",
                  }}>
                  {prepaidRecords.length}
                </Typography>
              </Box>
            )}
          </Box>

          {prepaidRecords.length === 0 ?
            // Has balance but no history records
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.75,
                bgcolor: "#F8FAFC",
                borderRadius: "12px",
                border: "1px solid #F1F5F9",
              }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "#EEF2FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                <TrendingUp size={16} color="#4F46E5" />
              </Box>
              <Typography sx={{ fontSize: "0.8rem", color: "#64748B" }}>
                Tarix yozuvlari hozircha mavjud emas
              </Typography>
            </Box>
          : <Box display="flex" flexDirection="column" gap={1}>
              {prepaidRecords.map((record) => {
                const { bg, color } = paymentMethodColor(
                  record?.paymentMethod ?? "",
                );
                return (
                  <Box
                    key={record._id}
                    sx={{
                      p: 1.5,
                      bgcolor: "white",
                      borderRadius: "12px",
                      border: "1px solid #F1F5F9",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                    }}>
                    {/* Icon render start */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "11px",
                        bgcolor: "#EEF2FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                      <CreditCard size={17} color="#4F46E5" />
                    </Box>
                    {/* Icon render end */}

                    {/* Info render start */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Amount render start */}
                      <Typography
                        sx={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#1E293B",
                          lineHeight: 1.5,
                        }}>
                        ${record.amount.toFixed(2)}
                      </Typography>
                      {/* Amount render end */}
                      {record.notes && (
                        <Typography
                          sx={{
                            fontSize: "0.68rem",
                            color: "#64748B",
                            mt: 0.25,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {record.notes}
                        </Typography>
                      )}
                    </Box>

                    {/* Payment method badge */}
                    <Box
                      sx={{
                        px: 0.875,
                        py: 0.4,
                        borderRadius: "8px",
                        bgcolor: bg,
                        flexShrink: 0,
                      }}>
                      <Typography
                        sx={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          color,
                          lineHeight: 1.3,
                        }}>
                        {paymentMethodLabel(record.paymentMethod ?? "")}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          }
        </>
      )}
    </Box>
  );
};

export default DialogTabZapas;
