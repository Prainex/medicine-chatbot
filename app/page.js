'use client'
import { useState } from 'react';
import { Container, Button, AppBar, Toolbar, Typography, Box, ButtonBase, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Correct import for MenuIcon
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MailOutlineIcon from '@mui/icons-material/MailOutline'; // Example icon
import CreateIcon from '@mui/icons-material/Create'; // Example icon
import BuildIcon from '@mui/icons-material/Build'; // Example icon

export default function Home() {
  const router = useRouter(); // This will work correctly in the App Router now

  {/*The drop down menu functions, can delete if the menu is not needed*/}
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

          <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: '16px' }}> {/* Adds 16px gap between elements */}
  <Button
    sx={{
      color: 'white',
      backgroundColor: 'red',
      fontSize: '1.1rem',
      padding: '8px 16px',
      transition: 'transform 0.3s ease', // Smooth transition
    '&:hover': {
      backgroundColor: 'darkred', // Optional: Darker red on hover
      transform: 'scale(1.1)', // Zoom in on hover
    },
    }}
    onClick={() => router.push('/login')}
  >
    Login
  </Button>

  <Button
    sx={{
      color: 'white',
      backgroundColor: 'red',
      fontSize: '1.1rem',
      padding: '8px 16px',
      transition: 'transform 0.3s ease', // Smooth transition
    '&:hover': {
      backgroundColor: 'darkred', // Optional: Darker red on hover
      transform: 'scale(1.1)', // Zoom in on hover
    },
    }}
    onClick={() => router.push('/signup')}
  >
    Sign Up
  </Button>

  {/*The Drop Down Menu*/}
</Box>
      <IconButton
        edge="end"
        color="inherit"
        aria-label="menu"
        onClick={MenuOpen}
        sx={{ color: 'red', ml: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="Menu-Appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={MenuClose}
      >
        <MenuItem onClick={MenuClose}>Patient</MenuItem>
        <MenuItem onClick={MenuClose}>Doctor</MenuItem>
      </Menu>
    </Box>
        </Toolbar>
      </AppBar>

      {/* Landing Page Content */}
      <Box
      sx={{
        position: 'relative', // To layer the background and content properly
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `
          radial-gradient(circle, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.7) 100%),
          url('https://nmcdn.io/e186d21f8c7946a19faed23c3da2f0da/2198139c60484547ac05dbaa326cedbb/files/stethoscope-and-phone-main-process-sc720x385-t1603819654.jpg?v=5d0a09a3c3')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.8)',  // Optional: Apply a slight dimming to the background
      }}
      > 

      <Container sx={{ textAlign: 'center', mt: 5}}>
      <Box
      sx={{
        mt: 10,  // Adjust this value to move the text lower
      }}
>
  {/*The Text in the middle*/}
  <Typography
    variant="h3"
    gutterBottom
    sx={{
      fontSize: '5rem',
      color: 'white',
      fontWeight: 'bold',
    }}
  >
    Healthcare Wherever You Are.
  </Typography>
</Box>
        <Typography
  variant="h5"
  align="center"
  sx={{
    color: 'white', // Sets the text color to white
  }}
>
  Providing AI-powered medical advice and access to real doctors.
</Typography>
        <div style={{ textAlign: 'center' }}>
        <Button
  variant="contained"
  color="primary"
  onClick={() => router.push('/signup')}
  sx={{
    color: 'white',
    backgroundColor: 'red',
    fontSize: '2rem',
    padding: '8px 16px',
    marginTop: '16px', // Move the button down
    transition: 'transform 0.3s ease', // Smooth transition
    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.3)',
    '&:hover': {
      backgroundColor: 'darkred', // Optional: Darker red on hover
      transform: 'scale(1.1)', // Zoom in on hover
    },
  }}
>
  Chat Now
</Button>

      </div>
        </Container>
      </Box>
      {/* Circular Buttons Section */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        mt: 5,
        width: '100%',
        maxWidth: '1200px',
        mx: 'auto',
        px: 3,
        pb: 10,
      }}
    >
      {/* Button 1 */}
      <Box sx={{ 
        textAlign: 'center', 
        maxWidth: '300px',
        pb: 4,
        pr: 8, // Add padding-right for spacing from the border
        borderRight: '2px solid rgba(255,0,0,0.2)', // Faint red line
         }}>
        <Link href="/page1" passHref>
          <Button
            component="a"
            sx={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#d90429',
              color: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'transform 0.3s ease',
              '&:hover': {
                backgroundColor: 'darkred',
                transform: 'scale(1.1)',
              },
            }}
          >
            <MailOutlineIcon fontSize="large" /> {/* Replace with the appropriate icon */}
          </Button>
        </Link>
        <Typography variant="h6" sx={{ mt: 2 }}>
          This Is Important
        </Typography>
        <Typography variant="body2" sx={{ color: 'gray' }}>
          Contact us?.. Maybe ... Call me... Whatever
        </Typography>
      </Box>

      {/* Button 2 */}
      <Box sx={{ textAlign: 'center', 
        maxWidth: '300px',
        pb: 8,
        pr: 8, // Add padding-right for spacing from the border
        borderRight: '2px solid rgba(255,0,0,0.2)', // Faint red line
        }}>
        <Link href="/page2" passHref>
          <Button
            component="a"
            sx={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#d90429',
              color: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'transform 0.3s ease',
              '&:hover': {
                backgroundColor: 'darkred',
                transform: 'scale(1.1)',
              },
            }}
          >
            <CreateIcon fontSize="large" /> {/* Replace with the appropriate icon */}
          </Button>
        </Link>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Also Important
        </Typography>
        <Typography variant="body2" sx={{ color: 'gray' }}>
          This and that and bla bla bla
        </Typography>
      </Box>

      {/* Button 3 */}
      <Box sx={{ textAlign: 'center', 
        maxWidth: '300px',
         }}>
        <Link href="/page3" passHref>
          <Button
            component="a"
            sx={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#d90429',
              color: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'transform 0.3s ease',
              '&:hover': {
                backgroundColor: 'darkred',
                transform: 'scale(1.1)',
              },
            }}
          >
            <BuildIcon fontSize="large" /> {/* Replace with the appropriate icon */}
          </Button>
        </Link>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Probably Important
        </Typography>
        <Typography variant="body2" sx={{ color: 'gray' }}>
          Settings yk... The important stuff
        </Typography>
        </Box>
      </Box>
    </Box>
  );
}
