'use client'
import React, { useState, useEffect } from 'react';
import { Container, Typography, AppBar, Toolbar, Button, Box, List, ListItem, ListItemText, ButtonBase, Drawer, IconButton, Tooltip, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

export default function PatientDashboard() {
    const [chats, setChats] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const router = useRouter();
    const theme = useTheme();
  
    // Load chats from local storage when the component mounts
    useEffect(() => {
      const loadChats = () => {
        try {
          const savedChats = JSON.parse(localStorage.getItem('chats')) || [];
          setChats(savedChats);
        } catch (error) {
          console.error("Error loading chats from local storage", error);
          setChats([]);
        }
      };
  
      loadChats();
    }, []);
  
    // Save chats to local storage whenever they are updated
    useEffect(() => {
      if (chats.length > 0) {
        localStorage.setItem('chats', JSON.stringify(chats));
      }
    }, [chats]);
  
    const handleDrawerToggle = () => {
      setDrawerOpen(!drawerOpen);
    };
  
    const handleNewChat = () => {
      const newChat = {
        id: chats.length + 1,
        name: `Chat ${chats.length + 1}`,
        message: 'New chat created',
      };
      setChats([...chats, newChat]);
      // Explicitly save to localStorage after adding new chat
      localStorage.setItem('chats', JSON.stringify([...chats, newChat]));
    };
  
    const handleDeleteChat = (chatId) => {
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      // Explicitly save to localStorage after deletion
      if (updatedChats.length > 0) {
        localStorage.setItem('chats', JSON.stringify(updatedChats));
      } else {
        localStorage.removeItem('chats');
      }
    };
  
    return (
      <>
        {/* Navigation Bar */}
        <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Button onClick={() => router.push('/')}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Telemedicine App
              </Typography>
            </Button>
            <Button color="inherit" onClick={() => router.push('/user/profile')}>
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
              keepMounted: true,
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
                        backgroundColor: '#FFF4F2',
                      },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{chat.name}</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{chat.message}</Typography>
                    </Box>
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }} 
                      edge="end" 
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
  
          {/* Main Content */}
          <Box sx={{ flexGrow: 1, mt: 8, overflowY: 'auto' }}>
            <Container sx={{ textAlign: 'center', mt: 0 }}>
              <Typography variant="h4" gutterBottom>
                Welcome to Your Dashboard
              </Typography>
              <Typography variant="body1">
                Here you can manage your profile, speak to patients, and more.
              </Typography>
            </Container>
          </Box>
        </Box>
      </>
    );
}