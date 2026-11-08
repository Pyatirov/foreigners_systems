import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Tooltip,
} from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import FlightTakeoffOutlinedIcon from "@mui/icons-material/FlightTakeoffOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ForwardToInboxOutlinedIcon from "@mui/icons-material/ForwardToInboxOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import CardTravelOutlinedIcon from "@mui/icons-material/CardTravelOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";

import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const HEADER_HEIGHT = 80;
const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 76;
const NAV_ITEM_HEIGHT = 44;
const DOCUMENT_ITEM_HEIGHT = 40;

const BORDER_COLOR = "#DFBFBC";
const TEXT_COLOR = "#393433";
const MUTED_COLOR = "#77706E";
const HOVER_COLOR = "#F8F3F2";
const ACTIVE_COLOR = "#F3E8E6";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface DocumentItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const documentItems: DocumentItem[] = [
  {
    label: "Паспорта",
    path: "/passports",
    icon: <BadgeOutlinedIcon fontSize="small" />,
  },
  {
    label: "Визы",
    path: "/visas",
    icon: <FlightTakeoffOutlinedIcon fontSize="small" />,
  },
  {
    label: "Документы об образовании",
    path: "/education_documents",
    icon: <SchoolOutlinedIcon fontSize="small" />,
  },
  {
    label: "Ходатайства",
    path: "/petitions",
    icon: <ForwardToInboxOutlinedIcon fontSize="small" />,
  },
  {
    label: "Медицинские заключения",
    path: "/medical_reports",
    icon: <MedicalServicesOutlinedIcon fontSize="small" />,
  },
  {
    label: "Миграционные карты",
    path: "/migration_cards",
    icon: <CardTravelOutlinedIcon fontSize="small" />,
  },
  {
    label: "Уведомления о прибытии",
    path: "/arrival_notifications",
    icon: <NotificationsActiveOutlinedIcon fontSize="small" />,
  },
  {
    label: "Договоры об образовании",
    path: "/education_agreements",
    icon: <HandshakeOutlinedIcon fontSize="small" />,
  },
  {
    label: "Уведомления об окончании обучения",
    path: "/termination_notifications",
    icon: <EventNoteOutlinedIcon fontSize="small" />,
  },
];

const documentPaths = documentItems.map((item) => item.path);

const itemSx = {
  height: NAV_ITEM_HEIGHT,
  minHeight: NAV_ITEM_HEIGHT,
  maxHeight: NAV_ITEM_HEIGHT,
  flexShrink: 0,
  boxSizing: "border-box",
  px: 1.5,
  py: 0,
  mb: 0.5,
  borderRadius: "10px",
  color: TEXT_COLOR,
  transition: "background-color 0.18s ease",

  "& .MuiListItemIcon-root": {
    minWidth: 38,
    color: MUTED_COLOR,
    flexShrink: 0,
  },

  "& .MuiListItemText-root": {
    minWidth: 0,
    overflow: "hidden",
    my: 0,
  },

  "& .MuiListItemText-primary": {
    fontSize: "0.875rem",
    lineHeight: 1.4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  "&:hover": {
    bgcolor: HOVER_COLOR,
  },

  "&.Mui-selected": {
    bgcolor: ACTIVE_COLOR,

    "& .MuiListItemIcon-root": {
      color: TEXT_COLOR,
    },

    "& .MuiListItemText-primary": {
      fontWeight: 600,
    },

    "&:hover": {
      bgcolor: ACTIVE_COLOR,
    },
  },
};

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();

  const isDocumentRoute = documentPaths.some(
    (path) =>
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
  );

  const [documentsOpen, setDocumentsOpen] = useState(isDocumentRoute);

  const currentWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const renderNavItem = ({
    label,
    path,
    icon,
  }: {
    label: string;
    path: string;
    icon: ReactNode;
  }) => {
    const selected =
      path === "/"
        ? location.pathname === "/"
        : location.pathname === path ||
          location.pathname.startsWith(`${path}/`);

    return (
      <Tooltip
        key={path}
        title={collapsed ? label : ""}
        placement="right"
        disableHoverListener={!collapsed}
        arrow
      >
        <ListItemButton
          component={Link}
          to={path}
          selected={selected}
          sx={{
            ...itemSx,
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 0 : 1.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: collapsed ? "0 !important" : 38,
              justifyContent: "center",
            }}
          >
            {icon}
          </ListItemIcon>

          {!collapsed && (
            <ListItemText
              primary={label}
              slotProps={{
                primary: {
                  noWrap: true,
                },
              }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    );
  };

  return (
    <Box
      component="aside"
      sx={{
        position: "fixed",
        top: HEADER_HEIGHT,
        bottom: 0,
        left: 0,
        width: currentWidth,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FFFFFF",
        borderRight: `1px solid ${BORDER_COLOR}`,
        boxSizing: "border-box",
        overflowX: "hidden",
        zIndex: 1100,
        transition: "width 0.22s ease",
      }}
    >
      {/* ОСНОВНОЕ МЕНЮ */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          px: collapsed ? 1 : 1.5,
          pt: 2,
          pb: 1,
        }}
      >
        {/* Место под заголовок сохраняется и в свернутом состоянии */}
        <Typography
          aria-hidden={collapsed}
          sx={{
            display: "flex",
            alignItems: "center",
            height: 14,
            minHeight: 14,
            lineHeight: "14px",
            boxSizing: "border-box",
            px: 1.5,
            mb: 1.5,
            color: MUTED_COLOR,
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            visibility: collapsed ? "hidden" : "visible",
            overflow: "hidden",
          }}
        >
          Рабочее пространство
        </Typography>

        <List disablePadding>
          {/* 1. Главная панель */}
          {renderNavItem({
            label: "Главная панель",
            path: "/",
            icon: <DashboardOutlinedIcon />,
          })}

          {/* 2. Студенты */}
          {renderNavItem({
            label: "Студенты",
            path: "/students",
            icon: <PeopleAltOutlinedIcon />,
          })}

          {/* 3. Документы */}
          <Tooltip
            title={collapsed ? "Документы" : ""}
            placement="right"
            disableHoverListener={!collapsed}
            arrow
          >
            <ListItemButton
              selected={isDocumentRoute}
              onClick={() => setDocumentsOpen((value) => !value)}
              aria-expanded={documentsOpen}
              aria-label={collapsed ? "Документы" : undefined}
              sx={{
                ...itemSx,
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 0 : 1.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? "0 !important" : 38,
                  justifyContent: "center",
                }}
              >
                <DescriptionOutlinedIcon />
              </ListItemIcon>

              {!collapsed && (
                <>
                  <ListItemText primary="Документы" />

                  {documentsOpen ? (
                    <ExpandLessIcon
                      sx={{ fontSize: 20, color: MUTED_COLOR }}
                    />
                  ) : (
                    <ExpandMoreIcon
                      sx={{ fontSize: 20, color: MUTED_COLOR }}
                    />
                  )}
                </>
              )}
            </ListItemButton>
          </Tooltip>

          <Collapse in={documentsOpen} timeout="auto" unmountOnExit>
            <List
              disablePadding
              sx={{
                pl: collapsed ? 0 : 2,
              }}
            >
              {documentItems.map((item) => {
                const selected =
                  location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`);

                return (
                  <Tooltip
                    key={item.path}
                    title={collapsed ? item.label : ""}
                    placement="right"
                    disableHoverListener={!collapsed}
                    arrow
                  >
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      selected={selected}
                      sx={{
                        ...itemSx,
                        height: DOCUMENT_ITEM_HEIGHT,
                        minHeight: DOCUMENT_ITEM_HEIGHT,
                        maxHeight: DOCUMENT_ITEM_HEIGHT,
                        px: collapsed ? 0 : 1.5,
                        py: 0,
                        justifyContent: collapsed ? "center" : "flex-start",

                        "& .MuiListItemIcon-root": {
                          minWidth: collapsed ? "0 !important" : 34,
                          justifyContent: "center",
                          color: MUTED_COLOR,
                          flexShrink: 0,
                        },

                        "& .MuiListItemText-primary": {
                          fontSize: "0.82rem",
                          lineHeight: 1.35,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                    >
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>

                      {!collapsed && (
                        <ListItemText
                          primary={item.label}
                          slotProps={{
                            primary: {
                              noWrap: true,
                            },
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                );
              })}
            </List>
          </Collapse>

          <Divider
            sx={{
              my: 1.5,
              borderColor: BORDER_COLOR,
            }}
          />

          {/* 4. Шаблоны документов */}
          {renderNavItem({
            label: "Шаблоны документов",
            path: "/templates",
            icon: <FolderOutlinedIcon />,
          })}

          {/* 5. Журнал операций */}
          {renderNavItem({
            label: "Журнал операций",
            path: "/operations",
            icon: <HistoryOutlinedIcon />,
          })}

          {/* 6. Настройки */}
          {renderNavItem({
            label: "Настройки",
            path: "/settings",
            icon: <SettingsOutlinedIcon />,
          })}
        </List>
      </Box>

      {/* НИЖНЯЯ ПАНЕЛЬ — СВОРАЧИВАНИЕ */}
      <Box
        sx={{
          flexShrink: 0,
          px: collapsed ? 1 : 1.5,
          pb: 1.5,
          pt: 1,
          bgcolor: "#FFFFFF",
        }}
      >
        <Divider
          sx={{
            mb: 1,
            borderColor: BORDER_COLOR,
          }}
        />

        <Tooltip
          title={collapsed ? "Развернуть меню" : "Свернуть меню"}
          placement="right"
          arrow
        >
          <ListItemButton
            onClick={onToggle}
            aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
            sx={{
              ...itemSx,
              justifyContent: collapsed ? "center" : "flex-start",
              px: collapsed ? 0 : 1.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? "0 !important" : 38,
                justifyContent: "center",
              }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </ListItemIcon>

            {!collapsed && <ListItemText primary="Свернуть меню" />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Sidebar;
