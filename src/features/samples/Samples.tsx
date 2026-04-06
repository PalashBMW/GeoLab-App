import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Button, Switch, FormControlLabel,
  Stack, IconButton, Alert, Card, CardContent, Divider, InputAdornment, Tooltip
} from '@mui/material';
import {
  Upload, Trash2, RotateCcw, Search, Calculator,
  FileSpreadsheet, Filter, CheckCircle2, AlertCircle
} from 'lucide-react';
import Papa from 'papaparse';
import { useAppContext } from '../../store/AppContext';
import { SampleData } from '../../types';
import { appConfig } from '../../config/appConfig';

const Samples: React.FC = () => {
  const { updateHeader } = useAppContext();
  const [samples, setSamples] = useState<SampleData[]>([]);
  const [filter, setFilter] = useState('');
  const [autoRecalculate, setAutoRecalculate] = useState(true);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Track whether the user has ever uploaded a file
  const [hasFile, setHasFile] = useState(false);

  // Sync header with sample count and filter status
  useEffect(() => {
    const filteredCount = samples.filter(s =>
      s.sampleId.toLowerCase().includes(filter.toLowerCase())
    ).length;

    updateHeader({
      title: 'Samples',
      subtitle: fileName ? `file: ${fileName}` : undefined,
      contextData: {
        'Total Rows': samples.length,
        'Filtered': filteredCount
      }
    });
  }, [samples, filter, fileName, updateHeader]);

  const calculateDerived = useCallback((data: Partial<SampleData>): Partial<SampleData> => {
    const moisture = Number(data.moisture) || 0;
    const density = Number(data.dryDensity) || 0;
    const factor = Number(data.correctionFactor) ?? appConfig.features.samples.defaultCorrectionFactor;
    const porosity = Number(data.porosity) ?? appConfig.features.samples.defaultPorosity;

    return {
      ...data,
      adjustedMoisture: moisture * (1 + factor / 100),
      adjustedDensity: density * (1 - porosity / 100)
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setHasFile(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data.map((row: any, index) => {
          const raw = {
            id: crypto.randomUUID(),
            sampleId: row.SampleID || `SAMP-${index + 1}`,
            moisture: parseFloat(row.Moisture) || 0,
            dryDensity: parseFloat(row.DryDensity) || 0,
            correctionFactor: parseFloat(row.CorrectionFactor) || appConfig.features.samples.defaultCorrectionFactor,
            porosity: parseFloat(row.Porosity) || appConfig.features.samples.defaultPorosity,
          };
          return { ...raw, ...calculateDerived(raw) } as SampleData;
        });
        setSamples(parsedData);
        setError(null);
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      }
    });
  };

  const updateSampleField = (id: string, field: keyof SampleData, value: string | number) => {
    setSamples(prev => prev.map(sample => {
      if (sample.id !== id) return sample;

      const updated = { ...sample, [field]: value };
      return autoRecalculate ? { ...updated, ...calculateDerived(updated) } : updated;
    }));
  };

  const triggerRecalculate = () => {
    setSamples(prev => prev.map(sample => ({
      ...sample,
      ...calculateDerived(sample)
    })));
  };

  const filteredSamples = useMemo(() =>
    samples.filter(s => s.sampleId.toLowerCase().includes(filter.toLowerCase())),
    [samples, filter]);

  const summary = useMemo(() => {
    if (filteredSamples.length === 0) return { avgMoisture: 0, avgDensity: 0 };
    const sums = filteredSamples.reduce((acc, curr) => ({
      moisture: acc.moisture + curr.adjustedMoisture,
      density: acc.density + curr.adjustedDensity
    }), { moisture: 0, density: 0 });

    return {
      avgMoisture: sums.moisture / filteredSamples.length,
      avgDensity: sums.density / filteredSamples.length
    };
  }, [filteredSamples]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Toolbar Area */}
      <Paper sx={{ p: 2, borderRadius: '16px' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
            <TextField
              size="small"
              placeholder="Filter by Sample ID..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            <Button
              variant="contained"
              component="label"
              startIcon={<Upload size={18} />}
              sx={{ borderRadius: 8 }}
            >
              Upload CSV
              <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
            </Button>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={<Switch checked={autoRecalculate} onChange={(e) => setAutoRecalculate(e.target.checked)} />}
              label="Auto Recalculate"
            />
            <Button
              variant="outlined"
              disabled={autoRecalculate || samples.length === 0}
              startIcon={<Calculator size={18} />}
              onClick={triggerRecalculate}
            >
              Manual Recalculate
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && <Alert severity="error" icon={<AlertCircle size={20} />}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 1fr' }, gap: 2 }}>
        {/* Table Area */}
        <TableContainer component={Paper} sx={{ borderRadius: '16px', maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Sample ID</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Moisture (%)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Dry Density</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Corr. Factor (%)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Porosity (%)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'primary.light', color: 'primary.main' }}>Adj. Moisture</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'primary.light', color: 'primary.main' }}>Adj. Density</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!hasFile ? (
                // ── No CSV uploaded yet ──────────────────────────────────
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 10, border: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        opacity: 0.7,
                      }}
                    >
                      <FileSpreadsheet size={56} strokeWidth={1.2} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        No CSV uploaded
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, textAlign: 'center' }}>
                        Please upload a CSV file to view and edit your soil sample data.
                      </Typography>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<Upload size={18} />}
                        sx={{ mt: 1, borderRadius: 8 }}
                      >
                        Upload CSV
                        <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredSamples.length === 0 ? (
                // ── CSV loaded but filter returned nothing ───────────────
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Box sx={{ opacity: 0.5 }}>
                      <Filter size={40} style={{ marginBottom: 8 }} />
                      <Typography variant="body1">No samples match your filter.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSamples.map((sample) => (
                  <TableRow key={sample.id} hover>
                    <TableCell>
                      <TextField
                        size="small"
                        value={sample.sampleId}
                        onChange={(e) => updateSampleField(sample.id, 'sampleId', e.target.value)}
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip
                        title={
                          Number(sample.moisture) < 0
                            ? '⚠️ Moisture cannot be negative — value must be ≥ 0'
                            : ''
                        }
                        open={Number(sample.moisture) < 0}
                        arrow
                        placement="top"
                      >
                        <TextField
                          size="small"
                          type="number"
                          value={sample.moisture}
                          onChange={(e) => updateSampleField(sample.id, 'moisture', e.target.value)}
                          variant="standard"
                          InputProps={{ disableUnderline: true }}
                          sx={{
                            width: 80,
                            '& input': {
                              color: Number(sample.moisture) < 0 ? 'error.main' : 'inherit',
                              fontWeight: Number(sample.moisture) < 0 ? 700 : 400,
                            },
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip
                        title={
                          Number(sample.dryDensity) < 0
                            ? '⚠️ Dry Density cannot be negative — value must be ≥ 0'
                            : ''
                        }
                        open={Number(sample.dryDensity) < 0}
                        arrow
                        placement="top"
                      >
                        <TextField
                          size="small"
                          type="number"
                          value={sample.dryDensity}
                          onChange={(e) => updateSampleField(sample.id, 'dryDensity', e.target.value)}
                          variant="standard"
                          InputProps={{ disableUnderline: true }}
                          sx={{
                            width: 80,
                            '& input': {
                              color: Number(sample.dryDensity) < 0 ? 'error.main' : 'inherit',
                              fontWeight: Number(sample.dryDensity) < 0 ? 700 : 400,
                            },
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={sample.correctionFactor}
                        onChange={(e) => updateSampleField(sample.id, 'correctionFactor', e.target.value)}
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{ width: 60 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={sample.porosity}
                        onChange={(e) => updateSampleField(sample.id, 'porosity', e.target.value)}
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{ width: 60 }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {sample.adjustedMoisture.toFixed(2)}%
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {sample.adjustedDensity.toFixed(3)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary Side Panel */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle2 size={20} color="#10b981" />
                Summary
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">AVG ADJUSTED MOISTURE</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {summary.avgMoisture.toFixed(2)}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">AVG ADJUSTED DENSITY</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {summary.avgDensity.toFixed(3)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">VISIBLE SAMPLES</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {filteredSamples.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Samples;
