"use client"; // Correctly placed 'use client' directive

import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'doctor', content: 'Hello, what brings you in today?' }
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Function to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f5f5f5"
    >
      <Stack
        direction="column"
        width="500px"
        height="700px"
        border="1px solid #ccc"
        borderRadius={2}
        p={2}
        spacing={2}
        bgcolor="#ffffff"
      >
        {/* Chat Messages */}
        <Box
          flex={1}
          overflow="auto"
          p={1}
          sx={{ scrollbarWidth: 'none' }}
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
  );
}
