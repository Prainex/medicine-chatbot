'use client'
import React from 'react';
import { Container, Button, AppBar, Toolbar, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';


export default function Home() {

  const router = useRouter();

  const navigate = (path) => {
    router.push(path);
  };

  return (
    <>
    {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Telemedicine Ap
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button color="inherit" onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>

      {/* Landing Page Content */}
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h3" gutterBottom>
          Welcome to Our Telemedicine App
        </Typography>
        <Typography variant="h6" gutterBottom>
          Providing AI-powered medical advice and access to real doctors.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/chatbot')}
          sx={{ mt: 3 }}
        >
          Get Started
        </Button>
      </Container>
      </>
  );
}
