import React, { useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea, Icon } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useAppContext } from '../../store/AppContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setHeader } = useAppContext();

  useEffect(() => {
    setHeader({ title: 'GeoLab Home' });
  }, [setHeader]);

  const cards = [
    {
      title: 'Samples',
      description: 'Manage soil sample data, perform geotechnical calculations, and upload CSV files.',
      icon: 'FlaskConical',
      path: '/samples',
      color: '#334155', // Slate 700 (Engineering Grey)
    },
    {
      title: 'News',
      description: 'Stay updated with regional geotechnical news, environmental, and technology updates.',
      icon: 'Newspaper',
      path: '/news',
      color: '#b45309', // Amber 700 (Soil/Clay Brown)
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome to GeoLab
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          The modular Single Page Application for geotechnical engineers to manage sample data and stay ahead with latest industry trends.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {cards.map((card) => {
          const LucideIcon = (LucideIcons as any)[card.icon] || LucideIcons.FileQuestion;
          return (
            <Grid item xs={12} sm={6} key={card.title}>
              <Card 
                sx={{ 
                  borderRadius: '20px', 
                  border: '1px solid', 
                  borderColor: 'rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    borderColor: card.color,
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => navigate(card.path)}
                  sx={{ p: 3, height: '100%' }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        borderRadius: '16px', 
                        backgroundColor: `${card.color}15`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 3,
                        color: card.color,
                        border: '1px solid',
                        borderColor: `${card.color}30`
                      }}
                    >
                      <LucideIcon size={28} />
                    </Box>
                    <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                      {card.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Home;
