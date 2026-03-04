import { FC } from "react";

import { Box, Typography } from "@mui/material";
import { CreditCard, User, MessageSquare, Wallet } from "lucide-react";

interface IProps {
  activeTab: number;
  setActiveTab: (value: number) => void;
}

const tabs = [
  { label: "To'lovlar", icon: CreditCard },
  { label: "Ma'lumotlar", icon: User },
  { label: "Izohlar", icon: MessageSquare },
  { label: "Zapaslar", icon: Wallet },
];

const DialogTab: FC<IProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 0,
        overflowX: "auto",
        px: 1.5,
        pb: 0,
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        borderBottom: "1px solid #F1F5F9",
      }}>
      {tabs.map((tab, idx) => {
        const isActive = activeTab === idx;
        const Icon = tab.icon;
        return (
          <Box
            key={tab.label}
            onClick={() => setActiveTab(idx)}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.3,
              px: 3,
              pt: 0.75,
              pb: 0.625,
              cursor: "pointer",
              flexShrink: 0,
              position: "relative",
              color: isActive ? "#4F46E5" : "#94A3B8",
              transition: "color 0.15s",
            }}>
            <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: isActive ? 700 : 500,
                whiteSpace: "nowrap",
              }}>
              {tab.label}
            </Typography>
            {/* Active indicator */}
            {isActive && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2.5,
                  bgcolor: "#4F46E5",
                  borderRadius: "2px 2px 0 0",
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default DialogTab;
