'use client'
import {Box, Button, Stack, TextField} from '@mui/material'
import {useState} from 'react'

export default function Chatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const sendMessage = async () => {
    if (input) {
      setMessages([...messages, {role: 'user', content: input}])
      setInput('')

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(messages),
      })

      const reader = response.body.getReader()
      let result = await reader.read()
      let text = ''

      while (!result.done) {
        text += new TextDecoder().decode(result.value)
        result = await reader.read()
      }

      setMessages([...messages, {role: 'system', content: text}])
    }
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'white'}}>
      <Box sx={{flex: 1, overflowY: 'auto', p: 2}}>
        {messages.map((message, index) => (
          <Box key={index} sx={{textAlign: message.role === 'system' ? 'center' : 'right'}}>
            <Stack direction="row" spacing={1}>
              <TextField variant="outlined" value={message.content} disabled />
            </Stack>
          </Box>
        ))}
      </Box>
      <Stack direction="row" spacing={1} sx={{p: 2}}>
        <TextField
          variant="outlined"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={(event) => event.key === 'Enter' && sendMessage()}
        />
        <Button variant="contained" onClick={sendMessage}>
          Send
        </Button>
      </Stack>
    </Box>
  )
}