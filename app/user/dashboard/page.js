'use client';
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
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../firebase'; // Adjust the import path as needed
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function PatientDashboard() {
  const [chats, setChats] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChatName, setSelectedChatName] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const theme = useTheme();

  // Snackbar State
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch chats from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    const chatsQuery = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        const fetchedChats = [];
        snapshot.forEach((doc) => {
          fetchedChats.push({ id: doc.id, ...doc.data() });
        });
        setChats(fetchedChats);
        setLoadingChats(false);
      },
      (error) => {
        console.error('Error fetching chats:', error);
        setSnackbarMessage('Error fetching chats: ' + error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoadingChats(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  // Fetch messages for the selected chat
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      setSelectedChatName('');
      return;
    }

    const chatDocRef = doc(db, 'chats', selectedChatId);

    const unsubscribe = onSnapshot(
      chatDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const chatData = docSnap.data();
          setMessages(chatData.messages || []);
          setSelectedChatName(chatData.name || `Chat ${selectedChatId}`);
        } else {
          console.error('No chat data found');
          setSnackbarMessage('Selected chat does not exist.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      },
      (error) => {
        console.error('Error fetching chat messages:', error);
        setSnackbarMessage('Error fetching chat messages: ' + error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    );

    return () => unsubscribe();
  }, [selectedChatId]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNewChat = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const newChat = await addDoc(collection(db, 'chats'), {
        userId: user.uid,
        name: `Chat ${chats.length + 1}`,
        messages: [
          { role: 'doctor', content: 'Hello, what brings you in today?' },
        ],
        createdAt: serverTimestamp(),
      });
      // Automatically select the new chat
      setSelectedChatId(newChat.id);
      setSnackbarMessage('New chat created successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error creating new chat:', error);
      setSnackbarMessage('Error creating new chat: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (!selectedChatId) {
      setSnackbarMessage('Please select or create a chat first.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const userMessage = { role: 'user', content: message };
    const doctorMessage = { role: 'doctor', content: '' };

    setMessages((prevMessages) => [...prevMessages, userMessage, doctorMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Call OpenAI API
      const response = await fetch('/api/chat', {  // You'll need to create this API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role === 'doctor' ? 'assistant' : 'user',
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from OpenAI');
      }

      const data = await response.json();
      const aiResponse = data.message;

      // Update the doctor's message in the state
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastDoctorIndex = updatedMessages
          .map((msg) => msg.role)
          .lastIndexOf('doctor');
        if (lastDoctorIndex !== -1) {
          updatedMessages[lastDoctorIndex].content = aiResponse;
        }
        return updatedMessages;
      });

      // Update Firestore with the new messages
      const chatDocRef = doc(db, 'chats', selectedChatId);
      await updateDoc(chatDocRef, {
        messages: [...messages, userMessage, { role: 'doctor', content: aiResponse }],
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastDoctorIndex = updatedMessages
          .map((msg) => msg.role)
          .lastIndexOf('doctor');
        if (lastDoctorIndex !== -1) {
          updatedMessages[lastDoctorIndex].content = 'Sorry, something went wrong.';
        }
        return updatedMessages;
      });
      setSnackbarMessage('Failed to send message: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteDoc(doc(db, 'chats', chatId));
      // If the deleted chat was selected, clear the chatbox
      if (chatId === selectedChatId) {
        setSelectedChatId(null);
        setMessages([]);
        setSelectedChatName('');
        setSnackbarMessage('Chat deleted successfully.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Chat deleted successfully.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      setSnackbarMessage('Error deleting chat: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSelectChat = (chatId, chatName) => {
    setSelectedChatId(chatId);
    setSelectedChatName(chatName);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setSnackbarMessage('Error signing out: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Snackbar Handler
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {/* Navigation Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: theme.palette.primary.main, borderBottom: '1px solid #e0e0e0' }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <ButtonBase onClick={() => router.push('/')} sx={{ textTransform: 'none', color: theme.palette.common.white }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Telemedicine App
            </Typography>
          </ButtonBase>
          <Button color="inherit" onClick={() => router.push('/user/profile')}>
            Profile
          </Button>
          <Button color="inherit" onClick={handleLogout}>
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6">Chats</Typography>
              <Tooltip title="New Chat">
                <IconButton color="primary" onClick={handleNewChat}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {loadingChats ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {chats.map((chat) => (
                  <ListItem
                    key={chat.id}
                    button
                    selected={chat.id === selectedChatId}
                    onClick={() => handleSelectChat(chat.id, chat.name)}
                    sx={{
                      mb: 1,
                      borderRadius: '10px',
                      backgroundColor: chat.id === selectedChatId ? '#e0f7fa' : '#f0f0f0',
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
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {chat.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {chat.messages.length > 0
                          ? chat.messages[chat.messages.length - 1].content
                          : 'No messages yet'}
                      </Typography>
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
            )}
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            bgcolor: '#f5f5f5',
          }}
        >
          {selectedChatId ? (
            <Stack
              direction="column"
              flex={1}
              spacing={2}
              overflow="hidden"
              height="100%"
            >
              {/* Chat Header */}
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6">{selectedChatName}</Typography>
              </Paper>

              {/* Chat Messages */}
              <Box
                flex={1}
                overflow="auto"
                p={2}
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                  boxShadow: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1, // Reduced gap between messages
                }}
              >
                {messages.map((msg, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent={msg.role === 'doctor' ? 'flex-start' : 'flex-end'}
                    mb={0.5} // Reduced margin-bottom for closer messages
                  >
                    <Box
                      bgcolor={msg.role === 'doctor' ? 'primary.main' : 'secondary.main'}
                      color="white"
                      borderRadius={2}
                      p={2}
                      maxWidth="70%"
                      sx={{
                        wordWrap: 'break-word',
                        boxShadow: 1,
                      }}
                    >
                      <Typography variant="body1">{msg.content}</Typography>
                    </Box>
                  </Box>
                ))}
                {isLoading && (
                  <Box display="flex" justifyContent="flex-start" mb={0.5}>
                    <Box
                      bgcolor="primary.main"
                      color="white"
                      borderRadius={2}
                      p={2}
                      maxWidth="70%"
                    >
                      <Typography variant="body1">Typing...</Typography>
                    </Box>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ display: 'flex', gap: 2 }}>
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
              </Box>
            </Stack>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Select a chat to start messaging
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewChat}
              >
                Start New Chat
              </Button>
            </Box>
          )}
        </Box>

        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
