import React from 'react';
import { AppBar, Toolbar, Typography, Box, useTheme, Chip } from '@mui/material';
import { useAppContext } from '../../store/AppContext';

const Header: React.FC = () => {
  const { header } = useAppContext();
  const theme = useTheme();

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        width: { sm: `calc(100% - 260px)` },
        ml: { sm: `260px` },
        backgroundColor: 'rgba(250, 247, 242, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
            GeoLab
          </Typography>
          <Box sx={{ width: '1px', height: '24px', bgcolor: 'divider' }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
            {header.title}
          </Typography>
          {header.subtitle && (
            <Chip 
              label={header.subtitle} 
              size="small" 
              color="primary" 
              variant="outlined" 
              sx={{ 
                fontWeight: 600, 
                borderRadius: '6px',
                borderColor: 'primary.main',
                color: 'primary.main',
                bgcolor: 'primary.light',
              }}
            />
          )}
        </Box>
        
        {header.contextData && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(header.contextData).map(([key, value]) => (
              <Chip 
                key={key}
                label={`${key}: ${value}`} 
                size="small" 
                variant="filled"
                sx={{ 
                  bgcolor: 'secondary.main',   // ochre — strong enough for white text
                  color: '#ffffff',            // always white, always readable
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  letterSpacing: '0.02em',
                  '& .MuiChip-label': { px: 1.2 },
                }} 
              />
            ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
