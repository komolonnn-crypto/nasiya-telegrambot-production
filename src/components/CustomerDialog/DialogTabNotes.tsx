import {
  Box,
  CircularProgress,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { addNotes, getNotes } from "../../store/actions/notesActions";
import { INote } from "../../types/Notes";

interface IProps {
  customerId: string;
}

const DialogTabNotes: FC<IProps> = ({ customerId }) => {
  const dispatch = useAppDispatch();
  const { notes, isLoading } = useSelector((state: RootState) => state.notes);
  const { user } = useSelector((state: RootState) => state.auth);
  const [note, setNote] = useState("");

  useEffect(() => {
    dispatch(getNotes(customerId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const handleAddComment = () => {
    if (!note.trim()) return;
    const data: INote = { notes: note, customerId };
    dispatch(addNotes(data));
    setNote("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const getInitials = (name: string) => {
    const parts = (name || "?").trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name || "?").slice(0, 2).toUpperCase();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxWidth: 600,
        mx: "auto",
        width: "100%",
      }}>
      {/* ── Message list ── */}
      <Box sx={{ flex: 1, p: 2, pb: 1 }}>
        {isLoading ?
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={6}>
            <CircularProgress size={28} sx={{ color: "#4F46E5" }} />
          </Box>
        : notes.length === 0 ?
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
            }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "16px",
                bgcolor: "#F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <MessageSquare size={26} color="#CBD5E1" />
            </Box>
            <Typography sx={{ fontSize: "0.875rem", color: "#94A3B8" }}>
              Izohlar mavjud emas
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#CBD5E1" }}>
              Birinchi izohni qo'shing
            </Typography>
          </Box>
        : <Box display="flex" flexDirection="column" gap={1.5}>
            {notes.map((n) => {
              const isMine = n.createBy === user.id;
              return (
                <Box
                  key={n._id}
                  sx={{
                    display: "flex",
                    flexDirection: isMine ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: 1,
                  }}>
                  {/* Avatar */}
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "9px",
                      bgcolor: isMine ? "#EEF2FF" : "#F1F5F9",
                      color: isMine ? "#4F46E5" : "#64748B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>
                    {getInitials(n.fullName)}
                  </Box>

                  {/* Bubble */}
                  <Box
                    sx={{
                      maxWidth: "75%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMine ? "flex-end" : "flex-start",
                      gap: 0.3,
                    }}>
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        color: "#94A3B8",
                        fontWeight: 500,
                        px: 0.5,
                      }}>
                      {n.fullName}
                    </Typography>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius:
                          isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        bgcolor: isMine ? "#4F46E5" : "white",
                        border: isMine ? "none" : "1px solid #F1F5F9",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                      }}>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          color: isMine ? "white" : "#1E293B",
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.5,
                        }}>
                        {n.text}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{ fontSize: "0.6rem", color: "#94A3B8", px: 0.5 }}>
                      {new Date(n.createdAt).toLocaleString("uz-UZ", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        }
      </Box>

      {/* ── Input ── */}
      <Box
        sx={{
          p: 1.5,
          borderTop: "1px solid #F1F5F9",
          bgcolor: "white",
          display: "flex",
          gap: 1,
          alignItems: "flex-end",
        }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Izoh yozing..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          multiline
          maxRows={4}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: "#F8FAFC",
              fontSize: "0.875rem",
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: "#4F46E5" },
              "&.Mui-focused fieldset": {
                borderColor: "#4F46E5",
                borderWidth: "1.5px",
              },
            },
          }}
        />
        <IconButton
          onClick={handleAddComment}
          disabled={!note.trim()}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            bgcolor: note.trim() ? "#4F46E5" : "#F1F5F9",
            color: note.trim() ? "white" : "#CBD5E1",
            flexShrink: 0,
            transition: "all 0.2s",
            "&:hover": { bgcolor: note.trim() ? "#4338CA" : "#F1F5F9" },
            "&:disabled": { bgcolor: "#F1F5F9", color: "#CBD5E1" },
          }}>
          <Send size={16} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default DialogTabNotes;
