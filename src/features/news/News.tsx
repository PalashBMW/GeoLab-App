import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, TextField, 
  MenuItem, Select, FormControl, InputLabel, Stack, Chip, Divider, 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton,
  Tab, Tabs, CircularProgress, Alert
} from '@mui/material';
import { 
  Search, Globe, Clock, ExternalLink, X, Newspaper, 
  ChevronRight, Calendar, Filter, Languages 
} from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { NewsArticle } from '../../types';
import { appConfig } from '../../config/appConfig';
import { fetchGuardianNews, GuardianCategory } from '../../services/apiService';

// ---------------------------------------------------------------------------
// Mock articles — kept for reference / offline fallback; not used in production
// ---------------------------------------------------------------------------
/*
const mockArticles: NewsArticle[] = [
  {
    title: 'New Advances in Soil Stabilization Techniques for Coastal Areas',
    pubDate: '2024-04-01 10:00:00',
    language: 'English',
    source_id: 'Geotech Weekly',
    link: '#',
    description: 'Researchers have developed a new polymer-based stabilization method that significantly improves the load-bearing capacity of sandy coastal soils while maintaining permeability.'
  },
  {
    title: 'Environmental Impact Assessment of Deep Foundation Projects',
    pubDate: '2024-03-28 14:30:00',
    language: 'English',
    source_id: 'EcoBuild News',
    link: '#',
    description: 'A comprehensive study highlights common environmental oversights in deep foundation projects and proposes a new sustainability framework for geotechnical engineers.'
  },
  {
    title: 'Technology Integration in Geotechnical Site Investigations',
    pubDate: '2024-03-25 09:15:00',
    language: 'English',
    source_id: 'TechGeology',
    link: '#',
    description: 'The use of AI and drone-based photogrammetry is revolutionizing the speed and accuracy of preliminary site investigations across the globe.'
  },
  {
    title: 'Smart Sensors for Real-time Slope Stability Monitoring',
    pubDate: '2024-03-20 11:45:00',
    language: 'English',
    source_id: 'EarthScan',
    link: '#',
    description: 'Low-power wide-area network (LPWAN) sensors enabled with MEMS accelerometers are providing unprecedented resolution for landslide prediction and monitoring.'
  },
  {
    title: 'Sustainable Use of Recycled Aggregates in Pavement Geotechnics',
    pubDate: '2024-03-15 16:20:00',
    language: 'English',
    source_id: 'GreenRoads',
    link: '#',
    description: 'Examining the mechanical behavior and long-term durability of pavement layers constructed using high percentages of recycled concrete and asphalt aggregates.'
  },
  {
    title: 'Geotechnical Challenges in High-Rise Construction on Soft Clays',
    pubDate: '2024-03-10 08:30:00',
    language: 'English',
    source_id: 'StructGeotech',
    link: '#',
    description: 'A case study of innovative foundation designs used to mitigate settlement issues for a 60-story tower built on problematic soft clay deposits.'
  }
];
*/

// Categories are driven by appConfig.features.news.categories
const CATEGORY_LABELS: Record<string, string> = {
  environment: '🌿 Environment',
  science: '🔬 Science',
  technology: '💡 Technology',
  business: '📈 Business',
  world: '🌍 World',
  'uk/environment': '🇬🇧 UK Environment',
};

const News: React.FC = () => {
  const { updateHeader } = useAppContext();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState(appConfig.features.news.defaultCountry);
  const [category, setCategory] = useState<GuardianCategory>(
    (appConfig.features.news.categories[0] as GuardianCategory) ?? 'environment'
  );
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Fetch articles whenever category changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    setArticles([]);

    fetchGuardianNews(category, 12, country)
      .then((data) => {
        if (!cancelled) {
          setArticles(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setFetchError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [category, country]);

  // Sync header
  useEffect(() => {
    updateHeader({
      title: 'News',
      subtitle: 'The Guardian',
      contextData: selectedArticle ? { 'Reading': selectedArticle.title.substring(0, 25) + '…' } : { 'Category': category }
    });
  }, [category, selectedArticle, updateHeader]);

  const filteredArticles = useMemo(() => {
    return articles.filter(article =>
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.source_id.toLowerCase().includes(search.toLowerCase())
    );
  }, [articles, search]);

  const handleOpenDetail = (article: NewsArticle) => {
    setSelectedArticle(article);
  };

  const handleCloseDetail = () => {
    setSelectedArticle(null);
  };

  return (
    <Box>
      {/* Category Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={category}
          onChange={(_, val) => { setSearch(''); setCategory(val); }}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          {appConfig.features.news.categories.map((cat) => (
            <Tab
              key={cat}
              value={cat}
              label={CATEGORY_LABELS[cat] ?? cat}
              sx={{ fontWeight: 700, textTransform: 'none', minWidth: 120 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Search */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={2} 
        sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: '16px', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}
      >
        <TextField
          placeholder="Search articles…"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <Search size={18} style={{ marginRight: 8, opacity: 0.5 }} />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Region</InputLabel>
          <Select
            value={country}
            label="Region"
            onChange={(e) => setCountry(e.target.value)}
            startAdornment={<Globe size={16} style={{ marginRight: 8 }} />}
          >
            <MenuItem value="">Global</MenuItem>
            <MenuItem value="us">United States</MenuItem>
            <MenuItem value="gb">United Kingdom</MenuItem>
            <MenuItem value="au">Australia</MenuItem>
            <MenuItem value="ca">Canada</MenuItem>
            <MenuItem value="in">India</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Error */}
      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Could not load news: {fetchError}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Articles Grid */}
      {!loading && (
        <Grid container spacing={3}>
          {filteredArticles.length === 0 && !fetchError ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
                <Newspaper size={48} style={{ marginBottom: 16 }} />
                <Typography>No articles found matching your criteria.</Typography>
              </Box>
            </Grid>
          ) : (
            filteredArticles.map((article, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <Card 
                  onClick={() => handleOpenDetail(article)}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(124,74,30,0.15)',
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Chip 
                        label={article.source_id} 
                        size="small" 
                        sx={{ bgcolor: 'secondary.light', color: 'secondary.dark', fontWeight: 700, borderRadius: '6px' }} 
                      />
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                        <Clock size={12} />
                        <Typography variant="caption">{new Date(article.pubDate).toLocaleDateString()}</Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.3, mb: 2 }}>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      display: '-webkit-box', 
                      WebkitLineClamp: 3, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden' 
                    }}>
                      {article.description}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <Box sx={{ p: 1.5, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Languages size={14} color="#6b4226" />
                      <Typography variant="caption" color="text.secondary">{article.language}</Typography>
                    </Stack>
                    <ChevronRight size={18} color="#c07d39" />
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Article Detail Modal */}
      <Dialog 
        open={!!selectedArticle} 
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', p: 1 }
        }}
      >
        {selectedArticle && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pt: 3 }}>
              <Box>
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                  {selectedArticle.source_id}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>{selectedArticle.title}</Typography>
              </Box>
              <IconButton onClick={handleCloseDetail} sx={{ mt: -1 }}>
                <X size={20} />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                <Chip icon={<Calendar size={14} />} label={new Date(selectedArticle.pubDate).toLocaleDateString()} variant="outlined" size="small" />
                <Chip icon={<Languages size={14} />} label={selectedArticle.language} variant="outlined" size="small" />
                {selectedArticle.category && (
                  <Chip label={selectedArticle.category} variant="outlined" size="small" color="primary" />
                )}
              </Stack>
              <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.primary' }}>
                {selectedArticle.description}
              </Typography>
              <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.light', borderRadius: '16px', border: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom>Geotechnical Insight</Typography>
                <Typography variant="body2" color="text.secondary">
                  This article highlights key industrial shifts towards modularity and data-driven decision making. Such trends underline the importance of tools like GeoLab in modernizing geotechnical workflows.
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                endIcon={<ExternalLink size={18} />}
                sx={{ py: 1.5 }}
                href={selectedArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                component="a"
              >
                Read Full Article on The Guardian
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default News;
