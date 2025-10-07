"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard"); // Redirect to dashboard
  }, [router]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}
