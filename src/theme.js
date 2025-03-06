import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue
    },
    secondary: {
      main: '#dc004e', // Pinkish-red
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '10px 20px',
          fontSize: '16px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          marginBottom: '20px',
        },
      },
    },
  },
});

export default theme;
