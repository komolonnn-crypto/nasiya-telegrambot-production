import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  Avatar,
} from "@mui/material";
import { Plus, DollarSign, Banknote, TrendingUp, User, Receipt } from "lucide-react";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { IExpenses } from "../types/IExpenses";
import {
  getActiveExpenses,
  getInActiveExpenses,
} from "../store/actions/expensesActions";
import { openExpensesModal } from "../store/slices/expensesSlice";
import ExpensesTab from "../sestions/Expenses/ExpensesTab";
import ActionExpenses from "../sestions/Expenses/action/action-expenses";
import ExpensesDialog from "../sestions/Expenses/ExpensesDialog";
import ExpensesInfo from "../sestions/Expenses/ExpensesInfo";
import { getDashboard } from "../store/actions/dashboardActions";

type TabPageProps = {
  activeTabIndex: number;
  index: number;
};

export default function ExpensesView({ activeTabIndex, index }: TabPageProps) {
  const dispatch = useAppDispatch();
  const { activeExpenses, inActiveExpenses } = useSelector(
    (state: RootState) => state.expenses,
  );
  const { dashboard } = useSelector((state: RootState) => state.dashboard);
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState<IExpenses | null>(null);

  useEffect(() => {
    if (activeTabIndex === index) {
      dispatch(getDashboard());
    }
  }, [activeTabIndex, index]);

  useEffect(() => {
    if (activeTabIndex === index) {
      dispatch(getActiveExpenses());
      dispatch(getInActiveExpenses());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex, index]);

  const balanceDollar = dashboard?.balance?.dollar ?? 0;
  const balanceSum = dashboard?.balance?.sum ?? 0;

  const totalUSD = activeExpenses?.reduce((acc, exp) => acc + exp.currencyDetails.dollar, 0);
  const totalUZS = activeExpenses?.reduce((acc, exp) => acc + exp.currencyDetails.sum, 0);

  const getDisplayName = (fullName: string) => {
    if (fullName.length > 20) {
      const parts = fullName.split(" ");
      if (parts.length > 1) return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    }
    return fullName;
  };

  const handleOpenDrawer = (expenses: IExpenses) => setDrawerOpen(expenses);
  const handleCloseDrawer = () => setDrawerOpen(null);

  const currentList = activeTab === 0 ? activeExpenses : inActiveExpenses;

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 4, maxWidth: 600, mx: "auto" }}>

      {/* ── User greeting ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2,
          p: 1.75,
          bgcolor: "white",
          borderRadius: "16px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Avatar
          sx={{
            width: 44,
            height: 44,
            bgcolor: "#4F46E5",
            borderRadius: "12px",
          }}
        >
          <User size={22} />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#1E293B",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {getDisplayName(`${user?.firstname} ${user?.lastname}`.trim() || "Foydalanuvchi")}
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 500 }}>
            Xush kelibsiz!
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={15} />}
          onClick={() => dispatch(openExpensesModal({ type: "add", data: undefined }))}
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.75rem",
            px: 1.5,
            py: 0.75,
            bgcolor: "#10B981",
            boxShadow: "none",
            "&:hover": { bgcolor: "#059669", boxShadow: "none" },
          }}
        >
          Qo'shish
        </Button>
      </Box>

      {/* ── Balance + Stats ── */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        {/* Main balance */}
        <Box
          sx={{
            flex: 2,
            p: 1.75,
            bgcolor: "#4F46E5",
            borderRadius: "16px",
            color: "white",
            boxShadow: "0 4px 16px rgba(79,70,229,0.25)",
          }}
        >
          <Box display="flex" alignItems="center" gap={0.75} mb={0.75}>
            <TrendingUp size={16} style={{ opacity: 0.85 }} />
            <Typography sx={{ fontSize: "0.7rem", opacity: 0.85, fontWeight: 500 }}>
              Mening balansim
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, lineHeight: 1.1 }}>
            {balanceDollar.toLocaleString()} $
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", opacity: 0.75, mt: 0.25 }}>
            {balanceSum.toLocaleString()} so'm
          </Typography>
        </Box>

        {/* USD & UZS totals */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          <Box
            sx={{
              flex: 1,
              p: 1.25,
              bgcolor: "#EEF2FF",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              gap: 0.25,
            }}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <DollarSign size={13} color="#4F46E5" />
              <Typography sx={{ fontSize: "0.62rem", color: "#4F46E5", fontWeight: 600 }}>
                Harajat $
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#1E293B" }}>
              {totalUSD?.toLocaleString() || 0}$
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 1.25,
              bgcolor: "#E0F2FE",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              gap: 0.25,
            }}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <Banknote size={13} color="#0EA5E9" />
              <Typography sx={{ fontSize: "0.62rem", color: "#0EA5E9", fontWeight: 600 }}>
                Harajat so'm
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#1E293B" }}>
              {(totalUZS || 0) >= 1_000_000
                ? `${((totalUZS || 0) / 1_000_000).toFixed(1)}M`
                : (totalUZS || 0).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Tabs ── */}
      <ExpensesTab activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── Expense list ── */}
      <Box sx={{ mt: 1 }}>
        {currentList && currentList.length > 0 ? (
          <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {currentList.map((expenses) => (
              <ListItem
                key={expenses.id}
                onClick={() => handleOpenDrawer(expenses)}
                sx={{
                  cursor: "pointer",
                  bgcolor: "white",
                  borderRadius: "14px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  px: 2,
                  py: 1.25,
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    transform: "translateY(-1px)",
                  },
                  ...(activeTab === 1 && { opacity: 0.7 }),
                }}
                secondaryAction={
                  activeTab === 0 ? <ActionExpenses expenses={expenses} /> : undefined
                }
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    bgcolor: "#EEF2FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 1.5,
                    flexShrink: 0,
                  }}
                >
                  <Receipt size={18} color="#4F46E5" />
                </Box>
                <ListItemText
                  primary={
                    <Stack direction="row" gap={1.5} alignItems="center">
                      {expenses.currencyDetails.dollar > 0 && (
                        <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#4F46E5" }}>
                          {expenses.currencyDetails.dollar.toLocaleString()} $
                        </Typography>
                      )}
                      {expenses.currencyDetails.sum > 0 && (
                        <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0EA5E9" }}>
                          {expenses.currencyDetails.sum.toLocaleString()} so'm
                        </Typography>
                      )}
                    </Stack>
                  }
                  secondary={
                    expenses.notes ? (
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#94A3B8",
                          mt: 0.25,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "180px",
                        }}
                      >
                        {expenses.notes}
                      </Typography>
                    ) : null
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              px: 3,
              bgcolor: "white",
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "#F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1.5,
              }}
            >
              <Receipt size={26} color="#CBD5E1" />
            </Box>
            <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "#475569", mb: 0.5 }}>
              Harajatlar yo'q
            </Typography>
            <Typography sx={{ fontSize: "0.76rem", color: "#94A3B8" }}>
              {activeTab === 0 ? "Faol harajat qo'shing" : "Arxivlangan harajatlar yo'q"}
            </Typography>
          </Box>
        )}
      </Box>

      <ExpensesDialog />
      <ExpensesInfo open={drawerOpen} onClose={handleCloseDrawer} />
    </Box>
  );
}
