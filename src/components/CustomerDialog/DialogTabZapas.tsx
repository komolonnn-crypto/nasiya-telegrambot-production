import { FC, useMemo, useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Wallet, CheckCircle, Clock, CreditCard } from "lucide-react";
import { getPrepaidRecords } from "../../server/prepaid";
import { IPrepaidRecord } from "../../types/IPrepaidRecord";

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

const DialogTabZapas: FC<IProps> = ({ contracts, customerId }) => {
  const [prepaidRecords, setPrepaidRecords] = useState<IPrepaidRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const totalPrepaidFromRecords = useMemo(
    () => prepaidRecords.reduce((sum, r) => sum + (r.amount || 0), 0),
    [prepaidRecords],
  );

  const totalPrepaidFromContracts = useMemo(
    () => contracts.reduce((sum, c) => sum + (c.prepaidBalance || 0), 0),
    [contracts],
  );

  const totalPrepaid = Math.max(
    totalPrepaidFromRecords,
    totalPrepaidFromContracts,
  );

  const contractsWithPrepaid = useMemo(
    () => contracts.filter((c) => c.prepaidBalance && c.prepaidBalance > 0),
    [contracts],
  );

  useEffect(() => {
    if (!customerId) return;
    setLoadingRecords(true);
    getPrepaidRecords(customerId)
      .then((res) => {
        if (res.data) {
          setPrepaidRecords(
            res.data.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
          );
        }
      })
      .catch((e) => console.error("Zapas tarixi:", e))
      .finally(() => setLoadingRecords(false));
  }, [customerId]);

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: "auto" }}>
      {/* ── Balance card ── */}
      <Box
        sx={{
          p: 2.5,
          mb: 2.5,
          bgcolor: "#4F46E5",
          borderRadius: "18px",
          boxShadow: "0 4px 20px rgba(79,70,229,0.3)",
          color: "white",
        }}>
        <Box display="flex" alignItems="center" gap={1.25} mb={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              bgcolor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <Wallet size={20} color="white" />
          </Box>
          <Typography
            sx={{ fontSize: "0.9rem", fontWeight: 700, color: "white" }}>
            Umumiy Zapas
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "white",
            lineHeight: 1,
            mb: 1.5,
          }}>
          ${totalPrepaid.toFixed(2)}
        </Typography>

        <Box display="flex" alignItems="center" gap={0.75}>
          <CheckCircle size={14} color="rgba(255,255,255,0.8)" />
          <Typography
            sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.8)" }}>
            {contractsWithPrepaid.length} ta shartnomada zapas mavjud
          </Typography>
        </Box>
      </Box>

      {/* ── History section ── */}
      {(prepaidRecords.length > 0 || loadingRecords) && (
        <>
          <Box display="flex" alignItems="center" gap={0.75} mb={1.25}>
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
            <Box
              sx={{
                px: 0.9,
                py: 0.15,
                borderRadius: "20px",
                bgcolor: "#EEF2FF",
                border: "1px solid rgba(79,70,229,0.3)",
              }}>
              <Typography
                sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#4F46E5" }}>
                {prepaidRecords.length}
              </Typography>
            </Box>
          </Box>

          {loadingRecords ?
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} sx={{ color: "#4F46E5" }} />
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
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}>
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
                      <CreditCard size={17} color="#4F46E5" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "#1E293B",
                        }}>
                        ${record.amount.toFixed(2)} ortiqcha to'lov
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.68rem", color: "#94A3B8", mt: 0.2 }}>
                        {new Date(record.date).toLocaleDateString("uz-UZ", {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 0.875,
                        py: 0.3,
                        borderRadius: "8px",
                        bgcolor: bg,
                        flexShrink: 0,
                      }}>
                      <Typography
                        sx={{ fontSize: "0.62rem", fontWeight: 700, color }}>
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

      {/* Empty state */}
      {!loadingRecords && prepaidRecords.length === 0 && totalPrepaid === 0 && (
        <Box textAlign="center" py={4}>
          <Typography sx={{ fontSize: "0.875rem", color: "#94A3B8" }}>
            Zapas mavjud emas
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DialogTabZapas;
