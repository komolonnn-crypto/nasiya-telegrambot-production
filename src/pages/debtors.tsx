import { useEffect, useState, useMemo } from "react";

import {
  TextField,
  Typography,
  InputAdornment,
  Box,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

import {
  Search,
  AlertTriangle,
  Calendar,
  X,
  Clock,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Banknote,
  CheckCircle,
  XCircle,
  List,
} from "lucide-react";

import ContractDebtorItem from "../components/ContractDebtorItem";
import { IDebtorContract, ICustomer } from "../types/ICustomer";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { getAllCustomersDebtors } from "../store/actions/customerActions";
import Loader from "../components/Loader/Loader";
import CustomerDialog from "../components/CustomerDialog/CustomerDialog";
import { useDebounce } from "../hooks/useDebounce";
import dayjs from "../utils/dayjs-config";

type TabPageProps = {
  activeTabIndex: number;
  index: number;
};

type FilterType = "all" | "overdue" | "pending";

// ─── Mini stat card ───────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        py: 1.25,
        px: 0.75,
        bgcolor: "white",
        borderRadius: "14px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "20px",
          bgcolor: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
        }}>
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: "0.65rem",
          color: "#94A3B8",
          fontWeight: 500,
          textAlign: "center",
          lineHeight: 1.5,
        }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.85rem",
          fontWeight: 800,
          color: "#1E293B",
          textAlign: "center",
          lineHeight: 1.1,
        }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  label,
  count,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  accentColor: string;
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      sx={{ mb: 1.5, mt: 2.5, px: 0.5 }}>
      <Box
        sx={{
          width: 3.5,
          height: 22,
          borderRadius: "4px",
          bgcolor: accentColor,
          flexShrink: 0,
        }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          color: accentColor,
        }}>
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: "0.82rem",
          fontWeight: 700,
          color: "#334155",
          flex: 1,
          letterSpacing: "0.01em",
        }}>
        {label}
      </Typography>
      <Box
        sx={{
          px: 1,
          py: 0.2,
          borderRadius: "20px",
          bgcolor: `${accentColor}15`,
          border: `1px solid ${accentColor}30`,
        }}>
        <Typography
          sx={{ fontSize: "0.72rem", fontWeight: 700, color: accentColor }}>
          {count}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DebtorsPage({ activeTabIndex, index }: TabPageProps) {
  const dispatch = useAppDispatch();
  const { customersDebtor, isLoading } = useSelector(
    (state: RootState) => state.customer,
  );

  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { dashboard } = useSelector((state: RootState) => state.dashboard);

  const todayDollar = dashboard?.today?.dollar ?? 0;
  const todaySum = dashboard?.today?.sum ?? 0;
  const todayCount = dashboard?.today?.count ?? 0;

  useEffect(() => {
    if (activeTabIndex === index) {
      const dateFilter =
        selectedDate && selectedDate.trim() !== "" ? selectedDate : undefined;
      dispatch(getAllCustomersDebtors(dateFilter));
    }
  }, [activeTabIndex, index, selectedDate, dispatch]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleShowAll = () => {
    setSelectedDate("");
  };

  const groupedDebtors = useMemo(() => {
    const filtered = customersDebtor.filter((contract) => {
      const fullName = contract.fullName.toLowerCase();
      const productName = contract.productName?.toLowerCase() || "";
      return (
        fullName.includes(debouncedSearch.toLowerCase()) ||
        contract.phoneNumber.includes(debouncedSearch) ||
        productName.includes(debouncedSearch.toLowerCase())
      );
    });

    const today = dayjs().startOf("day");

    const pendingPayments: IDebtorContract[] = [];
    const todayPayments: IDebtorContract[] = [];
    const upcomingPayments: IDebtorContract[] = [];
    const overduePayments: IDebtorContract[] = [];

    filtered.forEach((contract) => {
      if (contract.isPending) {
        pendingPayments.push(contract);
        return;
      }

      const paymentDate =
        contract.nextPaymentDate ?
          dayjs(contract.nextPaymentDate).startOf("day")
        : null;

      if (!paymentDate || !paymentDate.isValid()) {
        overduePayments.push(contract);
        return;
      }

      const diffDays = paymentDate.diff(today, "day");

      if (diffDays < 0) overduePayments.push(contract);
      else if (diffDays === 0) todayPayments.push(contract);
      else upcomingPayments.push(contract);
    });

    const sortByDate = (a: IDebtorContract, b: IDebtorContract) => {
      const dateA =
        a.nextPaymentDate ? dayjs(a.nextPaymentDate) : dayjs().add(100, "year");
      const dateB =
        b.nextPaymentDate ? dayjs(b.nextPaymentDate) : dayjs().add(100, "year");
      return dateA.diff(dateB);
    };

    const sortedPending = pendingPayments.sort(sortByDate);
    const sortedToday = todayPayments.sort(sortByDate);
    const sortedUpcoming = upcomingPayments.sort(sortByDate);
    const sortedOverdue = overduePayments.sort(
      (a, b) => (b.delayDays || 0) - (a.delayDays || 0),
    );

    let displayData: IDebtorContract[] = [];

    switch (filterType) {
      case "overdue":
        displayData = sortedOverdue;
        break;
      case "pending":
        displayData = sortedPending;
        break;
      case "all":
      default:
        break;
    }

    return {
      pending: sortedPending,
      today: sortedToday,
      upcoming: sortedUpcoming,
      overdue: sortedOverdue,
      allTotal: filtered.length,
      displayData,
      showGrouped: filterType === "all",
    };
  }, [customersDebtor, debouncedSearch, filterType]);

  const handleContractClick = (contract: IDebtorContract) => {
    const customer: ICustomer = {
      _id: contract.customerId,
      fullName: contract.fullName,
      phoneNumber: contract.phoneNumber,
    };
    setSelectedCustomer(customer);
  };

  const handleCloseDetails = () => {
    setSelectedCustomer(null);
  };

  if (isLoading) return <Loader />;

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 4, maxWidth: 600, mx: "auto" }}>
      {/* ── Stat cards ── */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Jami qarzdor"
          value={groupedDebtors.allTotal}
          color="#EF4444"
        />
        <StatCard
          icon={<DollarSign size={20} />}
          label={`Bugun (${todayCount} ta)`}
          value={`${todayDollar}$`}
          color="#4F46E5"
        />
        <StatCard
          icon={<Banknote size={20} />}
          label="Bugun UZS"
          value={todaySum > 0 ? `${(todaySum / 1_000_000).toFixed(1)}M` : "0"}
          color="#0EA5E9"
        />
      </Box>

      {/* ── Filters ── */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: "16px",
          p: 1.75,
          mb: 2,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}>
        {/* Type filter */}
        <ToggleButtonGroup
          value={filterType}
          exclusive
          onChange={(_, v) => {
            if (v !== null) setFilterType(v);
          }}
          fullWidth
          size="small"
          sx={{
            mb: 1.5,
            bgcolor: "#F1F5F9",
            borderRadius: "10px",
            p: 0.4,
            gap: 0.4,
            "& .MuiToggleButton-root": {
              flex: 1,
              py: 0.75,
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "none",
              border: "none !important",
              borderRadius: "8px !important",
              color: "#64748B",
              transition: "all 0.2s",
              gap: 0.5,
              "&.Mui-selected": {
                bgcolor: "white",
                color: "#4F46E5",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              },
            },
          }}>
          <ToggleButton value="all">
            <List size={14} />
            Barchasi ({groupedDebtors.allTotal})
          </ToggleButton>
          <ToggleButton value="overdue">
            <XCircle size={14} />
            Kechikkan ({groupedDebtors.overdue.length})
          </ToggleButton>
          <ToggleButton value="pending">
            <Clock size={14} />
            Tasdiq ({groupedDebtors.pending.length})
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Date filter */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
          <Calendar size={15} color="#64748B" />
          <Typography
            sx={{
              fontSize: "0.76rem",
              fontWeight: 600,
              color: "#475569",
              flex: 1,
            }}>
            Sana bo'yicha filter
          </Typography>
          {selectedDate && (
            <Chip
              label="Tozalash"
              onClick={handleShowAll}
              size="small"
              onDelete={handleShowAll}
              deleteIcon={<X size={12} />}
              sx={{
                height: 22,
                fontSize: "0.65rem",
                fontWeight: 600,
                bgcolor: "#FEE2E2",
                color: "#DC2626",
                border: "none",
                "& .MuiChip-deleteIcon": { color: "#DC2626" },
              }}
            />
          )}
        </Box>
        <TextField
          fullWidth
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          size="small"
          InputProps={{
            sx: {
              borderRadius: "10px",
              bgcolor: "#F8FAFC",
              fontSize: "0.85rem",
              "& fieldset": { border: "1.5px solid #E2E8F0" },
              "&:hover fieldset": { borderColor: "#4F46E5" },
              "&.Mui-focused fieldset": {
                borderColor: "#4F46E5",
                borderWidth: "1.5px",
              },
            },
          }}
          helperText={
            selectedDate ?
              `${dayjs(selectedDate).format("DD MMMM YYYY")} gacha kechikkanlar`
            : "Bugungi kungacha barcha kechikkanlar"
          }
          FormHelperTextProps={{
            sx: {
              fontSize: "0.68rem",
              mt: 0.5,
              color: selectedDate ? "#EF4444" : "#10B981",
              fontWeight: 500,
            },
          }}
        />

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Ism, telefon yoki mahsulot..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ mt: 1.25 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#94A3B8" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "10px",
              bgcolor: "#F8FAFC",
              fontSize: "0.85rem",
              "& fieldset": { border: "1.5px solid #E2E8F0" },
              "&:hover fieldset": { borderColor: "#4F46E5" },
              "&.Mui-focused fieldset": {
                borderColor: "#4F46E5",
                borderWidth: "1.5px",
              },
            },
          }}
        />
      </Box>

      {/* ── Grouped view (all) ── */}
      {groupedDebtors.showGrouped && (
        <Box>
          {groupedDebtors.pending.length > 0 && (
            <Box>
              <SectionHeader
                icon={<Clock size={15} />}
                label="TASDIQ KUTILMOQDA"
                count={groupedDebtors.pending.length}
                accentColor="#F59E0B"
              />
              {groupedDebtors.pending.map((contract) => (
                <ContractDebtorItem
                  key={contract._id}
                  contract={contract}
                  onClick={handleContractClick}
                />
              ))}
            </Box>
          )}

          {groupedDebtors.today.length > 0 && (
            <Box>
              <SectionHeader
                icon={<CheckCircle size={15} />}
                label="BUGUNGI TO'LOVLAR"
                count={groupedDebtors.today.length}
                accentColor="#4F46E5"
              />
              {groupedDebtors.today.map((contract) => (
                <ContractDebtorItem
                  key={contract._id}
                  contract={contract}
                  onClick={handleContractClick}
                />
              ))}
            </Box>
          )}

          {groupedDebtors.upcoming.length > 0 && (
            <Box>
              <SectionHeader
                icon={<TrendingUp size={15} />}
                label="YAQIN TO'LOVLAR"
                count={groupedDebtors.upcoming.length}
                accentColor="#8B5CF6"
              />
              {groupedDebtors.upcoming.map((contract) => (
                <ContractDebtorItem
                  key={contract._id}
                  contract={contract}
                  onClick={handleContractClick}
                />
              ))}
            </Box>
          )}

          {groupedDebtors.overdue.length > 0 && (
            <Box>
              <SectionHeader
                icon={<AlertCircle size={15} />}
                label="KECHIKKAN TO'LOVLAR"
                count={groupedDebtors.overdue.length}
                accentColor="#EF4444"
              />
              {groupedDebtors.overdue.map((contract) => (
                <ContractDebtorItem
                  key={contract._id}
                  contract={contract}
                  onClick={handleContractClick}
                />
              ))}
            </Box>
          )}

          {groupedDebtors.allTotal === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                px: 3,
                bgcolor: "white",
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
              }}>
              <AlertTriangle size={40} color="#CBD5E1" />
              <Typography
                sx={{
                  mt: 1.5,
                  fontSize: "0.9rem",
                  color: "#94A3B8",
                  fontWeight: 500,
                }}>
                Qarzdor shartnomalar topilmadi
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* ── Filtered flat list ── */}
      {!groupedDebtors.showGrouped &&
        (groupedDebtors.displayData.length > 0 ?
          <Box>
            {groupedDebtors.displayData.map((contract) => (
              <ContractDebtorItem
                key={contract._id}
                contract={contract}
                onClick={handleContractClick}
              />
            ))}
          </Box>
        : <Box
            sx={{
              textAlign: "center",
              py: 6,
              px: 3,
              bgcolor: "white",
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
            }}>
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
              }}>
              {filterType === "overdue" ?
                <XCircle size={28} color="#CBD5E1" />
              : <Clock size={28} color="#CBD5E1" />}
            </Box>
            <Typography
              sx={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#475569",
                mb: 0.5,
              }}>
              {filterType === "overdue" ?
                "Kechikkan to'lovlar yo'q"
              : "Tasdiq kutilmoqda to'lov yo'q"}
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>
              {filterType === "overdue" ?
                "Barcha to'lovlar o'z vaqtida"
              : "Hozircha kassa tasdiqini kutayotgan to'lov yo'q"}
            </Typography>
          </Box>)}

      <CustomerDialog
        open={!!selectedCustomer}
        customer={selectedCustomer}
        onClose={handleCloseDetails}
      />
    </Box>
  );
}
