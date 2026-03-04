import { useEffect } from "react";

import { useSelector } from "react-redux";
import { Box, Typography, Button, IconButton } from "@mui/material";

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

// ── Kichik info chip ───────────────────────────────────────────────────────────
function InfoChip({
  icon,
  label,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        px: "7px",
        py: "3px",
        borderRadius: "20px",
        bgcolor: bg,
      }}>
      <Box sx={{ display: "flex", color, "& svg": { width: 11, height: 11 } }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: "0.67rem", fontWeight: 600, color }}>
        {label}
      </Typography>
    </Box>
  );
}

// ── Sahifa ─────────────────────────────────────────────────────────────────────
export default function NotificationsPage({
  activeTabIndex,
  index,
}: TabPageProps) {
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
      message:
        "Barcha bildirishnomalarni o'chirishni xohlaysizmi? Bu amalni bekor qilib bo'lmaydi.",
      confirmText: "O'chirish",
      cancelText: "Bekor qilish",
      onConfirm: async () => {
        try {
          await dispatch(deleteAllNotifications());
          showSuccess("Barcha bildirishnomalar o'chirildi", "Muvaffaqiyat");
        } catch {
          showError(
            "Bildirishnomalarni o'chirishda xatolik yuz berdi",
            "Xatolik",
          );
        }
      },
    });
  };

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) dispatch(markNotificationAsRead(notificationId));
  };

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 4, maxWidth: 600, mx: "auto" }}>
      {/* ══════════════════════════════════════
          Header
      ══════════════════════════════════════ */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}>
        {/* Chap: icon + sarlavha + badge */}
        <Box display="flex" alignItems="center" gap={1.25}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "13px",
              bgcolor: "#EEF2FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4F46E5",
              flexShrink: 0,
            }}>
            <Bell size={20} />
          </Box>
          <Box>
            <Box display="flex" alignItems="center" gap={0.75}>
              <Typography
                sx={{ fontSize: "1rem", fontWeight: 700, color: "#1E293B" }}>
                Bildirishnomalar
              </Typography>
              {unreadCount > 0 && (
                <Box
                  sx={{
                    px: 0.8,
                    py: 0.1,
                    borderRadius: "20px",
                    bgcolor: "#EF4444",
                    minWidth: 20,
                    textAlign: "center",
                  }}>
                  <Typography
                    sx={{
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      color: "white",
                      lineHeight: 1.6,
                    }}>
                    {unreadCount}
                  </Typography>
                </Box>
              )}
            </Box>
            <Typography
              sx={{ fontSize: "0.7rem", color: "#94A3B8", fontWeight: 500 }}>
              {notifications.length} ta bildirishnoma
            </Typography>
          </Box>
        </Box>

        {/* O'ng: refresh */}
        <IconButton
          onClick={handleRefresh}
          disabled={isLoading}
          size="small"
          sx={{
            color: "#64748B",
            bgcolor: "white",
            borderRadius: "11px",
            width: 38,
            height: 38,
            border: "1px solid #E2E8F0",
            "&:hover": { bgcolor: "#F1F5F9" },
          }}>
          <RefreshCw
            size={17}
            style={{
              animation: isLoading ? "spin 1s linear infinite" : "none",
            }}
          />
        </IconButton>
      </Box>

      {/* Action tugmalar */}
      {notifications.length > 0 && (
        <Box display="flex" gap={1} mb={2}>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<CheckCheck size={14} />}
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                borderRadius: "10px",
                border: "1.5px solid #E2E8F0",
                color: "#475569",
                bgcolor: "white",
                py: "6px",
                px: 1.5,
                textTransform: "none",
                "&:hover": {
                  border: "1.5px solid #4F46E5",
                  color: "#4F46E5",
                  bgcolor: "#EEF2FF",
                },
              }}>
              Hammasini o'qilgan
            </Button>
          )}
          <Button
            size="small"
            onClick={handleDeleteAll}
            startIcon={<Trash2 size={14} />}
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              borderRadius: "10px",
              border: "1.5px solid #FECACA",
              color: "#EF4444",
              bgcolor: "white",
              py: "6px",
              px: 1.5,
              textTransform: "none",
              "&:hover": { border: "1.5px solid #EF4444", bgcolor: "#FEF2F2" },
            }}>
            Hammasini o'chirish
          </Button>
        </Box>
      )}

      {/* ══════════════════════════════════════
          Yuklanyapti
      ══════════════════════════════════════ */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 10,
            gap: 1.5,
          }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              bgcolor: "#EEF2FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <RefreshCw size={26} color="#4F46E5" />
          </Box>
          <Typography sx={{ fontSize: "0.85rem", color: "#94A3B8" }}>
            Yuklanmoqda...
          </Typography>
        </Box>
      )}

      {/* ══════════════════════════════════════
          Bo'sh holat
      ══════════════════════════════════════ */}
      {!isLoading && notifications.length === 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 10,
            gap: 2,
          }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "24px",
              bgcolor: "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <Bell size={36} color="#CBD5E1" />
          </Box>
          <Box textAlign="center">
            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#475569",
                mb: 0.5,
              }}>
              Bildirishnomalar yo'q
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>
              To'lovlar tasdiqlanganda bu yerda ko'rinadi
            </Typography>
          </Box>
        </Box>
      )}

      {/* ══════════════════════════════════════
          Ro'yxat
      ══════════════════════════════════════ */}
      {!isLoading && notifications.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {notifications.map((notification) => {
            const isApproved = notification.type === "PAYMENT_APPROVED";
            const accentColor = isApproved ? "#10B981" : "#EF4444";
            const paymentType = (notification.data as any).paymentType;
            const monthNumber = (notification.data as any).monthNumber;

            return (
              <Box
                key={notification._id}
                onClick={() =>
                  handleNotificationClick(notification._id, notification.isRead)
                }
                sx={{
                  cursor: "pointer",
                  bgcolor: "white",
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor:
                    notification.isRead ? "#E2E8F0" : `${accentColor}30`,
                  // O'qilmagan: chap rang aksenti
                  borderLeft: `3.5px solid ${notification.isRead ? "#E2E8F0" : accentColor}`,
                  boxShadow:
                    notification.isRead ?
                      "0 1px 4px rgba(0,0,0,0.05)"
                    : `0 2px 10px ${accentColor}18`,
                  transition: "transform 0.15s",
                  "&:active": { transform: "scale(0.99)" },
                }}>
                <Box sx={{ p: 1.5 }}>
                  {/* ── Yuqori: icon + sarlavha + dot ── */}
                  <Box display="flex" alignItems="flex-start" gap={1.25}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "12px",
                        bgcolor: `${accentColor}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: accentColor,
                        flexShrink: 0,
                      }}>
                      {isApproved ?
                        <CheckCircle size={20} />
                      : <XCircle size={20} />}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between">
                        <Typography
                          sx={{
                            fontSize: "0.83rem",
                            fontWeight: 700,
                            color: "#1E293B",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "200px",
                          }}>
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
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#64748B",
                          mt: 0.3,
                          lineHeight: 1.45,
                        }}>
                        {notification.message}
                      </Typography>
                    </Box>
                  </Box>

                  {/* ── Info chips ── */}
                  <Box
                    sx={{
                      mt: 1.25,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                    }}>
                    <InfoChip
                      icon={<User />}
                      label={notification.data.customerName}
                      color="#475569"
                      bg="#F1F5F9"
                    />
                    <InfoChip
                      icon={<DollarSign />}
                      label={`$${notification.data.amount.toFixed(2)}`}
                      color={accentColor}
                      bg={`${accentColor}15`}
                    />
                    {monthNumber && (
                      <InfoChip
                        icon={<Calendar />}
                        label={`${monthNumber}-oy`}
                        color="#4F46E5"
                        bg="#EEF2FF"
                      />
                    )}
                    {paymentType && (
                      <InfoChip
                        icon={
                          paymentType === "FULL" ? <CheckCircle />
                          : paymentType === "EXCESS" ?
                            <TrendingUp />
                          : <AlertTriangle />
                        }
                        label={
                          paymentType === "FULL" ? "To'liq"
                          : paymentType === "EXCESS" ?
                            "Ortiqcha"
                          : "Qisman"
                        }
                        color="#64748B"
                        bg="#F8FAFC"
                      />
                    )}
                  </Box>

                  {/* ── Pastki: mahsulot + vaqt ── */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mt: 1.1 }}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Package size={12} color="#94A3B8" />
                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          color: "#94A3B8",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "170px",
                        }}>
                        {notification.data.productName}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.4}>
                      <Clock size={11} color="#CBD5E1" />
                      <Typography
                        sx={{ fontSize: "0.65rem", color: "#CBD5E1" }}>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: uz,
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}
