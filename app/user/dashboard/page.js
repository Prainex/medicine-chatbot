'use client'
import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Box,
  Button,
  Stack,
  Container,
  Typography,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  ButtonBase,
  Drawer,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
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
  const [messages, setMessages] = useState([
    { role: 'doctor', content: 'Hello, what brings you in today?' }
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    const userMessage = { role: 'user', content: message };
    const doctorMessage = { role: 'doctor', content: '' };

    setMessages((prevMessages) => [...prevMessages, userMessage, doctorMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, userMessage])
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Update the doctor's message with the response
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        // Find the last doctor message
        const lastDoctorIndex = updatedMessages
          .map((msg) => msg.role)
          .lastIndexOf('doctor');
        if (lastDoctorIndex !== -1) {
          updatedMessages[lastDoctorIndex].content = data.response;
        }
        return updatedMessages;
      });
    } catch (error) {
      console.error('Failed to fetch:', error);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        // Find the last doctor message
        const lastDoctorIndex = updatedMessages
          .map((msg) => msg.role)
          .lastIndexOf('doctor');
        if (lastDoctorIndex !== -1) {
          updatedMessages[lastDoctorIndex].content = 'Sorry, something went wrong.';
        }
        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline in the input
      sendMessage();
    }
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
          <Button onClick={() => router.push('/')} sx={{ textTransform: 'none' }}>
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
        <Box
          sx={{
            flexGrow: 1,
            mt: 2, // Adjusted margin-top
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#f5f5f5',
            p: 2, // Added padding
          }}
        >
          <Stack
            direction="column"
            width={{ xs: '90%', sm: '500px' }}
            maxHeight={{ xs: '80vh', sm: '700px' }}
            border="1px solid #ccc"
            borderRadius={2}
            p={2}
            spacing={2}
            bgcolor="#ffffff"
            boxShadow={3} // Optional
          >
            {/* Chat Messages */}
            <Box
              flex={1}
              overflow="auto"
              p={1}
              sx={{
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={msg.role === 'doctor' ? 'flex-start' : 'flex-end'}
                  mb={1}
                >
                  <Box
                    bgcolor={msg.role === 'doctor' ? 'primary.main' : 'secondary.main'}
                    color="white"
                    borderRadius={2}
                    p={2}
                    maxWidth="80%"
                  >
                    <Typography variant="body1">
                      {msg.content}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {isLoading && (
                <Box
                  display="flex"
                  justifyContent="flex-start"
                  mb={1}
                >
                  <Box
                    bgcolor="primary.main"
                    color="white"
                    borderRadius={2}
                    p={2}
                    maxWidth="80%"
                  >
                    <Typography variant="body1">Typing...</Typography>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Message"
                variant="outlined"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                multiline
                maxRows={4}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={sendMessage}
                disabled={isLoading}
              >
                Send
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
