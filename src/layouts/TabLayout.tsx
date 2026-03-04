import { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/swiper-bundle.css";
import { Box, Badge } from "@mui/material";
import { tabRoutes } from "./tabRoutes";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { getUnreadCount } from "../store/actions/notificationActions";

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
    const currentIndex = tabRoutes.findIndex(
      (tab) => location.pathname === tab.path,
    );
    if (currentIndex !== -1) {
      setTabIndex(currentIndex);
      swiperInstance?.slideTo(currentIndex);
    }
  }, [location.pathname, swiperInstance]);

  const handleTabChange = (newValue: number) => {
    navigate(tabRoutes[newValue].path);
  };

  const handleSwipe = (swiper: SwiperType) => {
    const newIndex = swiper.activeIndex;
    setTabIndex(newIndex);
    navigate(tabRoutes[newIndex].path);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#F8FAFC",
      }}>
      {/* Top Tab Bar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          width: "100%",
          bgcolor: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          zIndex: 1000,
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: { xs: 52, sm: 56 },
            px: { xs: 0.5, sm: 1 },
          }}>
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
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.4,
                  py: 0.75,
                  cursor: "pointer",
                  position: "relative",
                  color: isActive ? "#4F46E5" : "#94A3B8",
                  transition: "color 0.2s",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                }}>
                {/* Active indicator bar */}
                {isActive && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: "20%",
                      right: "20%",
                      height: 2.5,
                      borderRadius: "2px 2px 0 0",
                      bgcolor: "#4F46E5",
                    }}
                  />
                )}

                {/* Icon with badge */}
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  {showBadge ?
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.55rem",
                          height: 15,
                          minWidth: 15,
                          padding: "0 3px",
                          fontWeight: 700,
                          top: -2,
                          right: -2,
                        },
                      }}>
                      <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                    </Badge>
                  : <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />}
                </Box>

                {/* Label */}
                <Box
                  component="span"
                  sx={{
                    fontSize: "0.62rem",
                    fontWeight: isActive ? 700 : 500,
                    lineHeight: 1,
                    letterSpacing: isActive ? 0 : "-0.01em",
                  }}>
                  {tab.label}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Content area */}
      <Box sx={{ flex: 1, pt: { xs: "52px", sm: "56px" } }}>
        <Swiper
          modules={[Mousewheel, Keyboard]}
          spaceBetween={50}
          slidesPerView={1}
          initialSlide={tabIndex}
          onSwiper={setSwiperInstance}
          onSlideChange={handleSwipe}
          mousewheel={true}
          keyboard={{ enabled: true }}
          style={{ height: "100%" }}>
          {tabRoutes.map((route, idx) => {
            const Component = route.component;
            return (
              <SwiperSlide
                key={idx}
                style={{ height: "auto", overflowY: "auto" }}>
                <Box
                  sx={{
                    height: {
                      xs: "calc(100vh - 52px)",
                      sm: "calc(100vh - 56px)",
                    },
                    overflowY: "auto",
                    overflowX: "hidden",
                    py: { xs: 1.5, sm: 2 },
                    scrollbarWidth: "thin",
                    "&::-webkit-scrollbar": { width: "2px" },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(0,0,0,0.15)",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "transparent",
                    },
                  }}>
                  <Component activeTabIndex={tabIndex} index={idx} />
                </Box>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Box>
    </Box>
  );
};

export default TabsLayout;
