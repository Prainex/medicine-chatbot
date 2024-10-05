"use client";
// pages/signup.js
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {
  Container,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [accountType, setAccountType] = useState('user');
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      gender: '',
      age: '',
      medications: '',
      medicalHistory: '',
      allergies: '',
      credentials: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().min(6).required('Required'),
      gender: Yup.string().required('Required'),
      age: Yup.number().min(0).required('Required'),
      ...(accountType === 'doctor' && {
        credentials: Yup.string().required('Credentials are required'),
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
          age: values.age,
        };

        if (accountType === 'user') {
          userData.medications = values.medications;
          userData.medicalHistory = values.medicalHistory;
          userData.allergies = values.allergies;
        } else if (accountType === 'doctor') {
          userData.credentials = values.credentials;
          userData.verified = false; // Will be manually verified
        }

        await setDoc(doc(db, 'users', userId), userData);

        alert('Account created successfully!');
        // Redirect based on account type
        if (accountType === 'user') {
          router.push('/user/dashboard');
        } else if (accountType === 'doctor') {
          alert('Your account is pending verification.');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error signing up:', error);
        alert('Error signing up: ' + error.message);
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
