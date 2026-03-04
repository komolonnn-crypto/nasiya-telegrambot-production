import {
  Box,
  Dialog,
  Typography,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { X, DollarSign, Banknote, FileText, Plus, Edit2 } from "lucide-react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { IExpenses } from "../../types/IExpenses";
import { formatNumber } from "../../utils/format-number";
import {
  addExpenses,
  updateExpenses,
} from "../../store/actions/expensesActions";
import { closeExpensesModal } from "../../store/slices/expensesSlice";

const defaultFormValues: IExpenses = {
  id: "",
  notes: "",
  currencyDetails: {
    dollar: 0,
    sum: 0,
  },
};

const ExpensesDialog = () => {
  const dispatch = useAppDispatch();
  const { expensesModal } = useSelector((state: RootState) => state.expenses);
  const cash = expensesModal.data;
  const isEdit = expensesModal?.type === "edit";

  const [formValues, setFormValues] = useState<IExpenses>(defaultFormValues);

  useEffect(() => {
    if (isEdit && cash) {
      setFormValues({
        id: cash.id,
        currencyDetails: {
          sum: cash?.currencyDetails?.sum || 0,
          dollar: cash?.currencyDetails?.dollar || 0,
        },
        notes: cash?.notes || "",
      });
    } else {
      setFormValues(defaultFormValues);
    }
  }, [cash, expensesModal?.type]);

  const handleClose = useCallback(() => {
    setFormValues(defaultFormValues);
    dispatch(closeExpensesModal());
  }, [dispatch]);

  const handleSubmit = () => {
    if (expensesModal.type === "add") {
      dispatch(addExpenses(formValues));
    } else {
      dispatch(updateExpenses(formValues));
    }
    handleClose();
  };

  const isDisabled =
    (formValues.currencyDetails.dollar > 0 ||
      formValues.currencyDetails.sum > 0) &&
    formValues.notes.trim() !== "";

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      bgcolor: "white",
      fontSize: "0.875rem",
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#4F46E5" },
      "&.Mui-focused fieldset": { borderColor: "#4F46E5", borderWidth: "1.5px" },
    },
    "& .MuiInputLabel-root": { fontSize: "0.875rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#4F46E5" },
  };

  return (
    <Dialog
      open={!!expensesModal?.type}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          m: 2,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #F1F5F9",
          bgcolor: "white",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.25}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "11px",
              bgcolor: "#EEF2FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isEdit ? <Edit2 size={18} color="#4F46E5" /> : <Plus size={18} color="#4F46E5" />}
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>
              {isEdit ? "Xarajatni tahrirlash" : "Yangi xarajat"}
            </Typography>
            <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8" }}>
              {isEdit ? "Ma'lumotlarni yangilang" : "Xarajat ma'lumotlarini kiriting"}
            </Typography>
          </Box>
        </Box>
        <Box
          onClick={handleClose}
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
          }}
        >
          <X size={16} color="#64748B" />
        </Box>
      </Box>

      {/* Form */}
      <Box sx={{ p: 2.5, bgcolor: "#F8FAFC", display: "flex", flexDirection: "column", gap: 1.5 }}>
        <TextField
          label="Dollar miqdori"
          fullWidth
          size="small"
          value={formatNumber(formValues.currencyDetails.dollar)}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setFormValues((prev) => ({
              ...prev,
              currencyDetails: { ...prev.currencyDetails, dollar: Number(value) },
            }));
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DollarSign size={16} color="#4F46E5" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#94A3B8" }}>$</Typography>
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />

        <TextField
          label="So'm miqdori"
          fullWidth
          size="small"
          value={formatNumber(formValues.currencyDetails.sum)}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setFormValues((prev) => ({
              ...prev,
              currencyDetails: { ...prev.currencyDetails, sum: Number(value) },
            }));
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Banknote size={16} color="#10B981" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#94A3B8" }}>UZS</Typography>
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />

        <TextField
          label="Izoh"
          fullWidth
          size="small"
          multiline
          rows={3}
          value={formValues.notes}
          onChange={(e) =>
            setFormValues((prev) => ({ ...prev, notes: e.target.value }))
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.25 }}>
                <FileText size={16} color="#94A3B8" />
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />
      </Box>

      {/* Actions */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          gap: 1.5,
          borderTop: "1px solid #F1F5F9",
          bgcolor: "white",
        }}
      >
        <Button
          onClick={handleClose}
          fullWidth
          variant="outlined"
          sx={{
            borderRadius: "10px",
            py: 1.1,
            fontSize: "0.875rem",
            fontWeight: 600,
            borderColor: "#E2E8F0",
            color: "#64748B",
            "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
          }}
        >
          Bekor qilish
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isDisabled}
          fullWidth
          variant="contained"
          sx={{
            borderRadius: "10px",
            py: 1.1,
            fontSize: "0.875rem",
            fontWeight: 700,
            bgcolor: "#4F46E5",
            "&:hover": { bgcolor: "#4338CA" },
            "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
            boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
          }}
        >
          {isEdit ? "Yangilash" : "Saqlash"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default ExpensesDialog;
