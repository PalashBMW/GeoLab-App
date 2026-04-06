import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, useTheme, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { appConfig } from '../../config/appConfig';

const DASHBOARD_DRAWER_WIDTH = 260;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DASHBOARD_DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: DASHBOARD_DRAWER_WIDTH, 
          boxSizing: 'border-box', 
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#ffffff',
          color: 'text.primary',
          boxShadow: 'none'
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', mt: 3, px: 2 }}>
        <Typography 
          variant="overline" 
          sx={{ 
            px: 2, 
            fontWeight: 800, 
            color: 'primary.main', 
            letterSpacing: 1.5,
            fontSize: '0.75rem',
            opacity: 0.8
          }}
        >
          Menu
        </Typography>
        <List sx={{ mt: 1 }}>
          {appConfig.routes.map((route) => {
            const IconComponent = (Icons as any)[route.icon] || Icons.HelpCircle;
            const isActive = location.pathname === route.path;

            return (
              <ListItem key={route.path} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  component={NavLink} 
                  to={route.path}
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: isActive ? 'primary.light' : 'transparent',
                    color: isActive ? 'primary.main' : '#475569',
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.light' : 'rgba(37, 99, 235, 0.08)',
                      color: 'primary.main',
                    },
                    transition: 'all 0.2s',
                    py: 1.2
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? 'primary.main' : '#64748b', minWidth: 40 }}>
                    <IconComponent size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={route.label} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.95rem' 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
