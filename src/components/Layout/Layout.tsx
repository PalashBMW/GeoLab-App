import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

// ─── Theme ─────────────────────────────────────────────────────────────────
// 🎨 To change the colour scheme, edit the palette values below.
// Primary   → main UI colour (buttons, active states, header accent)
// Secondary → accent colour (chips, highlights)
// background.default → page background
// background.paper   → card / panel background
// ─────────────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: {
      main: '#7c4a1e',    // Rich terracotta-brown (earth / fired clay)
      light: '#f5ece4',   // Warm sand tint — used for subtle backgrounds
      dark: '#4e2d0f',    // Deep soil-brown
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c07d39',    // Warm ochre / dry sand
      light: '#fdf3e7',   // Sandy cream
      dark: '#8a5620',    // Dark amber-brown
      contrastText: '#ffffff',
    },
    background: {
      default: '#faf7f2', // Warm parchment — like aged field notes
      paper: '#ffffff',
    },
    divider: 'rgba(124, 74, 30, 0.12)',
    text: {
      primary: '#2d1a0e',  // Very dark brown — readable & earthy
      secondary: '#6b4226', // Mid-brown secondary text
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(250, 247, 242, 0.92)',
        },
      },
    },
  },
});


const Layout: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
        <CssBaseline />
        <Header />
        <Sidebar />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            pt: 12, // Adjusted for fixed header
            backgroundColor: 'background.default',
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;
