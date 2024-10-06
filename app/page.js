'use client'
import { useState } from 'react';
import { Container, Button, AppBar, Toolbar, Typography, Box, ButtonBase, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Correct import for MenuIcon
import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter(); // This will work correctly in the App Router now


  //Controlling the Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  //Handler to open menu
  const MenuOpen = (event) => {setAnchorEl(event.currentTarget);}
  
  //Handler to close menu
  const MenuClose = () => {setAnchorEl(null);}
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    {/* Navigation Bar */}
      <AppBar position="static" sx ={{ backgroundColor: 'white'}}>
        <Toolbar>
        <ButtonBase onClick={() => router.push('/')}>
              < Typography variant="h5" sx={{ flexGrow: 1, color: 'red' }}>
              Telemedicine App
            </Typography>
          </ButtonBase>

          <Button 
          sx = {{ color : 'red', 
            marginLeft : 'auto',
            padding: '12px 24px', 
            fontSize: '16px', 
            minWidth: '150px', 
            height: '50px', 
            border: '2px solid red',
            borderRadius: '8px',
            marginRight: '16px'}}
          onClick={() => router.push('/login')  }>
            Login
          </Button>
          <Button 
          sx = {{ color : 'red',
            padding: '12px 24px', 
            fontSize: '16px', 
            minWidth: '150px', 
            height: '50px',
            border: '2px solid red',
            borderRadius: '8px',
            marginLeft: '16px',
           }}
          onClick={() => router.push('/signup')}>
            Sign Up
          </Button>
          <IconButton
          edge = "end"
          color = "inherit"
          aria-label = "menu"
          onClick = {MenuOpen}
          sx ={{ color: 'red', ml : 2}}
          >

            <MenuIcon/>
            </IconButton>
            <Menu
            id = "Menu-Appbar"
            anchorEl = {anchorEl}
            anchorOrigin={{
              vertical : 'top',
              horizontal : 'right'
            }}

            keepMounted
            transformOrigin = {{
              vertical : 'top',
              horizontal :'right'
            }}
            open ={open}
            onClose = {MenuClose}
            >
              <MenuItem onClick = {MenuClose} > Patient </MenuItem>
              <MenuItem onClick = {MenuClose} > Doctor </MenuItem>
             </Menu>

        </Toolbar>
      </AppBar>

      {/* Landing Page Content */}
      
      <Box
      sx={{
        backgroundImage: 'url(https://github.com/Prainex/medicine-chatbot/blob/main/public/images/iStock-1255213445.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        minHeight: '100vh',
        filter: 'brightness(0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      > 

      <Container sx={{ textAlign: 'center', mt: 5}}>
        <Typography variant="h3" gutterBottom>
          Welcome to Our Telemedicine App
        </Typography>
        <Typography variant="h5" align="center" paragraph>
          Providing AI-powered medical advice and access to real doctors.
        </Typography>
        <div style={{ textAlign: 'center' }}>
          <Button variant="contained" color="primary" onClick={() => router.push('/signup')}>
            Get Started
          </Button>
        </div>
      </Container>
      </Box>
      </Box>
  );
} 
//test
