import { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/swiper-bundle.css";
import { Box, Badge, Typography } from "@mui/material";
import { tabRoutes } from "./tabRoutes";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { getUnreadCount } from "../store/actions/notificationActions";
import { motion } from "framer-motion";

// Floating pill height (~70px) + bottom margin (20px) + safe area buffer
const BOTTOM_OFFSET = 100;

const TabsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tabIndex, setTabIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const { unreadCount } = useSelector((state: RootState) => state.notification);

  useEffect(() => {
    dispatch(getUnreadCount() as any);
  }, [dispatch]);

  useEffect(() => {
    const idx = tabRoutes.findIndex((t) => location.pathname === t.path);
    if (idx !== -1) {
      setTabIndex(idx);
      swiperInstance?.slideTo(idx);
    }
  }, [location.pathname, swiperInstance]);

  const handleTabChange = (idx: number) => navigate(tabRoutes[idx].path);

  const handleSwipe = (swiper: SwiperType) => {
    const idx = swiper.activeIndex;
    setTabIndex(idx);
    navigate(tabRoutes[idx].path);
  };

  return (
    // Outer: simple relative container, NO overflow:hidden — touch eventlarni bloklamaslik uchun
    <Box sx={{ height: "100vh", position: "relative", bgcolor: "#F8FAFC" }}>
      {/* ──────────────────────────────────────────
          Swiper — aniq balandlik berilgan (100% emas),
          Mousewheel olib tashlandi — swipe ni bloklar edi,
          allowTouchMove + simulateTouch yoqildi
      ────────────────────────────────────────── */}
      <Swiper
        modules={[Keyboard]}
        spaceBetween={24}
        slidesPerView={1}
        initialSlide={tabIndex}
        onSwiper={setSwiperInstance}
        onSlideChange={handleSwipe}
        keyboard={{ enabled: true }}
        allowTouchMove={true}
        simulateTouch={true}
        touchStartPreventDefault={false}
        style={{
          width: "100%",
          height: `calc(100vh - ${BOTTOM_OFFSET}px)`,
        }}>
        {tabRoutes.map((route, idx) => {
          const Component = route.component;
          return (
            // SwiperSlide — overflow OLIB TASHLANDI, height auto
            <SwiperSlide key={idx}>
              <Box
                sx={{
                  // height: 100% — Swiper slide balandligiga to'g'ri keladi
                  height: `calc(100vh - ${BOTTOM_OFFSET}px)`,
                  overflowY: "auto",
                  overflowX: "hidden",
                  py: { xs: 1.5, sm: 2 },
                  scrollbarWidth: "thin",
                  "&::-webkit-scrollbar": { width: "2px" },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "rgba(0,0,0,0.12)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                }}>
                <Component activeTabIndex={tabIndex} index={idx} />
              </Box>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* ══════════════════════════════════════════════════
          Floating Liquid Glass Pill Tab Bar
          Xuddi rasmdagidek:
          • oq, shaffof, suzuvchi pill shakli
          • faol tab = kulrang pill + ko'k rang
          • framer-motion spring bilan siljuvchi pill
      ══════════════════════════════════════════════════ */}
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 20 },
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 20px)",
          maxWidth: 440,
          zIndex: 1000,

          // Pill outer shape
          borderRadius: "60px",
          // Liquid Glass
          bgcolor: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(24px) saturate(1.9)",
          WebkitBackdropFilter: "blur(24px) saturate(1.9)",
          border: "1px solid rgba(255,255,255,0.95)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
          p: "6px",
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {tabRoutes.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = tabIndex === idx;
            const showBadge = tab.showBadge && unreadCount > 0;

            return (
              <Box
                key={idx}
                onClick={() => handleTabChange(idx)}
                sx={{
                  flex: 1,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  py: "10px",
                  px: "10px",
                  borderRadius: "52px",
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  "&:active": { transform: "scale(0.88)" },
                  transition: "transform 0.13s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                {/* ── Siljuvchi kulrang pill — rasmdagidek ── */}
                {isActive && (
                  <motion.div
                    layoutId="floating-pill"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 52,
                      background: "rgba(0,0,0,0.07)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                      mass: 0.85,
                    }}
                  />
                )}

                {/* ── Icon ── */}
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-flex",
                    zIndex: 1,
                  }}>
                  {showBadge ?
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.5rem",
                          height: 14,
                          minWidth: 14,
                          padding: "0 3px",
                          fontWeight: 800,
                          top: -1,
                          right: -2,
                        },
                      }}>
                      <Icon
                        size={21}
                        strokeWidth={isActive ? 2.2 : 1.7}
                        style={{
                          color: isActive ? "#2563EB" : "#94A3B8",
                          transition: "color 0.2s ease",
                        }}
                      />
                    </Badge>
                  : <Icon
                      size={22}
                      strokeWidth={isActive ? 2.2 : 1.7}
                      style={{
                        color: isActive ? "#2563EB" : "black",
                        transition: "color 0.2s ease",
                      }}
                    />
                  }
                </Box>

                {/* ── Label ── */}
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: isActive ? 700 : 600,
                    lineHeight: 1,
                    zIndex: 1,
                    color: isActive ? "#2563EB" : "black",
                    letterSpacing: isActive ? "0.01em" : 0,
                    transition: "color 0.2s ease",
                    whiteSpace: "nowrap",
                  }}>
                  {tab.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default TabsLayout;
