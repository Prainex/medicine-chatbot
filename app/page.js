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
        
        {/*Login button*/}
          <Button 
          sx = {{ color : 'red', 
            marginLeft : 'auto',
            padding: '12px 24px', 
            fontSize: '16px', 
            minWidth: '150px', 
            height: '50px', 
            border: '2px solid red',
            borderRadius: '8px',
            marginRight: '16px',
            transition: 'transform 0.3s ease', // Smooth transition effect
            '&:hover': {
              transform: 'scale(1.1)', // Zoom in by 10% when hovered
            }
          }}
          onClick={() => router.push('/login')  }>
            Login
          </Button>

          {/*Sign Up button*/}

          <Button 
          sx = {{ color : 'red',
            padding: '12px 24px', 
            fontSize: '16px', 
            minWidth: '150px', 
            height: '50px',
            border: '2px solid red',
            borderRadius: '8px',
            marginLeft: '16px',
            transition: 'transform 0.3s ease', // Smooth transition effect
            '&:hover': {
            transform: 'scale(1.1)', // Zoom in by 10% when hovered
      }
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

          {/*Drop down menu*/}
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
        backgroundImage: 'url(https://raw.githubusercontent.com/Prainex/medicine-chatbot/44250c31c5119dec475cd526fb8cd46118ba051d/public/images/iStock-1255213445.jpg)',
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

      <Container sx={{ textAlign: 'center', 
        position: 'relative', 
        zIndex: 2,  
        textAlign: 'center',
        mt: 5 
      }}>

        {/*Text in the Middle*/}
        <Typography 
        variant="h2" 
        gutterBottom
        sx={{
        color: 'black',  // Set inner text color to black
        WebkitTextStroke: '2px white',  // White outline (2px thick)
        fontWeight: 'bold',  // Optional: Makes text bold
        }}      
        >
        Health Support Wherever You Are
        </Typography>
        <Typography variant="h5" 
        align="center"
        sx={{ color: 'white' }}
          >
          Providing AI-powered medical advice and access to real doctors.
        </Typography>
        <div style={{ textAlign: 'center' }}>

          {/*Chat now*/}
  <Button 
    variant="contained" 
    color="primary" 
    onClick={() => router.push('/signup')}
    sx={{
      padding: '16px 32px', // Increase padding to make the button bigger
      fontSize: '18px',      // Increase font size for bigger text
      marginTop: '20px',     // Move the button lower
      transition: 'transform 0.3s ease', // Smooth transition effect
      '&:hover': {
        transform: 'scale(1.1)', // Zoom in by 10% when hovered
      },
    }}
  >
    Chat Now
  </Button>
</div>
      </Container>
      </Box>
      </Box>
  );
} 
//test
