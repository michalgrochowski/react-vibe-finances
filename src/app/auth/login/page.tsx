"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  login: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        login: data.login,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else {
        // Check if session was created
        const session = await getSession();
        if (session) {
          router.push("/");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        gap: 3,
      }}
    >
      {/* Logo above the card */}
      <Box
        sx={{
          width: 120,
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background circle */}
          <circle cx="60" cy="60" r="54" fill="currentColor" opacity="0.1"/>
          
          {/* Chart bars */}
          <rect x="24" y="48" width="9" height="24" fill="currentColor" opacity="0.7"/>
          <rect x="36" y="36" width="9" height="36" fill="currentColor" opacity="0.8"/>
          <rect x="48" y="30" width="9" height="42" fill="currentColor" opacity="0.9"/>
          
          {/* Coins */}
          <circle cx="84" cy="42" r="12" fill="currentColor" opacity="0.8"/>
          <circle cx="84" cy="42" r="7.5" fill="currentColor" opacity="0.3"/>
          
          {/* Dollar sign on coin */}
          <text x="84" y="51" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="currentColor">$</text>
          
          {/* VF Text */}
          <text x="60" y="90" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="currentColor">VF</text>
        </svg>
      </Box>
      
      <Card sx={{ maxWidth: 400, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Sign In
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register("login")}
              fullWidth
              label="Username or Email"
              margin="normal"
              error={!!errors.login}
              helperText={errors.login?.message}
              InputLabelProps={{
                sx: {
                  color: 'text.secondary',
                  '&.Mui-focused': {
                    color: '#2196F3', // Bright blue for visibility
                  },
                  '&.MuiFormLabel-filled': {
                    color: '#2196F3', // Bright blue when filled
                  },
                },
              }}
            />
            
            <TextField
              {...register("password")}
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputLabelProps={{
                sx: {
                  color: 'text.secondary',
                  '&.Mui-focused': {
                    color: '#2196F3', // Bright blue for visibility
                  },
                  '&.MuiFormLabel-filled': {
                    color: '#2196F3', // Bright blue when filled
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2">
                Don't have an account?{" "}
                <Link 
                  href="/auth/register" 
                  component="a"
                  sx={{
                    color: '#2196F3', // Bright blue for visibility
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: '#1976D2', // Darker blue on hover
                    }
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
