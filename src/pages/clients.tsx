import { useEffect, useState, useMemo } from "react";

import { TextField, Typography, InputAdornment, Box } from "@mui/material";
import { Search, Users } from "lucide-react";
import CustomerListItem from "../components/CustomerItem";
import { ICustomer } from "../types/ICustomer";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { getCustomers } from "../store/actions/customerActions";
import Loader from "../components/Loader/Loader";
import CustomerDialog from "../components/CustomerDialog/CustomerDialog";
import { useDebounce } from "../hooks/useDebounce";

type TabPageProps = {
  activeTabIndex: number;
  index: number;
};

export default function AllClientsPage({
  activeTabIndex,
  index,
}: TabPageProps) {
  const dispatch = useAppDispatch();
  const { customers, isLoading } = useSelector(
    (state: RootState) => state.customer,
  );

  const [selectedClient, setSelectedClient] = useState<ICustomer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (activeTabIndex === index) {
      dispatch(getCustomers());
    }
  }, [activeTabIndex, index]);

  const filteredClients = useMemo(() => {
    return customers.filter((customer) => {
      const fullName = customer.fullName.toLowerCase();
      return (
        fullName.includes(debouncedSearch.toLowerCase()) ||
        customer.phoneNumber.includes(debouncedSearch)
      );
    });
  }, [customers, debouncedSearch]);

  const handleClientClick = (client: ICustomer) => setSelectedClient(client);
  const handleCloseDetails = () => setSelectedClient(null);

  if (customers.length === 0 && isLoading) return <Loader />;

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 4, maxWidth: 600, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2,
          px: 0.5,
        }}>
        <Box
          sx={{
            width: 45,
            height: 45,
            borderRadius: "20px",
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
              lineHeight: 1.5,
            }}>
            Mijozlar
          </Typography>
          <Typography
            sx={{ fontSize: "0.80rem", color: "black", fontWeight: 500 }}>
            Jami: {customers.length} ta mijoz
          </Typography>
        </Box>
      </Box>

      {/* Search */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: "14px",
          p: 1.5,
          mb: 2,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          border: "1px solid rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
        <TextField
          fullWidth
          placeholder={`${customers.length} ta mijoz ichidan qidiring...`}
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
            {filteredClients.length} ta natija topildi
          </Typography>
        )}
      </Box>

      {/* List */}
      {filteredClients.length > 0 ?
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {filteredClients.map((customer) => (
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
            px: 3,
            bgcolor: "white",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
          }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              bgcolor: "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}>
            <Users size={28} color="#CBD5E1" />
          </Box>
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#475569",
              mb: 0.5,
            }}>
            {searchTerm ? "Mijoz topilmadi" : "Mijozlar yo'q"}
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>
            {searchTerm ?
              `"${searchTerm}" bo'yicha hech narsa topilmadi`
            : "Hali birorta mijoz qo'shilmagan"}
          </Typography>
        </Box>
      }

      <CustomerDialog
        open={!!selectedClient}
        customer={selectedClient}
        onClose={handleCloseDetails}
      />
    </Box>
  );
}
