"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Settings as SettingsIcon, Logout as LogoutIcon, Dashboard as DashboardIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  // Don't show navbar on auth pages
  if (!session) {
    return null;
  }

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar sx={{ px: 3 }}>
        <Typography
          variant="h6"
          component={Link}
          href="/dashboard"
          sx={{
            flexGrow: 1,
            fontWeight: 400,
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          Vibe Finances
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
            color="inherit"
            startIcon={<DashboardIcon />}
            component={Link}
            href="/dashboard"
          >
            Dashboard
          </Button>

          <Button
            color="inherit"
            startIcon={<SettingsIcon />}
            component={Link}
            href="/settings"
          >
            Settings
          </Button>
          
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Log out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}