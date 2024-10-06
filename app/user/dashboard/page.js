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
  const [isDoctorRequested, setIsDoctorRequested] = useState(false); // Tracks if a doctor has been requested
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
      setIsDoctorRequested(false); // Reset doctor request state when no chat is selected
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

          // Check if a real doctor has been requested
          if (chatData.isDoctorActive) {
            setIsDoctorRequested(true);
          } else {
            setIsDoctorRequested(false);
          }
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
          { role: 'assistant', content: 'Hello, what brings you in today?' }, // Consistent role
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

  /**
   * Handles the action when a patient requests to talk to a real doctor.
   * It summarizes the conversation and sets the flag to stop AI responses.
   */
  const talkToRealDoctor = async () => {
    if (!selectedChatId) {
      setSnackbarMessage('Please select a chat first.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    if (messages.length === 0) {
      setSnackbarMessage('No messages to summarize.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the summary and issueTitle prompt
      const summaryPrompt =
        'Please summarize the conversation so far to be reviewed by a doctor and provide a brief 2-3 word issue title in the following JSON format:\n{\n  "summary": "Your summary here.",\n  "issueTitle": "Title here"\n}';

      // Create a summary message
      const summaryMessage = { role: 'user', content: summaryPrompt };

      // Send the summary prompt to the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: selectedChatId, // Include chatId
          messages: [...messages, summaryMessage].map((msg) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Summary Response:', data.message);

        const aiResponse = data.message;

        // Parse the summary and issueTitle
        let summary = '';
        let issueTitle = '';

        try {
          const parsedResponse = JSON.parse(aiResponse);
          summary = parsedResponse.summary || '';
          issueTitle = parsedResponse.issueTitle || '';
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          // Fallback if parsing fails
          summary = aiResponse;
          issueTitle = 'No Title';
        }

        // Upload the summary and issueTitle to Firebase under 'userSummaries'
        const user = auth.currentUser;
        if (!user) {
          setSnackbarMessage('User not authenticated.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }

        // Add to 'userSummaries' collection
        await addDoc(collection(db, 'userSummaries'), {
          userId: user.uid,
          chatId: selectedChatId,
          summary: summary,
          issueTitle: issueTitle,
          isDoctorActive: true, // Set to true since doctor is being requested
          createdAt: serverTimestamp(),
        });

        // Update the chat to indicate that a doctor has been requested
        const chatDocRef = doc(db, 'chats', selectedChatId);
        await updateDoc(chatDocRef, {
          isDoctorActive: true,
        });

        // Set the local state to disable AI responses but allow communication with the doctor
        setIsDoctorRequested(true);

        setSnackbarMessage('A real doctor has been requested and will assist you shortly.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        const errorData = await response.json();
        console.error('Error from API:', errorData.error);
        setSnackbarMessage('Error summarizing conversation: ' + errorData.error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      setSnackbarMessage('Error summarizing conversation: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages
    if (!selectedChatId) {
      setSnackbarMessage('Please select or create a chat first.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const userMessage = { role: 'user', content: message };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      if (isDoctorRequested) {
        // If a real doctor has been requested, do not send to AI
        // Directly update Firestore with the user's message
        await updateDoc(doc(db, 'chats', selectedChatId), {
          messages: [...messages, userMessage],
        });

        setSnackbarMessage('A real doctor will respond to your message.');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
      } else {
        // Send the message to the API endpoint
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId: selectedChatId, // Include chatId
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: msg.content,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Assistant Response:', data.message);

          const assistantMessage = { role: 'assistant', content: data.message };
          // Update the messages state
          setMessages((prevMessages) => [...prevMessages, assistantMessage]);

          // Update Firestore with the new messages
          await updateDoc(doc(db, 'chats', selectedChatId), {
            messages: [...messages, userMessage, assistantMessage],
          });
        } else {
          const errorData = await response.json();
          console.error('Error from API:', errorData.error);
          setSnackbarMessage('Error from assistant: ' + errorData.error);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          // Optionally, add an error message to the chat
          const errorAssistantMessage = { role: 'assistant', content: 'Sorry, something went wrong.' };
          setMessages((prevMessages) => [...prevMessages, errorAssistantMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        // Find the last assistant message to update with error
        const lastAssistantIndex = updatedMessages
          .map((msg) => msg.role)
          .lastIndexOf('assistant');
        if (lastAssistantIndex !== -1) {
          updatedMessages[lastAssistantIndex].content = 'Sorry, something went wrong.';
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
        setIsDoctorRequested(false); // Reset doctor request state
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

  if (loadingChats) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
          <ButtonBase
            onClick={() => router.push('/')}
            sx={{ textTransform: 'none', color: theme.palette.common.white }}
          >
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
                    justifyContent={
                      msg.role === 'assistant' || msg.role === 'doctor' ? 'flex-start' : 'flex-end'
                    }
                    mb={0.5} // Reduced margin-bottom for closer messages
                  >
                    <Box
                      bgcolor={
                        msg.role === 'assistant'
                          ? 'primary.main'
                          : msg.role === 'doctor'
                          ? 'info.main'
                          : 'secondary.main'
                      }
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
                  disabled={false} // Always enable input
                  helperText={isDoctorRequested ? 'A real doctor will assist you shortly.' : ''}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={sendMessage}
                  disabled={isLoading} // Only disable when loading
                >
                  Send
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<SaveIcon />}
                  onClick={talkToRealDoctor}
                  disabled={isLoading || isDoctorRequested || messages.length === 0}
                >
                  {isDoctorRequested ? 'Doctor Requested' : 'Talk to a Real Doctor'}
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
