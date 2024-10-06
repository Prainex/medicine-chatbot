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
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../firebase'; // Adjust the import path as needed
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function DoctorDashboard() {
  const [summaries, setSummaries] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChatName, setCurrentChatName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSummaries, setLoadingSummaries] = useState(true);
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

  // Scroll to bottom whenever chatMessages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  // Fetch summaries from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    const summariesQuery = query(
      collection(db, 'userSummaries'),
      orderBy('createdAt', 'desc') // Fetch all summaries ordered by creation time
    );

    const unsubscribe = onSnapshot(
      summariesQuery,
      (snapshot) => {
        const fetchedSummaries = [];
        snapshot.forEach((doc) => {
          fetchedSummaries.push({ id: doc.id, ...doc.data() });
        });
        setSummaries(fetchedSummaries);
        setLoadingSummaries(false);
      },
      (error) => {
        console.error('Error fetching summaries:', error);
        setSnackbarMessage('Error fetching summaries: ' + error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoadingSummaries(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  // Fetch chat messages for the selected chat
  useEffect(() => {
    if (!currentChatId) {
      setChatMessages([]);
      setCurrentChatName('');
      return;
    }

    const chatDocRef = doc(db, 'chats', currentChatId);

    const unsubscribe = onSnapshot(
      chatDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const chatData = docSnap.data();
          setChatMessages(chatData.messages || []);
          setCurrentChatName(chatData.name || `Chat with User`);
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
  }, [currentChatId]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSelectSummary = async (summary) => {
    const { chatId, userId } = summary;

    if (chatId) {
      // Chat already exists
      setCurrentChatId(chatId);
    } else {
      // Create a new doctor-patient chat
      try {
        const newChat = await addDoc(collection(db, 'chats'), {
          chatType: 'doctor-patient',
          userId: userId,
          doctorId: auth.currentUser.uid,
          name: `Chat with User ${userId}`,
          messages: [
            { role: 'doctor', content: 'Hello, how can I assist you today?' },
          ],
          createdAt: serverTimestamp(),
        });

        // Update the summary document with the new chatId
        const summaryDocRef = doc(db, 'userSummaries', summary.id);
        await updateDoc(summaryDocRef, {
          chatId: newChat.id,
        });

        setCurrentChatId(newChat.id);
        setSnackbarMessage('New chat started successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error starting new chat:', error);
        setSnackbarMessage('Error starting new chat: ' + error.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages
    if (!currentChatId) {
      setSnackbarMessage('Please select a chat first.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const doctorMessage = { role: 'doctor', content: message };
    setChatMessages((prevMessages) => [...prevMessages, doctorMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Directly update Firestore without sending to AI
      const chatDocRef = doc(db, 'chats', currentChatId);
      await updateDoc(chatDocRef, {
        messages: [...chatMessages, doctorMessage],
      });
    } catch (error) {
      console.error('Failed to send message:', error);
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
              Doctor Dashboard
            </Typography>
          </ButtonBase>
          <Button color="inherit" onClick={() => router.push('/doctor/profile')}>
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
              <Typography variant="h6">Summaries</Typography>
              {/* You can add additional buttons here if needed */}
            </Box>
            {loadingSummaries ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {summaries.map((summary) => (
                  <ListItem
                    key={summary.id}
                    button
                    onClick={() => handleSelectSummary(summary)}
                    sx={{
                      mb: 1,
                      borderRadius: '10px',
                      backgroundColor: '#f0f0f0',
                      '&:hover': {
                        backgroundColor: '#e0f7fa',
                      },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Aliments
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {summary.issueTitle || 'No Title'}
                      </Typography>
                    </Box>
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
          {currentChatId ? (
            <Stack
              direction="column"
              flex={1}
              spacing={2}
              overflow="hidden"
              height="100%"
            >
              {/* Chat Header */}
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6">{currentChatName}</Typography>
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
                  gap: 1,
                }}
              >
                {chatMessages.map((msg, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent={msg.role === 'doctor' ? 'flex-end' : 'flex-start'}
                    mb={0.5}
                  >
                    <Box
                      bgcolor={msg.role === 'doctor' ? 'secondary.main' : 'primary.main'}
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
                      <Typography variant="body1">Sending...</Typography>
                    </Box>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                Select a summary to start chatting
              </Typography>
              {/* You can add additional buttons or instructions here */}
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
