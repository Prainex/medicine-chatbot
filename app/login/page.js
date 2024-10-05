"use client";
// pages/signin.js or app/signin/page.js
import React, { useState } from "react";
import { auth, db } from "../firebase"; // Ensure Firebase config is properly imported
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // To check user data from Firestore
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
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // To prevent multiple clicks during sign-in
  const router = useRouter();

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'warning' | 'info'
  });

  // Sign In Handler
  const handleSignIn = async () => {
    setLoading(true); // Start loading when sign-in process starts
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore to check their account type
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const accountType = userData.accountType; // Either 'patient' or 'doctor'

        // Display success Snackbar
        setSnackbar({
          open: true,
          message: `Signed in as ${accountType}`,
          severity: "success",
        });

        // Redirect to the appropriate dashboard
        setTimeout(() => {
          if (accountType === "patient") {
            router.push("/user/dashboard");
          } else if (accountType === "doctor") {
            router.push("/doctor/dashboard");
          }
        }, 1500);
      } else {
        // User document not found in Firestore
        throw new Error("User data not found in database.");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setSnackbar({
        open: true,
        message: "Error signing in: " + error.message,
        severity: "error",
      });
    } finally {
      setLoading(false); // Stop loading after sign-in attempt
    }
  };

  return (
    <>
      {/* AppBar */}
      <AppBar position="static" sx={{ backgroundColor: "primary.main" }}>
        <Toolbar>
          {/* App Name Button on the Top Left */}
          <ButtonBase
            onClick={() => router.push("/")}
            sx={{ display: "flex", alignItems: "center" }}
            aria-label="Go to home page"
          >
            <Typography variant="h6" sx={{ color: "#fff" }}>
              Telemedicine App
            </Typography>
          </ButtonBase>

          {/* Spacer to push the following buttons to the right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Login and Sign Up Buttons on the Top Right */}
          <Button
            color="inherit"
            onClick={() => router.push("/login")}
            sx={{
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
              },
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
            }}
            aria-label="Sign Up"
          >
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Container */}
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Card elevation={6} sx={{ padding: 3, borderRadius: 2 }}>
          <CardContent>
            {/* Header */}
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
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
            />

            {/* Sign In Button */}
            <Button
              color="primary"
              variant="contained"
              fullWidth
              onClick={handleSignIn}
              disabled={loading} // Disable button when loading
              sx={{
                mt: 4,
                py: 1.5,
                borderRadius: 1,
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
              aria-label="Sign In Button"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            {/* Forgot Password Link (optional) */}
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                color="secondary"
                onClick={() => router.push("/forgot-password")}
                aria-label="Forgot Password"
              >
                Forgot Password?
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

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
