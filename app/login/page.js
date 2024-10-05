"use client";
// pages/signin.js or app/signin/page.js
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  Container,
  TextField,
  Button,
  Typography,
  AppBar,
  Toolbar,
  ButtonBase,
  Box,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from '@mui/material/styles'; // Import useTheme to access theme properties
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get the current theme to apply card background dynamically
  const theme = useTheme();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const accountType = userData.accountType;

        setSnackbar({
          open: true,
          message: `Signed in as ${accountType}`,
          severity: "success",
        });

        setTimeout(() => {
          if (accountType === "patient") {
            router.push("/user/dashboard");
          } else if (accountType === "doctor") {
            router.push("/user/doctor");
          }
        }, 1500);
      } else {
        throw new Error("User data not found in database.");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error signing in: " + error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* AppBar with Glassmorphism */}
      <AppBar position="static" color="primary">
        <Toolbar>
            <ButtonBase
            onClick={() => router.push("/")}
            sx={{ display: "flex", alignItems: "center" }}
            aria-label="Go to home page"
            >
            <Typography variant="h6" sx={{ color: "#fff" }}>
                Telemedicine App
            </Typography>
            </ButtonBase>

            <Box sx={{ flexGrow: 1 }} />

            <Button
            color="inherit"
            onClick={() => router.push("/login")}
            sx={{
                transition: "transform 0.2s",
                "&:hover": {
                transform: "scale(1.05)",
                },
                color: "#fff",
            }}
            aria-label="Login"
            >
            Login
            </Button>
            <Button
            color="inherit"
            onClick={() => router.push("/signup")}
            sx={{
                transition: "transform 0.2s",
                "&:hover": {
                transform: "scale(1.05)",
                },
                color: "#fff",
            }}
            aria-label="Sign Up"
            >
            Sign Up
            </Button>
        </Toolbar>
    </AppBar>


      {/* Background */}
      <Box
        sx={{
          background: "url('/path-to-your-background-image.jpg') no-repeat center center fixed",
          backgroundSize: "cover",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Main Container */}
        <Container maxWidth="sm">
          <Card
            elevation={6}
            sx={{
              backdropFilter: "blur(10px)",
              background: theme.palette.background.paper, // Use the theme's paper color
              borderRadius: 4,
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              padding: 4,
            }}
          >
            <CardContent>
              {/* Header */}
              <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3, color: theme.palette.text.primary }}>
                Sign In to Your Account
              </Typography>

              {/* Email Field */}
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email"
                InputProps={{
                  style: {
                    color: theme.palette.text.primary, // White text for visibility
                  },
                }}
                InputLabelProps={{
                  style: { color: theme.palette.text.primary }, // White label for visibility
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backdropFilter: "blur(4px)",
                    background: "rgba(255, 255, 255, 0.2)", // Light background for input
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.3)", // Border for visibility
                  },
                }}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                InputProps={{
                  style: {
                    color: theme.palette.text.primary,
                  },
                }}
                InputLabelProps={{
                  style: { color: theme.palette.text.primary },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backdropFilter: "blur(4px)",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  },
                }}
              />

              {/* Sign In Button */}
              <Button
                color="primary"
                variant="contained"
                fullWidth
                onClick={handleSignIn}
                disabled={loading}
                sx={{
                  mt: 4,
                  py: 1.5,
                  borderRadius: 2,
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    background: "rgba(255, 255, 255, 0.3)",
                  },
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  color: theme.palette.text.primary,
                }}
                aria-label="Sign In Button"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              {/* Forgot Password Link */}
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  color="secondary"
                  onClick={() => router.push("/forgot-password")}
                  aria-label="Forgot Password"
                  sx={{
                    color: theme.palette.text.primary,
                  }}
                >
                  Forgot Password?
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
