'use client'
import React from 'react';
import { Container, Typography, AppBar, Toolbar, Button, Box, List, ListItem, ListItemText } from '@mui/material';

export default function PatientDashboard() {
  const chats = [
    { id: 1, name: 'Chat 1' },
    { id: 2, name: 'Chat 2' },
    { id: 3, name: 'Chat 3' },
    // Add more chats as needed
  ];

  return (
    <>
      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Telemedicine App
          </Typography>
          <Button color="inherit" onClick={() => navigate('/profile')}>
            Profile
          </Button>
          <Button color="inherit" onClick={() => navigate('/')}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
        <Box sx={{ width: '250px', backgroundColor: '#f4f4f4', p: 2, mt: 1 }}>
          <Typography variant="h6">Chats</Typography>
          <List>
            {chats.map((chat) => (
              <ListItem button key={chat.id}>
                <ListItemText primary={chat.name} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, mt: 0 }}>
          {/* Patient Dashboard */}
          <Container sx={{ textAlign: 'center', mt: 5 }}>
            <Typography variant="h4" gutterBottom>
              Welcome to Your Dashboard
            </Typography>
            <Typography variant="body1">
              Here you can manage your profile, participate in chats, and more.
            </Typography>
            {/* Add more components or links to other pages as needed */}
          </Container>
        </Box>
      </Box>
    </>
  );
}
