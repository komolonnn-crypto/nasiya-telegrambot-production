import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Package,
} from "lucide-react";
import { useAlert } from "../components/AlertSystem";
import { RootState } from "../store";
import { useAppDispatch } from "../hooks/useAppDispatch";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAllNotifications,
} from "../store/actions/notificationActions";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";

interface TabPageProps {
  activeTabIndex: number;
  index: number;
}

export default function NotificationsPage({ activeTabIndex, index }: TabPageProps) {
  const dispatch = useAppDispatch();
  const { showConfirm, showError, showSuccess } = useAlert();
  const { notifications, unreadCount, isLoading } = useSelector(
    (state: RootState) => state.notification,
  );

  useEffect(() => {
    if (activeTabIndex === index) {
      dispatch(getNotifications());
    }
  }, [activeTabIndex, index, dispatch]);

  const handleRefresh = () => dispatch(getNotifications());
  const handleMarkAllAsRead = () => dispatch(markAllNotificationsAsRead());

  const handleDeleteAll = async () => {
    showConfirm({
      type: "delete",
      title: "Bildirishnomalarni o'chirish",
      message: "Barcha bildirishnomalarni o'chirishni xohlaysizmi? Bu amalni bekor qilib bo'lmaydi.",
      confirmText: "O'chirish",
      cancelText: "Bekor qilish",
      onConfirm: async () => {
        try {
          await dispatch(deleteAllNotifications());
          showSuccess("Barcha bildirishnomalar o'chirildi", "Muvaffaqiyat");
        } catch {
          showError("Bildirishnomalarni o'chirishda xatolik yuz berdi", "Xatolik");
        }
      },
    });
  };

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) dispatch(markNotificationAsRead(notificationId));
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#F8FAFC",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: "white",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
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
                color: "#4F46E5",
              }}
            >
              <Bell size={19} />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E293B" }}>
                  Bildirishnomalar
                </Typography>
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      px: 0.9,
                      py: 0.1,
                      borderRadius: "20px",
                      bgcolor: "#EF4444",
                      minWidth: 20,
                      textAlign: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "white" }}>
                      {unreadCount}
                    </Typography>
                  </Box>
                )}
              </Stack>
              <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: 500 }}>
                {notifications.length} ta bildirishnoma
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={handleRefresh}
            disabled={isLoading}
            size="small"
            sx={{
              color: "#64748B",
              bgcolor: "#F1F5F9",
              borderRadius: "10px",
              width: 36,
              height: 36,
              "&:hover": { bgcolor: "#E2E8F0" },
            }}
          >
            <RefreshCw size={17} />
          </IconButton>
        </Stack>

        {notifications.length > 0 && (
          <Stack direction="row" spacing={1} mt={1.25}>
            {unreadCount > 0 && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<CheckCheck size={14} />}
                onClick={handleMarkAllAsRead}
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  borderRadius: "9px",
                  borderColor: "#E2E8F0",
                  color: "#475569",
                  py: 0.5,
                  px: 1.25,
                  "&:hover": { borderColor: "#4F46E5", color: "#4F46E5", bgcolor: "#EEF2FF" },
                }}
              >
                Hammasini o'qilgan
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={14} />}
              onClick={handleDeleteAll}
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                borderRadius: "9px",
                borderColor: "#FECACA",
                color: "#EF4444",
                py: 0.5,
                px: 1.25,
                "&:hover": { borderColor: "#EF4444", bgcolor: "#FEF2F2" },
              }}
            >
              Hammasini o'chirish
            </Button>
          </Stack>
        )}
      </Box>

      {/* ── List ── */}
      <Box sx={{ flex: 1, overflow: "auto", px: 1.5, py: 1.5 }}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              gap: 1.5,
              flexDirection: "column",
            }}
          >
            <RefreshCw size={28} color="#CBD5E1" />
            <Typography sx={{ fontSize: "0.85rem", color: "#94A3B8" }}>Yuklanmoqda...</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              gap: 1.5,
              pb: 4,
            }}
          >
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                bgcolor: "#F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bell size={32} color="#CBD5E1" />
            </Box>
            <Box textAlign="center">
              <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, color: "#475569" }}>
                Bildirishnomalar yo'q
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8", mt: 0.5 }}>
                To'lovlar tasdiqlanganda bu yerda ko'rinadi
              </Typography>
            </Box>
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {notifications.map((notification) => {
              const isApproved = notification.type === "PAYMENT_APPROVED";
              const accentColor = isApproved ? "#10B981" : "#EF4444";
              const bgColor = isApproved ? "#F0FDF4" : "#FFF1F2";
              const borderColor = isApproved ? "#BBF7D0" : "#FECACA";

              const paymentType = (notification.data as any).paymentType;
              const monthNumber = (notification.data as any).monthNumber;

              return (
                <Box
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification._id, notification.isRead)}
                  sx={{
                    cursor: "pointer",
                    bgcolor: notification.isRead ? "white" : bgColor,
                    borderRadius: "16px",
                    border: `1.5px solid ${notification.isRead ? "#E2E8F0" : borderColor}`,
                    overflow: "hidden",
                    transition: "all 0.2s",
                    "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
                    boxShadow: notification.isRead
                      ? "0 1px 3px rgba(0,0,0,0.05)"
                      : `0 2px 8px ${accentColor}20`,
                  }}
                >
                  {/* Accent bar */}
                  <Box sx={{ height: 3, bgcolor: accentColor }} />

                  <Box sx={{ p: 1.5 }}>
                    {/* Top row: icon + title + unread dot */}
                    <Stack direction="row" alignItems="flex-start" spacing={1.25}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: "11px",
                          bgcolor: `${accentColor}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: accentColor,
                          flexShrink: 0,
                        }}
                      >
                        {isApproved ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography
                            sx={{
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: "#1E293B",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "180px",
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.isRead && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: accentColor,
                                flexShrink: 0,
                                ml: 1,
                              }}
                            />
                          )}
                        </Stack>
                        <Typography
                          sx={{ fontSize: "0.75rem", color: "#64748B", mt: 0.25, lineHeight: 1.4 }}
                        >
                          {notification.message}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Info chips */}
                    <Box sx={{ mt: 1.25, display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                      <Chip
                        icon={<User size={11} />}
                        label={notification.data.customerName}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          bgcolor: "#F1F5F9",
                          color: "#475569",
                          border: "none",
                          "& .MuiChip-icon": { color: "#94A3B8", ml: 0.5 },
                          "& .MuiChip-label": { px: 0.75 },
                        }}
                      />
                      <Chip
                        icon={<DollarSign size={11} />}
                        label={`$${notification.data.amount.toFixed(2)}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          bgcolor: `${accentColor}15`,
                          color: accentColor,
                          border: "none",
                          "& .MuiChip-icon": { color: accentColor, ml: 0.5 },
                          "& .MuiChip-label": { px: 0.75 },
                        }}
                      />
                      {monthNumber && (
                        <Chip
                          icon={<Calendar size={11} />}
                          label={`${monthNumber}-oy`}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            bgcolor: "#EEF2FF",
                            color: "#4F46E5",
                            border: "none",
                            "& .MuiChip-icon": { color: "#4F46E5", ml: 0.5 },
                            "& .MuiChip-label": { px: 0.75 },
                          }}
                        />
                      )}
                      {paymentType && (
                        <Chip
                          icon={
                            paymentType === "FULL" ? <CheckCircle size={11} /> :
                            paymentType === "EXCESS" ? <TrendingUp size={11} /> :
                            <AlertTriangle size={11} />
                          }
                          label={
                            paymentType === "FULL" ? "To'liq" :
                            paymentType === "EXCESS" ? "Ortiqcha" :
                            "Qisman"
                          }
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            bgcolor: "#F8FAFC",
                            color: "#64748B",
                            border: "1px solid #E2E8F0",
                            "& .MuiChip-icon": { color: "#94A3B8", ml: 0.5 },
                            "& .MuiChip-label": { px: 0.75 },
                          }}
                        />
                      )}
                    </Box>

                    {/* Product + Time row */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mt: 1 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Package size={12} color="#94A3B8" />
                        <Typography
                          sx={{
                            fontSize: "0.7rem",
                            color: "#94A3B8",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "160px",
                          }}
                        >
                          {notification.data.productName}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.4}>
                        <Clock size={11} color="#CBD5E1" />
                        <Typography sx={{ fontSize: "0.65rem", color: "#CBD5E1" }}>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: uz,
                          })}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
