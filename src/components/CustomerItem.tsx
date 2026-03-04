import { memo } from "react";

import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Phone, Clock } from "lucide-react";
import { ICustomer } from "../types/ICustomer";

interface CustomerListItemProps {
  customer: ICustomer;
  onClick: (customer: ICustomer) => void;
  showDebtBadge?: boolean;
}

const MotionBox = motion(Box);

const CustomerListItem: React.FC<CustomerListItemProps> = memo(
  ({ customer, onClick, showDebtBadge = false }) => {
    const getDelayColor = (days: number) => {
      if (days > 30) return "#EF4444";
      if (days > 7) return "#F59E0B";
      return "#10B981";
    };

    const getInitials = (name: string) => {
      const parts = name.trim().split(" ");
      if (parts.length >= 2)
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    };

    const getDisplayName = (fullName: string) => {
      if (fullName.length > 22) {
        const parts = fullName.split(" ");
        if (parts.length > 1)
          return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
        return `${fullName.slice(0, 20)}…`;
      }
      return fullName;
    };

    const formatPhone = (phone: string) =>
      phone.length > 13 ? `${phone}` : phone;

    return (
      <MotionBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onClick(customer)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 1.75,
          py: 1.25,
          mb: 1,
          bgcolor: "white",
          borderRadius: "14px",
          border:
            showDebtBadge ?
              "1.5px solid #FECACA"
            : "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderColor: showDebtBadge ? "#EF4444" : "#4F46E5",
            transform: "translateY(-1px)",
          },
        }}>
        {/* Avatar */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "20px",
            bgcolor: showDebtBadge ? "#FEE2E2" : "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: showDebtBadge ? "#EF4444" : "#4F46E5",
            fontSize: "0.82rem",
            fontWeight: 800,
          }}>
          {getInitials(customer.fullName)}
        </Box>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={1}>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#1E293B",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
              {getDisplayName(customer.fullName)}
            </Typography>

            {showDebtBadge && (
              <Box
                sx={{
                  px: 0.9,
                  py: 0.2,
                  borderRadius: "20px",
                  bgcolor: "#FEE2E2",
                  flexShrink: 0,
                }}>
                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    color: "#EF4444",
                  }}>
                  QARZDOR
                </Typography>
              </Box>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={2} mt={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Phone size={14} color="#94A3B8" />
              <Typography sx={{ fontSize: "0.72rem", color: "black" }}>
                {formatPhone(
                  customer.phoneNumber ?
                    customer.phoneNumber
                  : "not phone number",
                )}
              </Typography>
            </Box>

            {showDebtBadge &&
              customer.delayDays !== undefined &&
              customer.delayDays > 0 && (
                <Box display="flex" alignItems="center" gap={0.4}>
                  <Clock size={12} color={getDelayColor(customer.delayDays)} />
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      color: getDelayColor(customer.delayDays),
                    }}>
                    {customer.delayDays > 99 ? "99+" : customer.delayDays} kun
                    kech
                  </Typography>
                </Box>
              )}
          </Box>
        </Box>
      </MotionBox>
    );
  },
);

CustomerListItem.displayName = "CustomerListItem";

export default CustomerListItem;
