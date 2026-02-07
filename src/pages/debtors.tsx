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
} from "lucide-react";
import ContractDebtorItem from "../components/ContractDebtorItem";
import { IDebtorContract, ICustomer } from "../types/ICustomer";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { getCustomersDebtor } from "../store/actions/customerActions";
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

export default function DebtorsPage({ activeTabIndex, index }: TabPageProps) {
  const dispatch = useAppDispatch();
  const { customersDebtor, isLoading } = useSelector(
    (state: RootState) => state.customer,
  );

  console.log("customersDebtor", customersDebtor);

  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { dashboard } = useSelector((state: RootState) => state.dashboard);
  // const { user } = useSelector((state: RootState) => state.auth);

  const todayDollar = dashboard?.today?.dollar ?? 0;
  const todaySum = dashboard?.today?.sum ?? 0;
  const todayCount = dashboard?.today?.count ?? 0;

  useEffect(() => {
    if (activeTabIndex === index) {
      const dateFilter =
        selectedDate && selectedDate.trim() !== "" ? selectedDate : undefined;
      dispatch(getCustomersDebtor(dateFilter));
    }
  }, [activeTabIndex, index, selectedDate, dispatch]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleShowAll = () => {
    setSelectedDate("");
  };

  // To'lovlarni 3 guruhga ajratish
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

    const today = dayjs();

    const todayPayments: IDebtorContract[] = [];
    const upcomingPayments: IDebtorContract[] = [];
    const overduePayments: IDebtorContract[] = [];

    filtered.forEach((contract) => {
      // nextPaymentDate'dan to'liq sana olish
      const paymentDate =
        contract.nextPaymentDate ? dayjs(contract.nextPaymentDate) : null;

      if (!paymentDate || !paymentDate.isValid()) {
        overduePayments.push(contract);
        return;
      }

      const diffDays = paymentDate.diff(today, "day");

      // 1. BUGUNGI TO'LOVLAR - bugun to'lash kerak
      if (diffDays === 0) {
        todayPayments.push(contract);
      }
      // 2. KUNI KO'CHGAN (15 KUNGA) - keyingi 1-15 kun ichida
      else if (diffDays > 0 && diffDays <= 15) {
        upcomingPayments.push(contract);
      }
      // 3. KECHIKKAN - muddati o'tgan (manfiy kunlar)
      else if (diffDays < 0) {
        overduePayments.push(contract);
      }
      // 15 kundan ko'proq - upcoming'ga
      else {
        upcomingPayments.push(contract);
      }
    });

    // Har bir guruhni sanasi bo'yicha tartiblash
    const sortByDate = (a: IDebtorContract, b: IDebtorContract) => {
      const dateA =
        a.nextPaymentDate ? dayjs(a.nextPaymentDate) : dayjs().add(100, "year");
      const dateB =
        b.nextPaymentDate ? dayjs(b.nextPaymentDate) : dayjs().add(100, "year");
      return dateA.diff(dateB);
    };

    return {
      today: todayPayments.sort(sortByDate),
      upcoming: upcomingPayments.sort(sortByDate),
      overdue: overduePayments.sort(sortByDate),
      total: filtered.length,
    };
  }, [customersDebtor, debouncedSearch]);

  console.log("groupedDebtors", groupedDebtors);

  const handleContractClick = (contract: IDebtorContract) => {
    // Mijozni CustomerDialog'da ochish uchun ICustomer formatiga o'tkazish
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
        px: { xs: 0, sm: 2, md: 3 },
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
                {groupedDebtors.total}
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
              xs: "1fr", // Mobile: 1 ustun
              sm: "1fr", // Small tablet: 1 ustun
              md: "repeat(2, 1fr)", // Medium tablet: 2 ustun
              lg: "repeat(2, 1fr)", // Large desktop: 3 ustun
              xl: "repeat(auto-fit, minmax(300px, 1fr))", // XL: auto-fit
            },
            gap: responsive.spacing.gap,
            mb: 3,
          }}>
          {/* Today's Payments Dollar */}
          <DashboardCardImproved
            title="Bugungi to'lovlar ($)"
            total={`${todayDollar} $`}
            subtitle={`${todayCount} ta to'lov`}
            icon={<DollarSign size={responsive.icon.medium.xs} />}
            color="primary"
          />

          {/* Today's Payments UZS */}
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

      {groupedDebtors.total > 0 ?
        <Box>
          {/* 1. BUGUNGI TO'LOVLAR */}
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
                  <Clock size={24} />
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

          {/* 2. KUNI KO'CHGAN (15 KUNGA) */}
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
                      KUNI KO'CHGAN (15 KUNGA)
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

          {/* 3. KECHIKKAN TO'LOVLAR */}
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
        </Box>
      : <Paper
          sx={{
            p: 3,
            textAlign: "center",
            borderRadius: borderRadius.lg,
            bgcolor: "grey.50",
          }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Qarzdor shartnomalar topilmadi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedDate ?
              `${dayjs(selectedDate).format("DD MMMM YYYY")} sanasiga qadar qarzdor shartnomalar yo'q`
            : "Bugungi kunga qadar qarzdor shartnomalar yo'q"}
          </Typography>
        </Paper>
      }

      <CustomerDialog
        open={!!selectedCustomer}
        customer={selectedCustomer}
        onClose={handleCloseDetails}
      />
    </Box>
  );
}
