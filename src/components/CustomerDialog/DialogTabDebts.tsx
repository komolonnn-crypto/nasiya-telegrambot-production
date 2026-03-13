import { FC, useState, useEffect, JSX } from "react";

import { Box, CircularProgress, Typography } from "@mui/material";

import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Calendar,
  Package,
  FileText,
} from "lucide-react";

import { getDebts } from "../../server/debtor";

interface DebtItem {
  contractId: string;
  contractCustomId: string;
  productName: string;
  customerId: string;
  paymentId: string;
  amount: number;
  dueDate: string | null;
  overdueDays: number;
  isPaid: boolean;
  status: string | null;
  rawPayment: Record<string, unknown>;
}

interface DebtResponse {
  success: boolean;
  data?:
    | { overdue: DebtItem[]; pending: DebtItem[]; normal: DebtItem[] }
    | DebtItem[];
}

interface DialogTabDebtsProps {
  customerId: string;
}

type FilterType = "all" | "overdue" | "pending" | "normal";

const filters: { key: FilterType; label: string; color: string }[] = [
  { key: "all", label: "Hammasi", color: "#4F46E5" },
  { key: "overdue", label: "Kechikkan", color: "#EF4444" },
  { key: "pending", label: "Kutilmoqda", color: "#F59E0B" },
  { key: "normal", label: "Boshlang'ich", color: "#10B981" },
];

const DialogTabDebts: FC<DialogTabDebtsProps> = ({ customerId }) => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<{
    overdue: DebtItem[];
    pending: DebtItem[];
    normal: DebtItem[];
  }>({ overdue: [], pending: [], normal: [] });

  useEffect(() => {
    let mounted = true;
    const fetchDebts = async () => {
      try {
        setLoading(true);
        setError("");
        const response: DebtResponse = await getDebts(customerId, filter);
        if (mounted && response.success && response.data) {
          const grouped = response.data as {
            overdue: DebtItem[];
            pending: DebtItem[];
            normal: DebtItem[];
          };
          if (
            Array.isArray(grouped.overdue) ||
            Array.isArray(grouped.pending)
          ) {
            setData(grouped);
          } else if (Array.isArray(response.data)) {
            const flat = response.data as DebtItem[];
            setData({
              overdue: filter === "overdue" ? flat : [],
              pending: filter === "pending" ? flat : [],
              normal: filter === "normal" ? flat : [],
            });
          }
        }
      } catch (err: unknown) {
        if (mounted)
          setError((err as Error).message || "Qarzdorlarni yuklashda xatolik");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDebts();
    return () => {
      mounted = false;
    };
  }, [customerId, filter]);

  const allDebts = [...data.overdue, ...data.pending, ...data.normal];
  const totalAmount = allDebts.reduce((sum, d) => sum + d.amount, 0);
  const totalOverdue = data.overdue.reduce((sum, d) => sum + d.amount, 0);
  const totalPending = data.pending.reduce((sum, d) => sum + d.amount, 0);

  const DebtCard: FC<{ debt: DebtItem }> = ({ debt }) => {
    const isOverdue = debt.overdueDays > 0;
    const isPending = debt.status === "PENDING";
    const borderColor =
      isOverdue ? "#EF4444"
      : isPending ? "#F59E0B"
      : "#10B981";
    const bgColor =
      isOverdue ? "rgba(239,68,68,0.04)"
      : isPending ? "rgba(245,158,11,0.04)"
      : "rgba(16,185,129,0.04)";

    return (
      <Box
        sx={{
          p: 1.5,
          bgcolor: bgColor,
          borderRadius: "12px",
          border: `1.5px solid ${borderColor}30`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          borderLeft: `3px solid ${borderColor}`,
          mb: 1,
        }}>
        {/* Row 1: product + amount */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={0.75}>
          <Box
            display="flex"
            alignItems="center"
            gap={0.75}
            sx={{ flex: 1, minWidth: 0 }}>
            <Package size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#1E293B",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
              {debt.productName}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              px: 0.875,
              py: 0.25,
              borderRadius: "8px",
              bgcolor: isOverdue ? "#FEE2E2" : "#D1FAE5",
              flexShrink: 0,
              ml: 1,
            }}>
            <DollarSign size={11} color={isOverdue ? "#EF4444" : "#10B981"} />
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: isOverdue ? "#EF4444" : "#10B981",
              }}>
              ${debt.amount.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Row 2: date + status chips + contract id */}
        <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
          {debt.dueDate && (
            <Box display="flex" alignItems="center" gap={0.3}>
              <Calendar size={11} color="#94A3B8" />
              <Typography sx={{ fontSize: "0.68rem", color: "#64748B" }}>
                {new Date(debt.dueDate).toLocaleDateString("uz-UZ")}
              </Typography>
            </Box>
          )}

          {isOverdue && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.3,
                px: 0.75,
                py: 0.2,
                borderRadius: "20px",
                bgcolor: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}>
              <AlertTriangle size={10} color="#EF4444" />
              <Typography
                sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#EF4444" }}>
                {debt.overdueDays} kun kechikkan
              </Typography>
            </Box>
          )}

          {isPending && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.3,
                px: 0.75,
                py: 0.2,
                borderRadius: "20px",
                bgcolor: "#FEF3C7",
                border: "1px solid #FCD34D",
              }}>
              <Clock size={10} color="#92400E" />
              <Typography
                sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#92400E" }}>
                Tasdiqlash kutilmoqda
              </Typography>
            </Box>
          )}

          {debt.isPaid && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.3,
                px: 0.75,
                py: 0.2,
                borderRadius: "20px",
                bgcolor: "#D1FAE5",
                border: "1px solid #6EE7B7",
              }}>
              <CheckCircle2 size={10} color="#065f46" />
              <Typography
                sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#065f46" }}>
                To'langan
              </Typography>
            </Box>
          )}

          <Typography
            sx={{ fontSize: "0.62rem", color: "#CBD5E1", ml: "auto" }}>
            {debt.contractCustomId}
          </Typography>
        </Box>
      </Box>
    );
  };

  const Section: FC<{
    title: string;
    icon: JSX.Element;
    items: DebtItem[];
    color: string;
  }> = ({ title, icon, items, color }) => {
    if (items.length === 0) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Box display="flex" alignItems="center" gap={0.75} mb={1}>
          <Box
            sx={{ width: 3.5, height: 18, borderRadius: "4px", bgcolor: color }}
          />
          <Box sx={{ color }}>{icon}</Box>
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#334155",
              flex: 1,
            }}>
            {title}
          </Typography>
          <Box
            sx={{
              px: 0.875,
              py: 0.15,
              borderRadius: "20px",
              bgcolor: `${color}15`,
              border: `1px solid ${color}30`,
            }}>
            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color }}>
              {items.length}
            </Typography>
          </Box>
        </Box>
        {items.map((debt, idx) => (
          <DebtCard key={idx} debt={debt} />
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ px: 1.75, pt: 1.5, pb: 4, maxWidth: 600, mx: "auto" }}>
      {/* ── Summary stats ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1,
          mb: 2,
        }}>
        {[
          {
            label: "Jami",
            value: `$${totalAmount.toFixed(2)}`,
            color: "#4F46E5",
            bg: "#EEF2FF",
          },
          {
            label: "Kechikkan",
            value: `$${totalOverdue.toFixed(2)}`,
            color: "#EF4444",
            bg: "#FEE2E2",
          },
          {
            label: "Kutilmoqda",
            value: `$${totalPending.toFixed(2)}`,
            color: "#F59E0B",
            bg: "#FEF3C7",
          },
        ].map(({ label, value, color, bg }) => (
          <Box
            key={label}
            sx={{
              p: 1.25,
              bgcolor: "white",
              borderRadius: "12px",
              border: "1px solid #F1F5F9",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              textAlign: "center",
            }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "9px",
                bgcolor: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 0.75,
              }}>
              <DollarSign size={15} color={color} />
            </Box>
            <Typography sx={{ fontSize: "0.6rem", color: "#94A3B8", mb: 0.2 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Filter pills ── */}
      <Box
        sx={{
          display: "flex",
          gap: 0.625,
          mb: 2,
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}>
        {filters.map((f) => {
          const isActive = filter === f.key;
          const count =
            f.key === "all" ? allDebts.length
            : f.key === "overdue" ? data.overdue.length
            : f.key === "pending" ? data.pending.length
            : data.normal.length;
          return (
            <Box
              key={f.key}
              onClick={() => setFilter(f.key)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.4,
                px: 1,
                py: 0.5,
                borderRadius: "20px",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.15s",
                bgcolor: isActive ? f.color : "white",
                border: `1.5px solid ${isActive ? f.color : "#E2E8F0"}`,
                boxShadow: isActive ? `0 2px 8px ${f.color}30` : "none",
              }}>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: isActive ? "white" : "#64748B",
                  whiteSpace: "nowrap",
                }}>
                {f.label}
              </Typography>
              <Box
                sx={{
                  minWidth: 16,
                  height: 16,
                  borderRadius: "20px",
                  bgcolor: isActive ? "rgba(255,255,255,0.25)" : "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <Typography
                  sx={{
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    color: isActive ? "white" : "#94A3B8",
                    px: 0.3,
                  }}>
                  {count}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ── Error ── */}
      {error && (
        <Box
          sx={{
            p: 2,
            borderRadius: "12px",
            bgcolor: "#FEF2F2",
            border: "1.5px solid #FECACA",
            mb: 1.5,
          }}>
          <Typography sx={{ fontSize: "0.82rem", color: "#EF4444" }}>
            {error}
          </Typography>
        </Box>
      )}

      {/* ── Loading ── */}
      {loading && (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress size={28} sx={{ color: "#4F46E5" }} />
        </Box>
      )}

      {/* ── Empty ── */}
      {!loading && allDebts.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            bgcolor: "white",
            borderRadius: "14px",
            border: "1px solid #F1F5F9",
          }}>
          <FileText size={32} color="#CBD5E1" />
          <Typography sx={{ mt: 1.5, fontSize: "0.875rem", color: "#94A3B8" }}>
            Qarzdorlik topilmadi
          </Typography>
        </Box>
      )}

      {/* ── Sections ── */}
      {!loading && allDebts.length > 0 && (
        <>
          <Section
            title="Kechikkan to'lovlar"
            icon={<AlertTriangle size={14} />}
            items={data.overdue}
            color="#EF4444"
          />
          <Section
            title="Tasdiqlash kutilmoqda"
            icon={<Clock size={14} />}
            items={data.pending}
            color="#F59E0B"
          />
          <Section
            title="Boshlang'ich qarzdorliklar"
            icon={<CheckCircle2 size={14} />}
            items={data.normal}
            color="#10B981"
          />
        </>
      )}
    </Box>
  );
};

export default DialogTabDebts;
