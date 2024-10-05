'use client'
import React, { useState } from 'react';
import { Container, Typography, AppBar, Toolbar, Button, Box, List, ListItem, ListItemText, ButtonBase, Drawer, IconButton, Tooltip, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation'; // Use 'next/navigation' for routing in App Router

export default function PatientDashboard() {
  const chats = [
    { id: 1, name: 'Chat 1', message: 'Hello there!' },
    { id: 2, name: 'Chat 2', message: 'How are you?' },
    { id: 3, name: 'Chat 3', message: 'Let’s catch up.' },
    // Add more chats as needed
  ];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNewChat = () => {
    // Handle creating a new chat
    console.log("New chat created");
  };

  return (
    <>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <ButtonBase onClick={() => router.push('/')}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Telemedicine App
            </Typography>
          </ButtonBase>
          <Button color="inherit" onClick={() => router.push('/profile')}>
            Profile
          </Button>
          <Button color="inherit" onClick={() => router.push('/')}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              position: 'absolute',
              top: '64px',
              height: 'calc(100vh - 64px)',
              borderRight: '1px solid #e0e0e0',
              width: '250px',
            },
          }}
        >
          <Box sx={{ width: '100%', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ textAlign: 'center', flexGrow: 1 }}>Chats</Typography>
              <Tooltip title="New Chat">
                <IconButton color="primary" onClick={handleNewChat}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <List>
              {chats.map((chat) => (
                <ListItem
                  key={chat.id}
                  button
                  sx={{
                    mb: 0.5,
                    borderRadius: '10px',
                    backgroundColor: '#f0f0f0',
                    '&:hover': {
                      backgroundColor: '#FFF4F2', // Custom hover color
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    p: 2,
                  }}
                  onClick={() => console.log(`Chat ${chat.id} selected`)}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{chat.name}</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{chat.message}</Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, mt: 8, overflowY: 'auto' }}>
          {/* Patient Dashboard */}
          <Container sx={{ textAlign: 'center', mt: 0 }}>
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
