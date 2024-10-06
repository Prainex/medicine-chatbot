// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF0000', // Customize as needed
    },
    secondary: {
      main: '#ae0000', // Customize as needed
    },

    background: {
        default: '#f5f5f5', // Default background (e.g., body background)
        paper: 'rgba(255, 255, 255, 1)', // Light translucent background for glassmorphism
      },


  },
  typography: {
    h4: {
      fontWeight: 600,
      marginBottom: '1rem',
    },
    h6: {
      fontWeight: 500,
      marginBottom: '0.5rem',
    },
    button: {
      textTransform: 'none', // Prevent uppercase transformation
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: '0px',
        },
      },
    },
  },
});

export default theme;
