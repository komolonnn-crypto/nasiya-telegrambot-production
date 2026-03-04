import { useEffect } from "react";

import { Box, Typography } from "@mui/material";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { getDashboard } from "../store/actions/dashboardActions";

import {
  DollarSign,
  Banknote,
  TrendingUp,
  User,
  BarChart2,
} from "lucide-react";

import { motion } from "framer-motion";

type TabPageProps = {
  activeTabIndex: number;
  index: number;
};

const MotionBox = motion(Box);

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  iconBg: string;
  iconColor: string;
  delay?: number;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
  delay = 0,
}: StatCardProps) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      sx={{
        bgcolor: "white",
        borderRadius: "16px",
        p: 2,
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      }}>
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            bgcolor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: iconColor,
          }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8", mb: 0.3 }}>
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 800,
              color: "#1E293B",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
            {value}
          </Typography>
          {sub && (
            <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8", mt: 0.2 }}>
              {sub}
            </Typography>
          )}
        </Box>
      </Box>
    </MotionBox>
  );
}

export default function DailyReport({ activeTabIndex, index }: TabPageProps) {
  const dispatch = useAppDispatch();
  const { dashboard } = useSelector((state: RootState) => state.dashboard);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (activeTabIndex === index) {
      dispatch(getDashboard());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex, index]);

  const todayDollar = dashboard?.today?.dollar ?? 0;
  const todaySum = dashboard?.today?.sum ?? 0;
  const todayCount = dashboard?.today?.count ?? 0;
  const balanceDollar = dashboard?.balance?.dollar ?? 0;
  const balanceSum = dashboard?.balance?.sum ?? 0;

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 4, maxWidth: 600, mx: "auto" }}>
      {/* ── User greeting ── */}
      <MotionBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2.5,
          px: 0.5,
        }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "13px",
            bgcolor: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4F46E5",
            flexShrink: 0,
          }}>
          <User size={22} />
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#1E293B",
              lineHeight: 1.2,
            }}>
            {user.firstname} {user.lastname}
          </Typography>
          <Typography
            sx={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 500 }}>
            Xush kelibsiz! Kunlik hisobot
          </Typography>
        </Box>
      </MotionBox>

      {/* ── Section: Bugungi to'lovlar ── */}
      <Box display="flex" alignItems="center" gap={0.75} mb={1.5}>
        <Box
          sx={{
            width: 3.5,
            height: 20,
            borderRadius: "4px",
            bgcolor: "#4F46E5",
          }}
        />
        <Box sx={{ color: "#4F46E5" }}>
          <BarChart2 size={15} />
        </Box>
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#334155",
            flex: 1,
          }}>
          Bugungi to'lovlar
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
            sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#4F46E5" }}>
            {todayCount} ta
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={1.25} mb={2.5}>
        <StatCard
          icon={<DollarSign size={22} />}
          label="Bugungi to'lovlar (Dollar)"
          value={`${todayDollar.toLocaleString()} $`}
          sub={`${todayCount} ta to'lov`}
          iconBg="#EEF2FF"
          iconColor="#4F46E5"
          delay={0.05}
        />
        <StatCard
          icon={<Banknote size={22} />}
          label="Bugungi to'lovlar (So'm)"
          value={`${todaySum.toLocaleString()} UZS`}
          sub={`${todayCount} ta to'lov`}
          iconBg="#F0F9FF"
          iconColor="#0EA5E9"
          delay={0.1}
        />
      </Box>

      {/* ── Section: Balans ── */}
      <Box display="flex" alignItems="center" gap={0.75} mb={1.5}>
        <Box
          sx={{
            width: 3.5,
            height: 20,
            borderRadius: "4px",
            bgcolor: "#10B981",
          }}
        />
        <Box sx={{ color: "#10B981" }}>
          <TrendingUp size={15} />
        </Box>
        <Typography
          sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155" }}>
          Mening balansim
        </Typography>
      </Box>

      <StatCard
        icon={<TrendingUp size={22} />}
        label="Umumiy balans"
        value={`${balanceDollar.toLocaleString()} $`}
        sub={`${balanceSum.toLocaleString()} UZS`}
        iconBg="#D1FAE5"
        iconColor="#10B981"
        delay={0.15}
      />
    </Box>
  );
}
