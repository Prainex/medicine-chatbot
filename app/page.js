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
          sx = {{ color : 'red', ml : 'right' }}
          onClick={() => router.push('/login')}>
            Login
          </Button>
          <Button 
          sx = {{ color : 'red' }}
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
        backgroundImage: 'url(https://nmcdn.io/e186d21f8c7946a19faed23c3da2f0da/2198139c60484547ac05dbaa326cedbb/files/stethoscope-and-phone-main-process-sc720x385-t1603819654.jpg?v=5d0a09a3c3)',
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
