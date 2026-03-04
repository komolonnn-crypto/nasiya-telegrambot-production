import { useEffect, useState } from "react";

import {
  TextField,
  Typography,
  InputAdornment,
  Box,
  CircularProgress,
  Stack,
} from "@mui/material";

import CustomerListItem from "../components/CustomerItem";
import { ICustomer } from "../types/ICustomer";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  getCustomersPayment,
  getContract,
} from "../store/actions/customerActions";
import Loader from "../components/Loader/Loader";
import ContractCard from "../components/ContractCard";
import ContractInfo from "../components/Drawer/ContractInfo";
import { ICustomerContract } from "../types/ICustomer";

import {
  Search,
  X,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
} from "lucide-react";

type TabPageProps = {
  activeTabIndex: number;
  index: number;
};

// ─── Section header ───────────────────────────────────────────────────────────
function SectionLabel({
  icon,
  label,
  count,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <Box display="flex" alignItems="center" gap={0.75} mb={1} mt={1.5}>
      <Box sx={{ color }}>{icon}</Box>
      <Typography
        sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", flex: 1 }}>
        {label}
      </Typography>
      <Box
        sx={{
          px: 0.9,
          py: 0.15,
          borderRadius: "20px",
          bgcolor: `${color}15`,
          border: `1px solid ${color}30`,
        }}>
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color }}>
          {count}
        </Typography>
      </Box>
    </Box>
  );
}

export default function CollectedPage({ activeTabIndex, index }: TabPageProps) {
  const dispatch = useAppDispatch();
  const { customersPayment, isLoading, customerContracts } = useSelector(
    (state: RootState) => state.customer,
  );

  const [selectedClient, setSelectedClient] = useState<ICustomer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<ICustomerContract | null>(null);
  const [contractDrawerOpen, setContractDrawerOpen] = useState(false);

  useEffect(() => {
    if (activeTabIndex === index) {
      dispatch(getCustomersPayment());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex, index]);

  const filteredDebtors = customersPayment.filter((customer) => {
    const fullName = customer.fullName.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm)
    );
  });

  const handleClientClick = async (client: ICustomer) => {
    setSelectedClient(client);
    setLoadingContracts(true);
    try {
      await dispatch(getContract(client._id));
    } catch (error) {
      console.error("Collection - Error fetching contracts:", error);
    }
    setLoadingContracts(false);
  };

  const handleCloseDetails = () => setSelectedClient(null);

  if (customersPayment.length === 0 && isLoading) return <Loader />;

  const totalContracts =
    (customerContracts?.allContracts?.length || 0) +
    (customerContracts?.debtorContracts?.length || 0) +
    (customerContracts?.paidContracts?.length || 0);

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 4, maxWidth: 600, mx: "auto" }}>
      {/* ── Header ── */}
      <Box display="flex" alignItems="center" gap={1.5} mb={2} px={0.5}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            bgcolor: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4F46E5",
            flexShrink: 0,
          }}>
          <Users size={20} />
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#1E293B",
              lineHeight: 1.2,
            }}>
            To'lovlar
          </Typography>
          <Typography
            sx={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 500 }}>
            Jami: {customersPayment.length} ta mijoz
          </Typography>
        </Box>
      </Box>

      {/* ── Search ── */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: "14px",
          p: 1.5,
          mb: 2,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}>
        <TextField
          fullWidth
          placeholder="Mijozni ism yoki telefon bilan qidiring..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#94A3B8" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "10px",
              bgcolor: "#F8FAFC",
              fontSize: "0.875rem",
              "& fieldset": { border: "1.5px solid #E2E8F0" },
              "&:hover fieldset": { borderColor: "#4F46E5" },
              "&.Mui-focused fieldset": {
                borderColor: "#4F46E5",
                borderWidth: "1.5px",
              },
            },
          }}
        />
        {searchTerm && (
          <Typography
            sx={{ fontSize: "0.68rem", color: "#64748B", mt: 0.75, px: 0.5 }}>
            {filteredDebtors.length} ta natija
          </Typography>
        )}
      </Box>

      {/* ── Customer list ── */}
      {filteredDebtors.length > 0 ?
        <Box>
          {filteredDebtors.map((customer) => (
            <CustomerListItem
              key={customer._id}
              customer={customer}
              onClick={handleClientClick}
            />
          ))}
        </Box>
      : <Box
          sx={{
            textAlign: "center",
            py: 7,
            bgcolor: "white",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
          }}>
          <Users size={36} color="#CBD5E1" />
          <Typography sx={{ mt: 1.5, fontSize: "0.88rem", color: "#94A3B8" }}>
            {searchTerm ? "Mijoz topilmadi" : "Mijozlar yo'q"}
          </Typography>
        </Box>
      }

      {/* ─── Bottom Sheet: loading ─── */}
      {selectedClient && loadingContracts && (
        <>
          {/* Overlay */}
          <Box
            onClick={handleCloseDetails}
            sx={{
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.4)",
              zIndex: 1299,
            }}
          />
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: "white",
              borderTopLeftRadius: "24px",
              borderTopRightRadius: "24px",
              p: 3,
              zIndex: 1300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}>
            <Box
              sx={{
                width: 40,
                height: 4,
                borderRadius: "4px",
                bgcolor: "#E2E8F0",
                mb: 1,
              }}
            />
            <CircularProgress size={32} sx={{ color: "#4F46E5" }} />
            <Typography sx={{ fontSize: "0.88rem", color: "#64748B" }}>
              Shartnomalar yuklanmoqda...
            </Typography>
          </Box>
        </>
      )}

      {/* ─── Bottom Sheet: contract list ─── */}
      {selectedClient && !loadingContracts && customerContracts && (
        <>
          {/* Overlay */}
          <Box
            onClick={handleCloseDetails}
            sx={{
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.4)",
              zIndex: 1299,
            }}
          />
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: "#F8FAFC",
              borderTopLeftRadius: "24px",
              borderTopRightRadius: "24px",
              maxHeight: "78vh",
              overflow: "auto",
              zIndex: 1300,
              boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
            }}>
            {/* Handle bar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                pt: 1.5,
                pb: 0.5,
              }}>
              <Box
                sx={{
                  width: 40,
                  height: 4,
                  borderRadius: "4px",
                  bgcolor: "#E2E8F0",
                }}
              />
            </Box>

            {/* Header */}
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #E2E8F0",
                bgcolor: "white",
              }}>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "11px",
                    bgcolor: "#EEF2FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                  <FileText size={18} color="#4F46E5" />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "#1E293B",
                    }}>
                    {selectedClient.fullName}
                  </Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8" }}>
                    {totalContracts} ta shartnoma
                  </Typography>
                </Box>
              </Stack>

              <Box
                onClick={handleCloseDetails}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#E2E8F0" },
                }}>
                <X size={16} color="#64748B" />
              </Box>
            </Box>

            {/* Contract sections */}
            <Box sx={{ px: 2, pt: 1, pb: 3 }}>
              {/* No contracts */}
              {totalContracts === 0 && (
                <Box sx={{ textAlign: "center", py: 5 }}>
                  <FileText size={36} color="#CBD5E1" />
                  <Typography
                    sx={{ mt: 1.5, fontSize: "0.88rem", color: "#94A3B8" }}>
                    Bu mijozda shartnomalar topilmadi
                  </Typography>
                </Box>
              )}

              {/* Active contracts */}
              {customerContracts.allContracts?.length > 0 && (
                <Box mb={1}>
                  <SectionLabel
                    icon={<FileText size={15} />}
                    label="Faol shartnomalar"
                    count={customerContracts.allContracts.length}
                    color="#4F46E5"
                  />
                  {customerContracts.allContracts.map((contract) => (
                    <ContractCard
                      key={contract._id}
                      contract={contract}
                      variant="default"
                      onClick={() => {
                        setSelectedContract(contract);
                        setContractDrawerOpen(true);
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Debtor contracts */}
              {customerContracts.debtorContracts?.length > 0 && (
                <Box mb={1}>
                  <SectionLabel
                    icon={<AlertTriangle size={15} />}
                    label="Qarzdorliklar"
                    count={customerContracts.debtorContracts.length}
                    color="#EF4444"
                  />
                  {customerContracts.debtorContracts.map((contract) => (
                    <ContractCard
                      key={contract._id}
                      contract={contract}
                      variant="debtor"
                      onClick={() => {
                        setSelectedContract(contract);
                        setContractDrawerOpen(true);
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Paid contracts */}
              {customerContracts.paidContracts?.length > 0 && (
                <Box>
                  <SectionLabel
                    icon={<CheckCircle size={15} />}
                    label="To'langan shartnomalar"
                    count={customerContracts.paidContracts.length}
                    color="#10B981"
                  />
                  {customerContracts.paidContracts.map((contract) => (
                    <ContractCard
                      key={contract._id}
                      contract={contract}
                      variant="paid"
                      onClick={() => {
                        setSelectedContract(contract);
                        setContractDrawerOpen(true);
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}

      <ContractInfo
        open={contractDrawerOpen}
        onClose={() => setContractDrawerOpen(false)}
        contract={selectedContract}
        customerId={selectedClient?._id}
        readOnly={true}
      />
    </Box>
  );
}
