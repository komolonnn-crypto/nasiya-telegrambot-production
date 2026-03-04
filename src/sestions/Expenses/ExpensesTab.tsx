import { Box, Typography } from "@mui/material";
import { FC } from "react";
import { Wallet, RefreshCw } from "lucide-react";

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
        gap: 0.75,
        p: 0.5,
        bgcolor: "#F1F5F9",
        borderRadius: "12px",
        mb: 2,
      }}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === idx;
        const Icon = tab.icon;
        return (
          <Box
            key={tab.label}
            onClick={() => setActiveTab(idx)}
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              py: 0.875,
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.2s",
              bgcolor: isActive ? "white" : "transparent",
              boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              color: isActive ? "#4F46E5" : "#94A3B8",
            }}
          >
            <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {tab.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default ExpensesTab;
