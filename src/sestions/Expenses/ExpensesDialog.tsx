import { useCallback, useEffect, useState } from "react";

import {
  Box,
  Dialog,
  Typography,
  TextField,
  Button,
  InputAdornment,
  DialogActions,
} from "@mui/material";

import { CreditCard } from "lucide-react";

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

  // Shared outlined field style — rasmdagidek
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: "white",
      fontSize: "1rem",
      "& fieldset": { borderColor: "#E2E8F0", borderWidth: "1.5px" },
      "&:hover fieldset": { borderColor: "#CBD5E1" },
      "&.Mui-focused fieldset": {
        borderColor: "#2563EB",
        borderWidth: "1.5px",
      },
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.9rem",
      color: "#94A3B8",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#2563EB" },
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
          m: 2,
          bgcolor: "white",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
        },
      }}>
      {/* ── Header — xuddi rasmdagidek ── */}
      <Box sx={{ px: 3, pt: 3, pb: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <CreditCard size={26} color="#1E293B" strokeWidth={2} />
          <Typography
            sx={{
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "#1E293B",
              letterSpacing: "-0.01em",
            }}>
            {isEdit ? "Xarajatni tahrirlash" : "To'lov ma'lumotlari"}
          </Typography>
        </Box>
      </Box>

      {/* ── Form ── */}
      <Box
        sx={{
          px: 3,
          pb: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "white",
        }}>
        {/* Dollar field */}
        <TextField
          label="Miqdor Dollar"
          fullWidth
          value={formatNumber(formValues.currencyDetails.dollar)}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setFormValues((prev) => ({
              ...prev,
              currencyDetails: {
                ...prev.currencyDetails,
                dollar: Number(value),
              },
            }));
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {/* Rasmdagidek kulrang doira badge */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: "#F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#64748B",
                    }}>
                    $
                  </Typography>
                </Box>
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />

        {/* So'm field */}
        <TextField
          label={`Miqdor (${formatNumber(formValues.currencyDetails.sum)})`}
          fullWidth
          value={formatNumber(formValues.currencyDetails.sum)}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setFormValues((prev) => ({
              ...prev,
              currencyDetails: {
                ...prev.currencyDetails,
                sum: Number(value),
              },
            }));
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "20px",
                    bgcolor: "#F1F5F9",
                    display: "flex",
                    alignItems: "center",
                  }}>
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#64748B",
                    }}>
                    so'm
                  </Typography>
                </Box>
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />

        <TextField
          placeholder="Izoh"
          fullWidth
          multiline
          rows={4}
          value={formValues.notes}
          onChange={(e) =>
            setFormValues((prev) => ({ ...prev, notes: e.target.value }))
          }
          sx={{
            ...fieldSx,
            "& .MuiOutlinedInput-root": {
              ...fieldSx["& .MuiOutlinedInput-root"],
              alignItems: "flex-start",
              pt: 1.5,
            },
            "& ::placeholder": {
              color: "#94A3B8",
              fontSize: "0.95rem",
            },
          }}
        />
      </Box>

      <DialogActions>
        <Button onClick={handleClose} variant="text">
          Bekor qilish
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isDisabled}>
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpensesDialog;
