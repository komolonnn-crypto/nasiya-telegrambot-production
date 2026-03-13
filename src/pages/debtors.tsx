import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

import {
  TextField,
  Typography,
  InputAdornment,
  Box,
  Chip,
} from "@mui/material";

import {
  Search,
  AlertTriangle,
  Calendar,
  X,
  Clock,
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
import DashboardCardImproved from "../components/DashboardCard/DashboardCardImproved";
import { responsive } from "../theme/responsive";
import { borderRadius, shadows } from "../theme/colors";

type TabPageProps = {
  activeTabIndex: number;
  index: number;
};

type FilterType = "all" | "overdue" | "pending";

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
  const [selectedContractId, setSelectedContractId] = useState<string>("");
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

  const handleContractClick = (contract: IDebtorContract) => {
    setSelectedCustomer({
      _id: contract.customerId,
      fullName: contract.fullName,
      phoneNumber: contract.phoneNumber,
    });
    setSelectedContractId(contract._id);
  };

  const handleCloseDialog = () => {
    setSelectedCustomer(null);
    setSelectedContractId("");
  };

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
      overdue: sortedOverdue,
      allTotal: filtered.length,
      displayData,
      showGrouped: filterType === "all",
    };
  }, [customersDebtor, debouncedSearch, filterType]);

  if (isLoading) return <Loader />;

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 4, maxWidth: 600, mx: "auto" }}>
      <Box>
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 1,
            background: "#ef4444",
            borderRadius: borderRadius.xl,
            color: "white",
            boxShadow: shadows.colored("rgba(235, 51, 73, 0.3)"),
          }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <AlertTriangle size={30} />
            <Box>
              <Typography
                variant="caption"
                sx={{ opacity: 2, fontSize: "0.75rem" }}>
                Jami qarzdorlar
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {groupedDebtors.allTotal}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ opacity: 2 }}>
            Kechikkan to'lovlar
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(2, 1fr)",
            },
            gap: responsive.spacing.gap,
            mb: 3,
          }}>
          <DashboardCardImproved
            title="Bugungi to'lovlar ($)"
            total={`${todayDollar} $`}
            subtitle={`${todayCount} ta to'lov`}
            icon={<DollarSign size={responsive.icon.medium.xs} />}
            color="primary"
          />

          <DashboardCardImproved
            title="Bugungi to'lovlar (So'm)"
            total={`${todaySum.toLocaleString()} UZS`}
            subtitle={`${todayCount} ta to'lov`}
            icon={<Banknote size={responsive.icon.medium.xs} />}
            color="info"
          />
        </Box>
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
        {/* ── Type filter — rasmdagidek ko'k pill tabs ── */}
        <Box
          sx={{
            display: "flex",
            gap: "4px",
            mb: 1.5,
            bgcolor: "#F1F5F9",
            borderRadius: "12px",
            p: "4px",
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}>
          {(
            [
              {
                value: "all",
                icon: <List size={14} />,
                label: `Barchasi (${groupedDebtors.allTotal})`,
              },
              {
                value: "overdue",
                icon: <XCircle size={14} />,
                label: `Kechikkan (${groupedDebtors.overdue.length})`,
              },
              {
                value: "pending",
                icon: <Clock size={14} />,
                label: `Tasdiq (${groupedDebtors.pending.length})`,
              },
            ] as { value: FilterType; icon: React.ReactNode; label: string }[]
          ).map((tab) => {
            const isActive = filterType === tab.value;
            return (
              <Box
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                sx={{
                  flex: 1,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  py: "7px",
                  px: "6px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  flexShrink: 0,
                  "&:active": { transform: "scale(0.94)" },
                  transition: "transform 0.1s ease",
                }}>
                {/* Siljuvchi ko'k pill — framer-motion layoutId */}
                {isActive && (
                  <motion.div
                    layoutId="filter-pill"
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
                  {tab.icon}
                </Box>
                {/* Label */}
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: isActive ? 700 : 600,
                    position: "relative",
                    zIndex: 1,
                    color: isActive ? "white" : "#64748B",
                    whiteSpace: "nowrap",
                    transition: "color 0.15s ease",
                    lineHeight: 1,
                  }}>
                  {tab.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

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
                <ContractDebtorItem key={contract._id} contract={contract} />
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
                onClick={
                  filterType === "overdue" ? handleContractClick : undefined
                }
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
        onClose={handleCloseDialog}
        initialContractId={selectedContractId}
      />
    </Box>
  );
}
