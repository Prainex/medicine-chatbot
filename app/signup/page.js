"use client";
// pages/signup.js or app/signup/page.js
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
  Container,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  List,
  ListItem,
  IconButton,
  AppBar,
  Toolbar,
  ButtonBase,
  Box,
  Card,
  CardContent,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [accountType, setAccountType] = useState("patient");
  const [medications, setMedications] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [newMedication, setNewMedication] = useState("");
  const [newMedicalIssue, setNewMedicalIssue] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const router = useRouter();

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'warning' | 'info'
  });

  // Add and remove handlers
  const handleAddItem = (item, setItem, listSetter, list) => {
    if (item.trim()) {
      listSetter([...list, item.trim()]);
      setItem("");
    }
  };

  const handleRemoveItem = (index, listSetter, list) => {
    const updatedList = [...list];
    updatedList.splice(index, 1);
    listSetter(updatedList);
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
      dateOfBirth: "",
      medicalLicenseNumber: "",
      state: "",
      specialization: "", // New field for specialization
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Required"),
      gender: Yup.string().required("Required"),
      dateOfBirth: Yup.date().required("Required"),
      ...(accountType === "doctor" && {
        medicalLicenseNumber: Yup.string().required(
          "Medical License Number is required"
        ),
        state: Yup.string().required("State is required"),
        specialization: Yup.string().required(
          "Specialization is required"
        ), // Validation for specialization
      }),
    }),
    onSubmit: async (values) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const userId = userCredential.user.uid;

        const userData = {
          accountType,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth,
        };

        if (accountType === "patient") {
          userData.medications = medications;
          userData.medicalHistory = medicalHistory;
          userData.allergies = allergies;
        } else if (accountType === "doctor") {
          userData.medicalLicenseNumber = values.medicalLicenseNumber;
          userData.state = values.state;
          userData.specialization = values.specialization; // Store specialization in Firestore
          userData.verified = false; // Mark doctor as pending verification
        }

        await setDoc(doc(db, "users", userId), userData);

        setSnackbar({
          open: true,
          message: "Account created successfully!",
          severity: "success",
        });

        // Redirect based on account type after a short delay to allow Snackbar to display
        setTimeout(() => {
          if (accountType === "patient") {
            router.push("/user/dashboard");
          } else if (accountType === "doctor") {
            setSnackbar({
              open: true,
              message: "Your account is pending verification.",
              severity: "info",
            });
            router.push("/login");
          }
        }, 1500);
      } catch (error) {
        console.error("Error signing up:", error);
        setSnackbar({
          open: true,
          message: "Error signing up: " + error.message,
          severity: "error",
        });
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Account Type</InputLabel>
        <Select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          label="Account Type"
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="doctor">Doctor</MenuItem>
        </Select>
      </FormControl>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          variant="outlined"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          name="password"
          type="password"
          variant="outlined"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Gender"
          name="gender"
          variant="outlined"
          value={formik.values.gender}
          onChange={formik.handleChange}
          error={formik.touched.gender && Boolean(formik.errors.gender)}
          helperText={formik.touched.gender && formik.errors.gender}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Age"
          name="age"
          type="number"
          variant="outlined"
          value={formik.values.age}
          onChange={formik.handleChange}
          error={formik.touched.age && Boolean(formik.errors.age)}
          helperText={formik.touched.age && formik.errors.age}
        />
        {accountType === 'user' && (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Medications"
              name="medications"
              variant="outlined"
              value={formik.values.medications}
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Medical History"
              name="medicalHistory"
              variant="outlined"
              value={formik.values.medicalHistory}
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Allergies"
              name="allergies"
              variant="outlined"
              value={formik.values.allergies}
              onChange={formik.handleChange}
            />
          </>
        )}
        {accountType === 'doctor' && (
          <TextField
            fullWidth
            margin="normal"
            label="Credentials"
            name="credentials"
            variant="outlined"
            value={formik.values.credentials}
            onChange={formik.handleChange}
            error={formik.touched.credentials && Boolean(formik.errors.credentials)}
            helperText={formik.touched.credentials && formik.errors.credentials}
          />
        )}
        <Button color="primary" variant="contained" fullWidth type="submit">
          Sign Up
        </Button>
      </form>
    </Container>
  );
}
