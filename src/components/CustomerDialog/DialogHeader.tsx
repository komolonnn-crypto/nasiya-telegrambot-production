import { FC } from "react";

import { Box, Typography } from "@mui/material";
import { ArrowLeft } from "lucide-react";

import { ICustomer } from "../../types/ICustomer";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { setCustomerDetails } from "../../store/slices/customerSlice";

interface IProps {
  customer: ICustomer;
  onClose: () => void;
}

const DialogHeader: FC<IProps> = ({ customer, onClose }) => {
  const dispatch = useAppDispatch();

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 5,
        py: 1.25,
      }}>
      {/* Back button */}
      <Box
        onClick={() => {
          onClose();
          dispatch(setCustomerDetails(null));
        }}
        sx={{
          width: 40,
          height: 40,
          borderRadius: "20px",
          bgcolor: "#F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.15s",
          "&:hover": { bgcolor: "#E2E8F0" },
          "&:active": { scale: "0.95" },
        }}>
        <ArrowLeft size={20} color="#475569" />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}>
        {/* Avatar */}
        <Box
          sx={{
            width: 45,
            height: 45,
            borderRadius: "50px",
            bgcolor: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#4F46E5",
            fontSize: "0.85rem",
            fontWeight: 800,
          }}>
          {getInitials(customer.fullName)}
        </Box>

        {/* Info */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}>
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#1E293B",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.2,
            }}>
            {customer.fullName}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
            <Typography sx={{ fontSize: "0.72rem", color: "black" }}>
              {customer.phoneNumber ? customer.phoneNumber : "not phone number"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DialogHeader;
