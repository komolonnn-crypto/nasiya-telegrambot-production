import { useState, FC } from "react";

import { Box } from "@mui/material";
import { ICustomer } from "../../types/ICustomer";
import DialogHeader from "./DialogHeader";
import DialogTab from "./DialogTab";
import DialogTabCustomerInfo from "./DialogTabCustomerInfo";
import DialogTabPayment from "./DialogTabPayment";
import DialogTabNotes from "./DialogTabNotes";
import DialogTabZapas from "./DialogTabZapas";
import DialogTabDebts from "./DialogTabDebts";

const CustomerDetails: FC<{
  customer: ICustomer;
  onClose: () => void;
  isAdmin?: boolean;
}> = ({ customer, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#F8FAFC",
        width: "100vw",
      }}>
      {/* ── Sticky top: header + tabs ── */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          left: 0,
          zIndex: 10,
          bgcolor: "white",
          borderBottom: "1px solid #F1F5F9",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          flexShrink: 0,
        }}>
        <DialogHeader customer={customer} onClose={onClose} />
        <DialogTab activeTab={activeTab} setActiveTab={setActiveTab} />
      </Box>

      {/* ── Scrollable content ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "2px" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#CBD5E1",
            borderRadius: "4px",
          },
        }}>
        {activeTab === 0 && <DialogTabPayment customerId={customer._id} />}
        {activeTab === 1 && <DialogTabCustomerInfo customerId={customer._id} />}
        {activeTab === 2 && <DialogTabNotes customerId={customer._id} />}
        {activeTab === 3 && (
          <DialogTabZapas
            contracts={customer.contracts || []}
            customerId={customer._id}
          />
        )}
        {activeTab === 4 && <DialogTabDebts customerId={customer._id} />}
      </Box>
    </Box>
  );
};

export default CustomerDetails;
