"use client";

import { Container, Box, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 8 }}>
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 300, mb: 2 }}>
          Vibe Finances
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 300 }}>
          Track your monthly salary, expenses, and savings
        </Typography>
      </Container>
    </Box>
  );
}
