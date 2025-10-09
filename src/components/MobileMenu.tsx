"use client";

import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Divider,
  Toolbar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setIsOpen(open);
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      href: "/dashboard",
    },
    {
      text: "Year Summary",
      icon: <CalendarMonthIcon />,
      href: "/year-summary",
    },
    {
      text: "Settings",
      icon: <SettingsIcon />,
      href: "/settings",
    },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="end"
        onClick={toggleDrawer(true)}
        sx={{ 
          display: { xs: "block", md: "none" },
          marginLeft: "auto"
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Mobile Drawer */}
      <Drawer
        anchor="top"
        open={isOpen}
        onClose={toggleDrawer(false)}
        sx={{
          display: { xs: "block", md: "none" },
          '& .MuiDrawer-paper': {
            width: '100%',
            height: 'auto',
            maxHeight: '100vh',
            overflow: 'auto',
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {/* Header */}
          <Toolbar sx={{ px: 2, justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              Menu
            </Typography>
            <IconButton
              color="inherit"
              aria-label="close menu"
              onClick={toggleDrawer(false)}
              edge="end"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
          
          <Divider sx={{ borderColor: 'divider' }} />
          
          {/* Menu Items */}
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.text}
                component={Link}
                href={item.href}
                onClick={toggleDrawer(false)}
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            
            <Divider sx={{ borderColor: 'divider', my: 1 }} />
            
            <ListItem
              onClick={() => {
                toggleDrawer(false)({} as React.MouseEvent);
                handleLogout();
              }}
              sx={{
                color: 'inherit',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Log out" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
