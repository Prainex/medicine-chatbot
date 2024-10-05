"use client";
// app/page.js
import { AppBar, Toolbar, Typography, Button, Container, ButtonBase } from '@mui/material';
import { useRouter } from 'next/navigation'; // Use 'next/navigation' for routing in App Router

export default function LandingPage() {
  const router = useRouter(); // This will work correctly in the App Router now

  return (
    <>
      <AppBar position="static">
        <Toolbar>
        <ButtonBase onClick={() => router.push('/')}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Telemedicine App
            </Typography>
          </ButtonBase>
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
          <Button variant="contained" color="primary" onClick={() => router.push('/signup')}>
            Get Started
          </Button>
        </div>
      </Container>
    </>
  );
}
