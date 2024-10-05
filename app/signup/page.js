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
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              sx={{ mb: 3 }}
            >
              Create Your Account
            </Typography>

            {/* Account Type Selection */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="account-type-label">Account Type</InputLabel>
              <Select
                labelId="account-type-label"
                id="account-type"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                label="Account Type"
                sx={{ borderRadius: 1 }}
                aria-label="Account Type"
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
              </Select>
            </FormControl>

            {/* Sign-Up Form */}
            <form onSubmit={formik.handleSubmit} noValidate>
              {/* Email Field */}
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                variant="outlined"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                aria-label="Email"
              />

              {/* Password Field */}
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                name="password"
                type="password"
                variant="outlined"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                aria-label="Password"
              />

              {/* Confirm Password Field */}
              <TextField
                fullWidth
                margin="normal"
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                variant="outlined"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.confirmPassword &&
                  Boolean(formik.errors.confirmPassword)
                }
                helperText={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                }
                aria-label="Confirm Password"
              />

              {/* Gender Selection */}
              <FormControl fullWidth margin="normal">
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.gender && Boolean(formik.errors.gender)}
                  label="Gender"
                  sx={{ borderRadius: 1 }}
                  aria-label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              {/* Date of Birth Field */}
              <TextField
                fullWidth
                margin="normal"
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                variant="outlined"
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.dateOfBirth &&
                  Boolean(formik.errors.dateOfBirth)
                }
                helperText={
                  formik.touched.dateOfBirth && formik.errors.dateOfBirth
                }
                InputLabelProps={{ shrink: true }}
                aria-label="Date of Birth"
              />

              {/* Conditional Fields for Patient */}
              {accountType === "patient" && (
                <>
                  {/* Medications Section */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Medications
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <TextField
                        fullWidth
                        label="Add Medication"
                        variant="outlined"
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1,
                          },
                        }}
                        aria-label="Add Medication"
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          handleAddItem(
                            newMedication,
                            setNewMedication,
                            setMedications,
                            medications
                          )
                        }
                        startIcon={<AddIcon />}
                        sx={{
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                          whiteSpace: "nowrap",
                        }}
                        aria-label="Add Medication Button"
                      >
                        Add
                      </Button>
                    </Box>
                    <List>
                      {medications.map((medication, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label={`Delete ${medication}`}
                              onClick={() =>
                                handleRemoveItem(
                                  index,
                                  setMedications,
                                  medications
                                )
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                          sx={{ pl: 0 }}
                        >
                          {medication}
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Medical History Section */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Medical History
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <TextField
                        fullWidth
                        label="Add Medical Condition"
                        variant="outlined"
                        value={newMedicalIssue}
                        onChange={(e) => setNewMedicalIssue(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1,
                          },
                        }}
                        aria-label="Add Medical Condition"
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          handleAddItem(
                            newMedicalIssue,
                            setNewMedicalIssue,
                            setMedicalHistory,
                            medicalHistory
                          )
                        }
                        startIcon={<AddIcon />}
                        sx={{
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                          whiteSpace: "nowrap",
                        }}
                        aria-label="Add Medical Condition Button"
                      >
                        Add
                      </Button>
                    </Box>
                    <List>
                      {medicalHistory.map((issue, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label={`Delete ${issue}`}
                              onClick={() =>
                                handleRemoveItem(
                                  index,
                                  setMedicalHistory,
                                  medicalHistory
                                )
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                          sx={{ pl: 0 }}
                        >
                          {issue}
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Allergies Section */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Allergies
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <TextField
                        fullWidth
                        label="Add Allergy"
                        variant="outlined"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1,
                          },
                        }}
                        aria-label="Add Allergy"
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          handleAddItem(
                            newAllergy,
                            setNewAllergy,
                            setAllergies,
                            allergies
                          )
                        }
                        startIcon={<AddIcon />}
                        sx={{
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                          whiteSpace: "nowrap",
                        }}
                        aria-label="Add Allergy Button"
                      >
                        Add
                      </Button>
                    </Box>
                    <List>
                      {allergies.map((allergy, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label={`Delete ${allergy}`}
                              onClick={() =>
                                handleRemoveItem(
                                  index,
                                  setAllergies,
                                  allergies
                                )
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                          sx={{ pl: 0 }}
                        >
                          {allergy}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </>
              )}

              {/* Conditional Fields for Doctor */}
              {accountType === "doctor" && (
                <>
                  {/* Medical License Number Field */}
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Medical License Number"
                    name="medicalLicenseNumber"
                    variant="outlined"
                    value={formik.values.medicalLicenseNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.medicalLicenseNumber &&
                      Boolean(formik.errors.medicalLicenseNumber)
                    }
                    helperText={
                      formik.touched.medicalLicenseNumber &&
                      formik.errors.medicalLicenseNumber
                    }
                    aria-label="Medical License Number"
                  />

                  {/* State Selection */}
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="state-label">State</InputLabel>
                    <Select
                      labelId="state-label"
                      id="state"
                      name="state"
                      value={formik.values.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.state && Boolean(formik.errors.state)
                      }
                      label="State"
                      sx={{ borderRadius: 1 }}
                      aria-label="State"
                    >
                      {/* Add state options as needed */}
                      <MenuItem value="CA">California</MenuItem>
                      <MenuItem value="NY">New York</MenuItem>
                      <MenuItem value="TX">Texas</MenuItem>
                      <MenuItem value="FL">Florida</MenuItem>
                      <MenuItem value="IL">Illinois</MenuItem>
                      {/* ...other states */}
                    </Select>
                  </FormControl>

                  {/* Specialization Selection */}
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="specialization-label">
                      Specialization
                    </InputLabel>
                    <Select
                      labelId="specialization-label"
                      id="specialization"
                      name="specialization"
                      value={formik.values.specialization}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.specialization &&
                        Boolean(formik.errors.specialization)
                      }
                      label="Specialization"
                      sx={{ borderRadius: 1 }}
                      aria-label="Specialization"
                    >
                      {/* Add specialization options as needed */}
                      <MenuItem value="Cardiology">Cardiology</MenuItem>
                      <MenuItem value="Dermatology">Dermatology</MenuItem>
                      <MenuItem value="Neurology">Neurology</MenuItem>
                      <MenuItem value="Pediatrics">Pediatrics</MenuItem>
                      <MenuItem value="Oncology">Oncology</MenuItem>
                      <MenuItem value="Surgery">Surgery</MenuItem>
                      {/* ...other specializations */}
                    </Select>
                  </FormControl>
                </>
              )}

              {/* Submit Button */}
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                sx={{
                  mt: 4,
                  py: 1.5,
                  borderRadius: 1,
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
                aria-label="Sign Up Button"
              >
                Sign Up
              </Button>
            </form>
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
