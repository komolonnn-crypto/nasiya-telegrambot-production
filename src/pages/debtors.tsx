import { useEffect, useState, useMemo } from "react";
import {
  List,
  Paper,
  TextField,
  Typography,
  InputAdornment,
  Box,
  Stack,
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
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";

import ContractDebtorItem from "../components/ContractDebtorItem";
import { IDebtorContract, ICustomer } from "../types/ICustomer";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { getAllCustomersDebtors } from "../store/actions/customerActions";
import Loader from "../components/Loader/Loader";
import CustomerDialog from "../components/CustomerDialog/CustomerDialog";
import { borderRadius, shadows } from "../theme/colors";
import { useDebounce } from "../hooks/useDebounce";
import dayjs from "../utils/dayjs-config";
import DashboardCardImproved from "../components/DashboardCard/DashboardCardImproved";
import { responsive } from "../theme/responsive";

type TabPageProps = {
  activeTabIndex: number;
  index: number;
};

type FilterType = "all" | "overdue" | "pending";

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
      dispatch(getAllCustomersDebtors(dateFilter)); // ✅ YANGI ACTION ISHLATAMIZ
    }
  }, [activeTabIndex, index, selectedDate, dispatch]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleShowAll = () => {
    setSelectedDate("");
  };

  const groupedDebtors = useMemo(() => {
    // 1. Qidirish filtri
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

    // 2. Guruhlash
    const pendingPayments: IDebtorContract[] = []; // isPending === true (kassa kutilmoqda)
    const todayPayments: IDebtorContract[] = [];   // Bugun to'lash kerak
    const upcomingPayments: IDebtorContract[] = []; // Yaqin (keyingi 15 kun)
    const overduePayments: IDebtorContract[] = [];  // Kechikkan

    filtered.forEach((contract) => {
      // Kassa kutilmoqda to'lovlar — alohida guruh (ustuvor)
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

      if (diffDays < 0) {
        overduePayments.push(contract); // Kechikkan
      } else if (diffDays === 0) {
        todayPayments.push(contract);   // Bugun
      } else {
        upcomingPayments.push(contract); // Keyingi kunlarda
      }
    });

    // 3. Saralash
    const sortByDate = (a: IDebtorContract, b: IDebtorContract) => {
      const dateA =
        a.nextPaymentDate ?
          dayjs(a.nextPaymentDate)
        : dayjs().add(100, "year");
      const dateB =
        b.nextPaymentDate ?
          dayjs(b.nextPaymentDate)
        : dayjs().add(100, "year");
      return dateA.diff(dateB);
    };

    const sortedPending = pendingPayments.sort(sortByDate);
    const sortedToday = todayPayments.sort(sortByDate);
    const sortedUpcoming = upcomingPayments.sort(sortByDate);
    const sortedOverdue = overduePayments.sort((a, b) => {
      // Kechikkanlar — eng ko'p kechikkan birinchi
      return (b.delayDays || 0) - (a.delayDays || 0);
    });

    // 4. Filtr turga qarab displayData
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
        // "Barchasi" — guruhlangan ko'rinishda
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

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Box
      sx={{
        maxWidth: "1400px",
        mx: "auto",
        px: { xs: 1, sm: 2, md: 3 },
        pb: 4,
      }}>
      <Box>
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 1,
            background: "#ef4444",
            borderRadius: borderRadius.lg,
            color: "white",
            boxShadow: shadows.colored("rgba(235, 51, 73, 0.3)"),
          }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <AlertTriangle size={28} />
            <Box>
              <Typography
                variant="caption"
                sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
                Jami qarzdorlar
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {groupedDebtors.allTotal}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
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

      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: borderRadius.lg,
          bgcolor: "white",
          boxShadow: shadows.md,
        }}>
        <Stack spacing={2}>
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}>
              <Typography
                variant="subtitle2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}>
                <Filter size={18} />
                To'lovlar filtri
              </Typography>
            </Box>

            <ToggleButtonGroup
              value={filterType}
              exclusive
              onChange={(_, newFilter) => {
                if (newFilter !== null) {
                  setFilterType(newFilter);
                }
              }}
              fullWidth
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  py: 1,
                  px: { xs: 0.75, sm: 1.5 },
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  fontWeight: 600,
                  textTransform: "none",
                  lineHeight: 1.3,
                  border: "1.5px solid #e0e0e0",
                  flexDirection: "column",
                  gap: 0.25,
                  "&.Mui-selected": {
                    bgcolor: "#667eea",
                    color: "white",
                    borderColor: "#667eea",
                    "&:hover": {
                      bgcolor: "#5568d3",
                    },
                  },
                },
              }}>
              <ToggleButton value="all">
                <CheckCircle size={15} />
                <span>Barchasi</span>
                <Typography component="span" sx={{ fontSize: "0.65rem", fontWeight: 700, opacity: 0.8 }}>
                  ({groupedDebtors.allTotal})
                </Typography>
              </ToggleButton>
              <ToggleButton value="overdue">
                <XCircle size={15} />
                <span>Kechikkan</span>
                <Typography component="span" sx={{ fontSize: "0.65rem", fontWeight: 700, opacity: 0.8 }}>
                  ({groupedDebtors.overdue.length})
                </Typography>
              </ToggleButton>
              <ToggleButton value="pending">
                <Clock size={15} />
                <span>Tasdiq</span>
                <Typography component="span" sx={{ fontSize: "0.65rem", fontWeight: 700, opacity: 0.8 }}>
                  ({groupedDebtors.pending.length})
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}>
              <Typography
                variant="subtitle2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}>
                <Calendar size={18} />
                Sana bo'yicha filter
              </Typography>

              {selectedDate && (
                <Chip
                  label="Tozalash"
                  onClick={handleShowAll}
                  size="small"
                  color="error"
                  variant="filled"
                  deleteIcon={<X size={14} />}
                  onDelete={handleShowAll}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 28,
                    "& .MuiChip-deleteIcon": {
                      fontSize: "1rem",
                    },
                  }}
                />
              )}
            </Box>

            <TextField
              fullWidth
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              size="medium"
              placeholder="Sanani tanlang"
              InputProps={{
                sx: {
                  borderRadius: borderRadius.md,
                  bgcolor: "grey.50",
                  "& fieldset": {
                    border: "1.5px solid #e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#eb3349",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#eb3349",
                    borderWidth: "2px",
                  },
                  "& input": {
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  },
                },
              }}
              helperText={
                selectedDate ?
                  `${dayjs(selectedDate).format("DD MMMM YYYY")} gacha bo'lgan kechikkan to'lovlar`
                : "Bugungi kungacha barcha kechikkan to'lovlar"
              }
              FormHelperTextProps={{
                sx: {
                  fontSize: "0.75rem",
                  color: selectedDate ? "error.main" : "success.main",
                  fontWeight: 500,
                  mt: 0.75,
                },
              }}
            />
          </Box>

          <TextField
            fullWidth
            placeholder="Ism, familiya yoki telefon raqam bo'yicha qidiring..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#eb3349" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: borderRadius.md,
                bgcolor: "grey.50",
                "& fieldset": { border: "none" },
                "&:hover": {
                  bgcolor: "rgba(235, 51, 73, 0.05)",
                },
                "&.Mui-focused": {
                  bgcolor: "rgba(235, 51, 73, 0.05)",
                },
              },
            }}
          />
        </Stack>
      </Paper>

      {/* "Barchasi" - guruhlangan ko'rinish */}
      {groupedDebtors.showGrouped && (
        <Box>
          {/* 1. Tasdiq kutilmoqda */}
          {groupedDebtors.pending.length > 0 && (
            <Box mb={3}>
              <Paper
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: borderRadius.lg,
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "white",
                  boxShadow: shadows.colored("rgba(245, 158, 11, 0.3)"),
                }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Clock size={24} />
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      TASDIQ KUTILMOQDA
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {groupedDebtors.pending.length} ta to'lov — kassa kutmoqda
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              <List disablePadding>
                {groupedDebtors.pending.map((contract) => (
                  <ContractDebtorItem
                    key={contract._id}
                    contract={contract}
                    onClick={handleContractClick}
                  />
                ))}
              </List>
            </Box>
          )}

          {/* 2. Bugungi to'lovlar */}
          {groupedDebtors.today.length > 0 && (
            <Box mb={3}>
              <Paper
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: borderRadius.lg,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  boxShadow: shadows.colored("rgba(102, 126, 234, 0.3)"),
                }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle size={24} />
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      BUGUNGI TO'LOVLAR
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {groupedDebtors.today.length} ta to'lov
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              <List disablePadding>
                {groupedDebtors.today.map((contract) => (
                  <ContractDebtorItem
                    key={contract._id}
                    contract={contract}
                    onClick={handleContractClick}
                  />
                ))}
              </List>
            </Box>
          )}

          {/* 3. Yaqin to'lovlar */}
          {groupedDebtors.upcoming.length > 0 && (
            <Box mb={3}>
              <Paper
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: borderRadius.lg,
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  boxShadow: shadows.colored("rgba(240, 147, 251, 0.3)"),
                }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <TrendingUp size={24} />
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      YAQIN TO'LOVLAR
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {groupedDebtors.upcoming.length} ta to'lov
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              <List disablePadding>
                {groupedDebtors.upcoming.map((contract) => (
                  <ContractDebtorItem
                    key={contract._id}
                    contract={contract}
                    onClick={handleContractClick}
                  />
                ))}
              </List>
            </Box>
          )}

          {/* 4. Kechikkan to'lovlar */}
          {groupedDebtors.overdue.length > 0 && (
            <Box mb={3}>
              <Paper
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: borderRadius.lg,
                  background:
                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                  color: "white",
                  boxShadow: shadows.colored("rgba(250, 112, 154, 0.3)"),
                }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <AlertCircle size={24} />
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      KECHIKKAN TO'LOVLAR
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {groupedDebtors.overdue.length} ta to'lov
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              <List disablePadding>
                {groupedDebtors.overdue.map((contract) => (
                  <ContractDebtorItem
                    key={contract._id}
                    contract={contract}
                    onClick={handleContractClick}
                  />
                ))}
              </List>
            </Box>
          )}

          {/* Bo'sh holat */}
          {groupedDebtors.allTotal === 0 && (
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: borderRadius.lg,
                bgcolor: "grey.50",
              }}>
              <Typography variant="h6" color="text.secondary">
                Qarzdor shartnomalar topilmadi
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* "Kechikkan" yoki "Tasdiq kutilmoqda" — tekis ro'yxat */}
      {!groupedDebtors.showGrouped && (
        groupedDebtors.displayData.length > 0 ?
          <List disablePadding>
            {groupedDebtors.displayData.map((contract) => (
              <ContractDebtorItem
                key={contract._id}
                contract={contract}
                onClick={handleContractClick}
              />
            ))}
          </List>
        : <Paper
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: borderRadius.lg,
              bgcolor: "grey.50",
            }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {filterType === "overdue" ?
                "Kechikkan to'lovlar topilmadi"
              : "Tasdiq kutilmoqda to'lovlar topilmadi"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {filterType === "overdue" ?
                "Barcha to'lovlar o'z vaqtida amalga oshirilmoqda"
              : "Hozircha kassa tasdiqini kutayotgan to'lov yo'q"}
            </Typography>
          </Paper>
      )}

      <CustomerDialog
        open={!!selectedCustomer}
        customer={selectedCustomer}
        onClose={handleCloseDetails}
      />
    </Box>
  );
}
