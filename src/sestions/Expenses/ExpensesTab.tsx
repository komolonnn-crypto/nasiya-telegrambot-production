import { Box, Typography } from "@mui/material";
import { FC } from "react";
import { Wallet, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface IProps {
  activeTab: number;
  setActiveTab: (value: number) => void;
}

const tabs = [
  { label: "Faol", icon: Wallet },
  { label: "Qaytarilgan", icon: RefreshCw },
];

const ExpensesTab: FC<IProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "4px",
        p: "4px",
        bgcolor: "#F1F5F9",
        borderRadius: "12px",
        mb: 2,
      }}>
      {tabs.map((tab, idx) => {
        const isActive = activeTab === idx;
        const Icon = tab.icon;
        return (
          <Box
            key={tab.label}
            onClick={() => setActiveTab(idx)}
            sx={{
              flex: 1,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              py: "8px",
              borderRadius: "9px",
              cursor: "pointer",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
              "&:active": { transform: "scale(0.94)" },
              transition: "transform 0.1s ease",
            }}>
            {/* Siljuvchi ko'k pill — debtors dagi kabi */}
            {isActive && (
              <motion.div
                layoutId="expenses-pill"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 9,
                  background: "#2563EB",
                }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                  mass: 0.8,
                }}
              />
            )}

            {/* Icon */}
            <Box
              sx={{
                display: "flex",
                position: "relative",
                zIndex: 1,
                color: isActive ? "white" : "#64748B",
                transition: "color 0.15s ease",
              }}>
              <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
            </Box>

            {/* Label */}
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: isActive ? 700 : 600,
                position: "relative",
                zIndex: 1,
                color: isActive ? "white" : "#64748B",
                transition: "color 0.15s ease",
                lineHeight: 1,
              }}>
              {tab.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default ExpensesTab;
