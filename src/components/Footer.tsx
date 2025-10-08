"use client";

import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        height: 40, // Same height as navbar
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "primary.main",
        color: "primary.contrastText",
        px: 3, // Same padding as navbar
        backgroundImage: "none", // Match AppBar styling
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 400 }}>
        Copyright © 2017 - 2025 - <a href="https://dobrywebdev.pl" className="footerLink" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>dobrywebdev.pl</a>
      </Typography>
    </Box>
  );
}
