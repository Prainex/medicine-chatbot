"use client";
// app/page.js
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { useRouter } from 'next/navigation'; // Use 'next/navigation' for routing in App Router

export default function LandingPage() {
  const router = useRouter(); // This will work correctly in the App Router now

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Telemedicine App</Typography>
          <Button color="inherit" onClick={() => router.push('/login')}>
            Login
          </Button>
          <Button color="inherit" onClick={() => router.push('/signup')}>
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Typography variant="h2" align="center" gutterBottom>
          Welcome to Our Telemedicine App
        </Typography>
        <Typography variant="h5" align="center" paragraph>
          Providing AI-powered medical advice and access to real doctors.
        </Typography>
        <div style={{ textAlign: 'center' }}>
          <Button variant="contained" color="primary" onClick={() => router.push('/chatbot')}>
            Get Started
          </Button>
        </div>
      </Container>
    </Box>
  );
}
