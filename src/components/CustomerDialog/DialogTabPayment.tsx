import {
  Box,
  CircularProgress,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { ChevronDown, Package, Wallet, CreditCard, CheckCircle, FileText, AlertCircle } from "lucide-react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  getContract,
  getCustomersDebtor,
} from "../../store/actions/customerActions";
import { ICustomerContract } from "../../types/ICustomer";
import ContractInfo from "../Drawer/ContractInfo";
import { PaymentScheduleNew } from "../PaymentSchedule";

interface IProps {
  customerId: string;
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}

function SectionHeader({ icon, label, count, color }: SectionHeaderProps) {
  return (
    <Box display="flex" alignItems="center" gap={0.75} mb={1.25} mt={2}>
      <Box sx={{ width: 3.5, height: 18, borderRadius: "4px", bgcolor: color }} />
      <Box sx={{ color }}>{icon}</Box>
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", flex: 1 }}>
        {label}
      </Typography>
      <Box
        sx={{
          px: 0.875,
          py: 0.15,
          borderRadius: "20px",
          bgcolor: `${color}15`,
          border: `1px solid ${color}30`,
        }}
      >
        <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color }}>
          {count}
        </Typography>
      </Box>
    </Box>
  );
}

const DialogTabPayment: FC<IProps> = ({ customerId }) => {
  const dispatch = useAppDispatch();
  const { customerContracts, isLoading } = useSelector(
    (state: RootState) => state.customer,
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ICustomerContract | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getContract(customerId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  useEffect(() => {
    if (selectedContract && customerContracts) {
      const allContracts = [
        ...customerContracts.allContracts,
        ...customerContracts.paidContracts,
      ];
      const updated = allContracts.find((c) => c._id === selectedContract._id);
      if (updated) setSelectedContract(updated);
    }
  }, [customerContracts, selectedContract]);

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedContract(null);
    setSelectedMonth(null);
  };

  const renderContracts = (contracts: ICustomerContract[], isPaid = false) =>
    contracts.map((contract) => {
      const totalDebt = (contract.monthlyPayment || 0) * (contract.durationMonths || contract.period || 0);
      const paidPct = totalDebt > 0
        ? Math.round(((contract.totalPaid || 0) / totalDebt) * 100)
        : 0;
      const accentColor = isPaid ? "#10B981" : "#4F46E5";

      return (
        <Accordion
          key={contract._id}
          elevation={0}
          disableGutters
          sx={{
            borderRadius: "14px !important",
            bgcolor: "white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            border: `1.5px solid ${isPaid ? "#A7F3D0" : "#E2E8F0"}`,
            mb: 1.25,
            "&:before": { display: "none" },
            "&.Mui-expanded": {
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              mb: 1.25,
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ChevronDown size={18} color={accentColor} />}
            sx={{
              px: 1.75,
              py: 0,
              minHeight: "auto",
              "& .MuiAccordionSummary-content": { my: 1.25 },
            }}
          >
            {/* Summary header */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Row 1: chips + name */}
              <Box display="flex" alignItems="center" gap={0.75} mb={0.75}>
                {contract.startDate && (
                  <Box
                    sx={{
                      px: 0.75,
                      py: 0.1,
                      borderRadius: "6px",
                      bgcolor: `${accentColor}15`,
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: accentColor }}>
                      {new Date(contract.startDate).getDate().toString().padStart(2, "0")}
                    </Typography>
                  </Box>
                )}
                {(contract as any).customId && (
                  <Box
                    sx={{
                      px: 0.75,
                      py: 0.1,
                      borderRadius: "6px",
                      bgcolor: "#F0F9FF",
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#0EA5E9" }}>
                      {(contract as any).customId}
                    </Typography>
                  </Box>
                )}
                <Box display="flex" alignItems="center" gap={0.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Package size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "#1E293B",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {contract.productName}
                  </Typography>
                </Box>
              </Box>

              {/* Row 2: payment info + progress */}
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.4,
                    px: 0.875,
                    py: 0.25,
                    borderRadius: "8px",
                    bgcolor: `${accentColor}12`,
                  }}
                >
                  <Wallet size={12} color={accentColor} />
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: accentColor }}>
                    {contract.monthlyPayment.toLocaleString()} $
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.4,
                    px: 0.875,
                    py: 0.25,
                    borderRadius: "8px",
                    bgcolor: "#F1F5F9",
                  }}
                >
                  <CreditCard size={12} color="#64748B" />
                  <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#64748B" }}>
                    {contract.paidMonthsCount || 0}/{contract.durationMonths || contract.period || 0} oy
                  </Typography>
                </Box>

                {/* Mini progress bar */}
                <Box sx={{ flex: 1, minWidth: 40 }}>
                  <Box sx={{ height: 4, borderRadius: "4px", bgcolor: "#F1F5F9", overflow: "hidden" }}>
                    <Box
                      sx={{
                        height: "100%",
                        width: `${paidPct}%`,
                        bgcolor: accentColor,
                        borderRadius: "4px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: "0.58rem", color: "#94A3B8", mt: 0.2 }}>
                    {paidPct}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ pt: 0, px: 1.5, pb: 2 }}>
            <PaymentScheduleNew
              contractId={contract._id || ""}
              customerId={customerId}
              period={contract.durationMonths || contract.period || 12}
              monthlyPayment={contract.monthlyPayment}
              initialPayment={contract.initialPayment || 0}
              initialPaymentDueDate={contract.initialPaymentDueDate || contract.startDate}
              startDate={contract.startDate || ""}
              payments={contract.payments || []}
              remainingDebt={contract.remainingDebt || 0}
              totalPaid={contract.totalPaid || 0}
              prepaidBalance={contract.prepaidBalance || 0}
              readOnly={false}
              nextPaymentDate={contract.nextPaymentDate}
              onPaymentSuccess={() => {
                dispatch(getContract(customerId));
                dispatch(getCustomersDebtor());
              }}
            />
          </AccordionDetails>
        </Accordion>
      );
    });

  const hasError = !isLoading && !customerContracts;
  const isEmpty =
    !isLoading &&
    customerContracts?.allContracts?.length === 0 &&
    customerContracts?.paidContracts?.length === 0;

  return (
    <Box sx={{ px: 1.75, pt: 1, pb: 4, maxWidth: 600, mx: "auto" }}>
      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 1.5 }}>
          <CircularProgress size={28} sx={{ color: "#4F46E5" }} />
          <Typography sx={{ fontSize: "0.82rem", color: "#94A3B8" }}>
            Shartnomalar yuklanmoqda...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {hasError && (
        <Box
          sx={{
            p: 2.5,
            borderRadius: "14px",
            bgcolor: "#FEF2F2",
            border: "1.5px solid #FECACA",
            textAlign: "center",
          }}
        >
          <AlertCircle size={32} color="#EF4444" />
          <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "#EF4444", mt: 1 }}>
            Xatolik yuz berdi
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#64748B", mt: 0.5, mb: 1.5 }}>
            Shartnomalarni yuklashda xatolik
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => dispatch(getContract(customerId))}
            sx={{
              borderRadius: "8px",
              bgcolor: "#EF4444",
              fontSize: "0.8rem",
              "&:hover": { bgcolor: "#DC2626" },
            }}
          >
            Qayta urinish
          </Button>
        </Box>
      )}

      {/* Empty */}
      {isEmpty && (
        <Box
          sx={{
            textAlign: "center",
            py: 7,
            bgcolor: "white",
            borderRadius: "16px",
            border: "1px solid #F1F5F9",
          }}
        >
          <FileText size={36} color="#CBD5E1" />
          <Typography sx={{ mt: 1.5, fontSize: "0.875rem", color: "#94A3B8" }}>
            Shartnomalar mavjud emas
          </Typography>
        </Box>
      )}

      {/* Active contracts */}
      {customerContracts?.allContracts && customerContracts.allContracts.length > 0 && (
        <>
          <SectionHeader
            icon={<FileText size={14} />}
            label="Faol shartnomalar"
            count={customerContracts.allContracts.length}
            color="#4F46E5"
          />
          {renderContracts(customerContracts.allContracts, false)}
        </>
      )}

      {/* Paid contracts */}
      {customerContracts?.paidContracts && customerContracts.paidContracts.length > 0 && (
        <>
          <SectionHeader
            icon={<CheckCircle size={14} />}
            label="Bajarilgan shartnomalar"
            count={customerContracts.paidContracts.length}
            color="#10B981"
          />
          {renderContracts(customerContracts.paidContracts, true)}
        </>
      )}

      <ContractInfo
        open={drawerOpen}
        onClose={handleCloseDrawer}
        contract={selectedContract}
        customerId={customerId}
        selectedMonth={selectedMonth}
      />
    </Box>
  );
};

export default DialogTabPayment;
