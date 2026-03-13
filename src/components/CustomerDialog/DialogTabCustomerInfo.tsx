import { FC, useEffect, useState } from "react";

import { Box, CircularProgress, Typography } from "@mui/material";

import {
  User,
  Phone,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

import authApi from "../../server/auth";
import { ICustomerDetails } from "../../types/ICustomer";

interface IProps {
  customerId: string;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg: string;
  valueColor?: string;
}

const InfoRow: FC<InfoRowProps> = ({
  icon,
  label,
  value,
  iconBg,
  valueColor = "#1E293B",
}) => (
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
    }}>
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: "11px",
        bgcolor: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8", mb: 0.2 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.875rem",
          fontWeight: 700,
          color: valueColor,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const DialogTabCustomerInfo: FC<IProps> = ({ customerId }) => {
  const [customerDetails, setCustomerDetails] =
    useState<ICustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    setLoading(true);
    setHasError(false);
    setCustomerDetails(null);

    authApi
      .get(`/customer/get-by-id/${customerId}`)
      .then((res) => {
        if (!cancelled) {
          setCustomerDetails(res.data?.data || null);
        }
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "240px",
        }}>
        <CircularProgress size={28} sx={{ color: "#4F46E5" }} />
      </Box>
    );
  }

  if (hasError || !customerDetails) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          minHeight: "240px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
        }}>
        <AlertCircle size={36} color="#CBD5E1" />
        <Typography sx={{ fontSize: "0.88rem", color: "#94A3B8" }}>
          Ma'lumot topilmadi
        </Typography>
      </Box>
    );
  }

  const {
    fullName,
    phoneNumber,
    address,
    totalDebt = 0,
    totalPaid = 0,
    remainingDebt = 0,
    delayDays,
  } = customerDetails;

  const delayColor =
    (delayDays || 0) > 30 ? "#EF4444"
    : (delayDays || 0) > 7 ? "#F59E0B"
    : "#10B981";

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: "auto" }}>
      {/* ── Section: Contact info ── */}
      <Box display="flex" alignItems="center" gap={0.75} mb={1.25}>
        <Box
          sx={{
            width: 3.5,
            height: 18,
            borderRadius: "4px",
            bgcolor: "#4F46E5",
          }}
        />
        <Typography
          sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
          Shaxsiy ma'lumotlar
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={1} mb={2.5}>
        <InfoRow
          icon={<User size={17} color="#4F46E5" />}
          label="To'liq ism"
          value={fullName}
          iconBg="#EEF2FF"
        />
        {phoneNumber && phoneNumber.trim() && (
          <InfoRow
            icon={<Phone size={17} color="#0EA5E9" />}
            label="Telefon"
            value={phoneNumber}
            iconBg="#F0F9FF"
          />
        )}
        {address && address.trim() && (
          <InfoRow
            icon={<MapPin size={17} color="#F59E0B" />}
            label="Manzil"
            value={address}
            iconBg="#FFFBEB"
          />
        )}
      </Box>

      {/* ── Section: Finance ── */}
      <Box display="flex" alignItems="center" gap={0.75} mb={1.25}>
        <Box
          sx={{
            width: 3.5,
            height: 18,
            borderRadius: "4px",
            bgcolor: "#10B981",
          }}
        />
        <Typography
          sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
          Moliyaviy holat
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={1} mb={2}>
        <InfoRow
          icon={<DollarSign size={17} color="#4F46E5" />}
          label="Jami qarz"
          value={`${totalDebt.toLocaleString()} $`}
          iconBg="#EEF2FF"
          valueColor="#4F46E5"
        />
        <InfoRow
          icon={<CheckCircle size={17} color="#10B981" />}
          label="To'langan"
          value={`${totalPaid.toLocaleString()} $`}
          iconBg="#D1FAE5"
          valueColor="#10B981"
        />
        <InfoRow
          icon={<TrendingUp size={17} color="#EF4444" />}
          label="Qoldiq"
          value={`${remainingDebt.toLocaleString()} $`}
          iconBg="#FEE2E2"
          valueColor={remainingDebt > 0 ? "#EF4444" : "#10B981"}
        />
      </Box>

      {/* ── Delay warning ── */}
      {delayDays !== undefined && delayDays > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: "12px",
            bgcolor:
              delayDays > 30 ? "rgba(239,68,68,0.07)"
              : delayDays > 7 ? "rgba(245,158,11,0.07)"
              : "rgba(16,185,129,0.07)",
            border: `1.5px solid ${delayColor}30`,
          }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "11px",
              bgcolor: `${delayColor}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
            <Clock size={17} color={delayColor} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8", mb: 0.2 }}>
              Kechikish
            </Typography>
            <Typography
              sx={{ fontSize: "0.925rem", fontWeight: 800, color: delayColor }}>
              {delayDays} kun
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DialogTabCustomerInfo;
