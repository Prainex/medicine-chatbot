'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Box,
  Button,
  Stack,
  Typography,
  AppBar,
  Toolbar,
  List,
  ListItem,
  Paper,
  IconButton,
  Tooltip,
  Drawer,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const theme = useTheme();

  // Snackbar State
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
          { role: 'doctor', content: 'Hello, what can I help you with today?' },
        ],
        createdAt: serverTimestamp(),
      });
      setSelectedChatId(newChat.id);
      setShowChat(true);
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
      const response = await fetch('/api/chat', {
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
      event.preventDefault();
      sendMessage();
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteDoc(doc(db, 'chats', chatId));
      if (chatId === selectedChatId) {
        setSelectedChatId(null);
        setMessages([]);
        setSelectedChatName('');
        setShowChat(false);
      }
      setSnackbarMessage('Chat deleted successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
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
    setShowChat(true);
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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: theme.palette.primary.main, borderBottom: '1px solid #e0e0e0' }}>
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
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Doctor Portal
          </Typography>
          <Button color="inherit" onClick={() => router.push('/user/profile')}>
            Profile
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 250,
              position: 'absolute',
              top: '64px',
              height: 'calc(100vh - 64px)',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                      '&:hover': { backgroundColor: '#FFF4F2' },
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {chat.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {chat.messages?.[chat.messages.length - 1]?.content || 'No messages'}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
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

        <Box sx={{ flexGrow: 1, p: 3 }}>
          {!showChat ? (
            // Dashboard Content
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                Welcome to Your Doctor Portal
              </Typography>
              
              <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                  <Typography fontWeight="bold">Type</Typography>
                  <Typography fontWeight="bold">Summary</Typography>
                  <Typography fontWeight="bold">Date</Typography>
                </Box>
                {[
                  { type: "Consultation", summary: "General checkup", date: "2024-10-06" },
                  { type: "Prescription", summary: "Medication refill", date: "2024-10-05" },
                  { type: "Test Results", summary: "Blood work review", date: "2024-10-04" }
                ].map((item, index) => (
                  <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                      <Typography>{item.type}</Typography>
                      <Typography>{item.summary}</Typography>
                      <Typography>{item.date}</Typography>
                    </Box>
                  </Paper>
                ))}
              </Paper>

              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleNewChat}
                sx={{ display: 'block', mx: 'auto' }}
              >
                Start New Consultation
              </Button>
            </Box>
          ) : (
            // Chat Interface
            <Stack direction="column" spacing={2} height="100%">
              <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6">{selectedChatName || 'Chat'}</Typography>
              </Paper>

              <Box
                flex={1}
                overflow="auto"
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                  boxShadow: 3,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {messages.map((msg, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent={msg.role === 'doctor' ? 'flex-start' : 'flex-end'}
                    mb={0.5}
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
                      <Typography variant="body1">Doctor is typing...</Typography>
                    </Box>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Type your message"
                  variant="outlined"
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  multiline
                  maxRows={4}
                  sx={{ backgroundColor: 'white' }}
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
          )}
        </Box>
      </Box>

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
    </>
  );
}