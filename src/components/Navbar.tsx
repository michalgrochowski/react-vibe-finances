"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Settings as SettingsIcon, Logout as LogoutIcon, Dashboard as DashboardIcon, CalendarMonth as CalendarMonthIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  // Generate current month dashboard URL
  const getCurrentMonthUrl = () => {
    const now = new Date();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    const year = now.getFullYear();
    return `/dashboard?month=${month}&year=${year}`;
  };

  // Don't show navbar on auth pages
  if (!session) {
    return null;
  }

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar sx={{ px: 3, width: "100%" }}>
        <Box
          component={Link}
          href={getCurrentMonthUrl()}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer",
            width: "10%"
          }}
        >
          <Box
            component="img"
            src="/logo.svg"
            alt="Vibe Finances Logo"
            sx={{
              width: 32,
              height: 32,
              filter: "brightness(0) invert(1)", // Makes logo white in navbar
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              color: "inherit",
            }}
          >
            Vibe Finances
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, marginRight: "auto", marginLeft: "auto" }}>
          <Button
            color="inherit"
            startIcon={<DashboardIcon />}
            component={Link}
            href={getCurrentMonthUrl()}
          >
            Dashboard
          </Button>

          <Button
            color="inherit"
            startIcon={<CalendarMonthIcon />}
            component={Link}
            href="/year-summary"
          >
            Year Summary
          </Button>

          <Button
            color="inherit"
            startIcon={<SettingsIcon />}
            component={Link}
            href="/settings"
          >
            Settings
          </Button>
        </Box>
        <Box sx={{ display: { xs: "none", md: "flex", alignItems: "flex-end", justifyContent: "flex-end" }, width: "10%" }}>
        <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Log out
          </Button>
        </Box>
        {/* Mobile Menu */}
        <MobileMenu />
      </Toolbar>
    </AppBar>
  );
}