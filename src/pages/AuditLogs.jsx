import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  TablePagination
} from '@mui/material';
import {
  History as HistoryIcon,
  AssignmentTurnedIn as AuditIcon
} from '@mui/icons-material';
import api from '../api';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/logs');
      setLogs(response.data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err.response?.data?.error || 'No se pudieron cargar los registros de auditoría.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Format Date and Time
  const formatDateTime = (isoString) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    const dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    const timeString = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dateString} a las ${timeString}`;
  };

  return (
    <Box className="tab-content">
      <Grid container spacing={3} sx={{ mb: 4 }} alignItems="center">
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(30, 58, 138, 0.05)', border: '1px solid #1e3a8a' }}>
            <HistoryIcon sx={{ color: '#1e3a8a' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Bitácora de Auditoría
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Historial definitivo de eliminaciones autorizadas mediante Clave Maestra
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(153, 27, 27, 0.05)', border: '1px solid #991b1b', color: '#991b1b', borderRadius: 1 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="audit logs table">
            <TableHead>
              <TableRow>
                <TableCell>Fecha y Hora</TableCell>
                <TableCell align="center">Tipo</TableCell>
                <TableCell>Registro Eliminado</TableCell>
                <TableCell>Autorizado Por</TableCell>
                <TableCell>Motivo de la Eliminación</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No se han registrado eliminaciones en el sistema.
                  </TableCell>
                </TableRow>
              ) : (
                logs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {formatDateTime(row.timestamp)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.type.toUpperCase()}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold',
                            backgroundColor: row.type === 'Usuario' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(13, 148, 136, 0.08)',
                            color: row.type === 'Usuario' ? '#4f46e5' : '#0d9488',
                            border: row.type === 'Usuario' ? '1px solid rgba(79, 70, 229, 0.15)' : '1px solid rgba(13, 148, 136, 0.15)',
                            borderRadius: 1
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#0b0f19', fontSize: '0.9rem', maxWidth: 280 }}>
                        {row.targetDetails}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                        {row.deletedBy}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        "{row.reason}"
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={logs.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          borderTop: '1px solid rgba(11, 15, 25, 0.06)',
          color: '#0b0f19',
          '& .MuiTablePagination-selectIcon': {
            color: '#0b0f19'
          },
          '& .MuiTablePagination-actions .MuiIconButton-root': {
            color: '#0b0f19'
          }
        }}
      />
    </Box>
  );
}

export default AuditLogs;
