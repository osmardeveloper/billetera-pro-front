import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  ButtonGroup,
  Divider,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AccountBalanceWallet as WalletIcon,
  FilterList as FilterIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  WarningAmber as WarningIcon,
  CheckCircleOutline as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '../App';
import api from '../api';

const MONTHS = [
  { value: 0, label: 'Enero' },
  { value: 1, label: 'Febrero' },
  { value: 2, label: 'Marzo' },
  { value: 3, label: 'Abril' },
  { value: 4, label: 'Mayo' },
  { value: 5, label: 'Junio' },
  { value: 6, label: 'Julio' },
  { value: 7, label: 'Agosto' },
  { value: 8, label: 'Septiembre' },
  { value: 9, label: 'Octubre' },
  { value: 10, label: 'Noviembre' },
  { value: 11, label: 'Diciembre' }
];

const YEARS = [2024, 2025, 2026, 2027, 2028];

function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Filter Modes: 'month' or 'range'
  const [filterMode, setFilterMode] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterOwner, setFilterOwner] = useState('');

  // Chart Type: 'bar' or 'donut'
  const [chartType, setChartType] = useState('bar');

  // SVG Tooltip State
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  const getMonthDateRange = (year, monthIndex) => {
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0);
    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    return {
      startDate: formatDate(start),
      endDate: formatDate(end)
    };
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      let start = '';
      let end = '';

      if (filterMode === 'month') {
        const range = getMonthDateRange(selectedYear, selectedMonth);
        start = range.startDate;
        end = range.endDate;
      } else {
        start = filterStartDate;
        end = filterEndDate;
      }

      const params = {};
      if (start) params.startDate = start;
      if (end) params.endDate = end;
      if (isAdmin && filterOwner) params.ownerCode = filterOwner;

      const [expResponse, incResponse] = await Promise.all([
        api.get('/expenses', { params }),
        api.get('/incomes', { params })
      ]);

      setExpenses(expResponse.data);
      setIncomes(incResponse.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('No se pudo recuperar la información del servidor.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const response = await api.get('/users');
      setUsersList(response.data);
    } catch (err) {
      console.error('Error fetching users for filter:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filterMode, selectedMonth, selectedYear, filterStartDate, filterEndDate, filterOwner]);

  // COP Currency formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Calculations
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const isOverdrawn = netBalance < 0;

  // Breakdown by Method
  const getBreakdown = () => {
    const breakdown = {
      nequi: { income: 0, expense: 0 },
      bancolombia: { income: 0, expense: 0 },
      efectivo: { income: 0, expense: 0 }
    };

    incomes.forEach(inc => {
      const m = inc.method.toLowerCase();
      if (breakdown[m]) breakdown[m].income += inc.amount;
    });

    expenses.forEach(exp => {
      const m = exp.method.toLowerCase();
      if (breakdown[m]) breakdown[m].expense += exp.amount;
    });

    return breakdown;
  };

  const methodBreakdown = getBreakdown();

  // SVG Chart Computations
  const maxBarValue = Math.max(totalIncome, totalExpense, 10000);
  const getBarHeight = (value) => {
    return (value / maxBarValue) * 160; // Max height is 160px
  };

  // Donut values
  const totalFlow = totalIncome + totalExpense;
  const incomeAngle = totalFlow > 0 ? (totalIncome / totalFlow) * 360 : 180;
  const expenseAngle = totalFlow > 0 ? (totalExpense / totalFlow) * 360 : 180;

  // Radius for donut chart SVG
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const incomeStrokeDashoffset = totalFlow > 0 ? circumference - (totalIncome / totalFlow) * circumference : circumference / 2;
  const expenseStrokeDashoffset = totalFlow > 0 ? circumference - (totalExpense / totalFlow) * circumference : circumference / 2;

  return (
    <Box className="tab-content">
      
      {/* 1. Header Row */}
      <Grid container spacing={3} sx={{ mb: 4 }} alignItems="center" justifyContent="space-between">
        <Grid item xs={12} sm={8} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(30, 58, 138, 0.05)', border: '1px solid #1e3a8a', width: 48, height: 48 }}>
            <WalletIcon sx={{ color: '#1e3a8a', fontSize: 26 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Panel General
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Balance global consolidado de ingresos, gastos y flujos monetarios
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* 2. Filters Panel */}
      <Paper sx={{ p: 3, mb: 4, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon sx={{ color: '#1e3a8a', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
              FILTROS DEL DASHBOARD
            </Typography>
          </Box>
          <ButtonGroup size="small" variant="outlined" color="primary">
            <Button 
              variant={filterMode === 'month' ? 'contained' : 'outlined'} 
              onClick={() => setFilterMode('month')}
              sx={{ fontWeight: 'bold' }}
            >
              Por Mes
            </Button>
            <Button 
              variant={filterMode === 'range' ? 'contained' : 'outlined'} 
              onClick={() => setFilterMode('range')}
              sx={{ fontWeight: 'bold' }}
            >
              Rango de Fechas
            </Button>
          </ButtonGroup>
        </Box>

        <Grid container spacing={2} alignItems="center">
          {filterMode === 'month' ? (
            <>
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Mes</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    label="Mes"
                  >
                    {MONTHS.map(m => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Año</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    label="Año"
                  >
                    {YEARS.map(y => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={4} md={3}>
                <TextField
                  label="Fecha Inicio"
                  type="date"
                  fullWidth
                  size="small"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <TextField
                  label="Fecha Fin"
                  type="date"
                  fullWidth
                  size="small"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          {isAdmin && (
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Propietario</InputLabel>
                <Select
                  value={filterOwner}
                  onChange={(e) => setFilterOwner(e.target.value)}
                  label="Propietario"
                >
                  <MenuItem value="">Todos los Propietarios</MenuItem>
                  {usersList.map((u) => (
                    <MenuItem key={u.id} value={u.code}>
                      {u.name} ({u.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Paper>

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
        <>
          {/* 3. Hero Balance Card (Semáforo de Sobregiro) */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Card 
                sx={{ 
                  bgcolor: isOverdrawn ? 'rgba(239, 68, 68, 0.03)' : 'rgba(34, 197, 94, 0.03)',
                  border: '1.5px solid',
                  borderColor: isOverdrawn ? '#dc2626' : '#16a34a',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(11, 15, 25, 0.02)'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4} sx={{ borderRight: { md: '1px solid rgba(11, 15, 25, 0.08)' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        {isOverdrawn ? (
                          <WarningIcon sx={{ color: '#dc2626', fontSize: 28 }} />
                        ) : (
                          <CheckIcon sx={{ color: '#16a34a', fontSize: 28 }} />
                        )}
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isOverdrawn ? '#dc2626' : '#16a34a', letterSpacing: '0.5px' }}>
                          {isOverdrawn ? 'ESTADO: SOBREGIRADO' : 'ESTADO: SALDO A FAVOR'}
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: isOverdrawn ? '#dc2626' : '#16a34a', mb: 1, letterSpacing: '-1px' }}>
                        {isOverdrawn ? '-' : '+'} {formatCurrency(Math.abs(netBalance))}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {isOverdrawn 
                          ? 'Tus gastos totales han superado tus ingresos en este periodo. Considera restringir egresos.' 
                          : '¡Felicidades! Mantienes un flujo de caja saludable con saldo disponible.'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={8}>
                      <Grid container spacing={3} sx={{ pl: { md: 2 } }}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Avatar sx={{ bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', width: 36, height: 36 }}>
                              <IncomeIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                              INGRESOS TOTALES
                            </Typography>
                          </Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0b0f19' }}>
                            {formatCurrency(totalIncome)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {incomes.length} transacciones registradas
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Avatar sx={{ bgcolor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', width: 36, height: 36 }}>
                              <ExpenseIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                              EGRESOS TOTALES
                            </Typography>
                          </Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0b0f19' }}>
                            {formatCurrency(totalExpense)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {expenses.length} transacciones registradas
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 4. Charts and Breakdown Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Chart Card */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0b0f19', letterSpacing: '0.5px' }}>
                    COMPARATIVA DE FLUJO
                  </Typography>
                  <ButtonGroup size="small" color="primary">
                    <Button 
                      variant={chartType === 'bar' ? 'contained' : 'outlined'} 
                      onClick={() => setChartType('bar')}
                      startIcon={<BarChartIcon />}
                      sx={{ fontWeight: 'bold' }}
                    >
                      Barras
                    </Button>
                    <Button 
                      variant={chartType === 'donut' ? 'contained' : 'outlined'} 
                      onClick={() => setChartType('donut')}
                      startIcon={<PieChartIcon />}
                      sx={{ fontWeight: 'bold' }}
                    >
                      Anillo
                    </Button>
                  </ButtonGroup>
                </Box>

                {/* Render SVG Chart */}
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240, position: 'relative' }}>
                  {totalFlow === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No hay transacciones registradas para este periodo para generar el gráfico.
                    </Typography>
                  ) : chartType === 'bar' ? (
                    /* Custom Interactive SVG Bar Chart */
                    <svg width="100%" height="220" viewBox="0 0 300 200" style={{ overflow: 'visible' }}>
                      {/* Grid Lines */}
                      <line x1="30" y1="20" x2="280" y2="20" stroke="rgba(11, 15, 25, 0.05)" strokeDasharray="3 3" />
                      <line x1="30" y1="70" x2="280" y2="70" stroke="rgba(11, 15, 25, 0.05)" strokeDasharray="3 3" />
                      <line x1="30" y1="120" x2="280" y2="120" stroke="rgba(11, 15, 25, 0.05)" strokeDasharray="3 3" />
                      <line x1="30" y1="170" x2="280" y2="170" stroke="rgba(11, 15, 25, 0.1)" strokeWidth="1.5" />

                      {/* Bar 1: Incomes */}
                      <rect
                        x="75"
                        y={170 - getBarHeight(totalIncome)}
                        width="45"
                        height={getBarHeight(totalIncome)}
                        fill="#16a34a"
                        rx="4"
                        style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          const rect = e.target.getBoundingClientRect();
                          setTooltip({
                            show: true,
                            text: `Ingresos: ${formatCurrency(totalIncome)}`,
                            x: 95,
                            y: 170 - getBarHeight(totalIncome) - 10
                          });
                        }}
                        onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
                      />
                      <text x="97" y="190" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold">
                        Ingresos
                      </text>
                      <text x="97" y={170 - getBarHeight(totalIncome) - 10} textAnchor="middle" fill="#16a34a" fontSize="10" fontWeight="bold">
                        {totalIncome > 0 && Math.round((totalIncome / totalFlow) * 100) + '%'}
                      </text>

                      {/* Bar 2: Expenses */}
                      <rect
                        x="180"
                        y={170 - getBarHeight(totalExpense)}
                        width="45"
                        height={getBarHeight(totalExpense)}
                        fill="#dc2626"
                        rx="4"
                        style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          setTooltip({
                            show: true,
                            text: `Egresos: ${formatCurrency(totalExpense)}`,
                            x: 202,
                            y: 170 - getBarHeight(totalExpense) - 10
                          });
                        }}
                        onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
                      />
                      <text x="202" y="190" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold">
                        Egresos
                      </text>
                      <text x="202" y={170 - getBarHeight(totalExpense) - 10} textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="bold">
                        {totalExpense > 0 && Math.round((totalExpense / totalFlow) * 100) + '%'}
                      </text>

                      {/* SVG Tooltip */}
                      {tooltip.show && (
                        <g>
                          <rect
                            x={tooltip.x - 65}
                            y={tooltip.y - 20}
                            width="130"
                            height="24"
                            rx="4"
                            fill="#0b0f19"
                            opacity="0.9"
                          />
                          <text
                            x={tooltip.x}
                            y={tooltip.y - 5}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="bold"
                          >
                            {tooltip.text}
                          </text>
                        </g>
                      )}
                    </svg>
                  ) : (
                    /* Custom Interactive SVG Donut Chart */
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <svg width="160" height="160" viewBox="0 0 120 120">
                        {/* Empty track if no flow */}
                        {totalFlow === 0 ? (
                          <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#f1efe9" strokeWidth="12" />
                        ) : (
                          <>
                            {/* Segment 1: Incomes (Green) */}
                            <circle
                              cx="60"
                              cy="60"
                              r={radius}
                              fill="transparent"
                              stroke="#16a34a"
                              strokeWidth="14"
                              strokeDasharray={circumference}
                              strokeDashoffset={incomeStrokeDashoffset}
                              transform="rotate(-90 60 60)"
                              style={{ transition: 'all 0.5s ease', cursor: 'pointer' }}
                              onMouseEnter={() => setTooltip({
                                show: true,
                                text: `Ingresos: ${Math.round((totalIncome / totalFlow) * 100)}%`,
                                x: 0, y: 0
                              })}
                              onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
                            />
                            {/* Segment 2: Expenses (Red) */}
                            <circle
                              cx="60"
                              cy="60"
                              r={radius}
                              fill="transparent"
                              stroke="#dc2626"
                              strokeWidth="14"
                              strokeDasharray={circumference}
                              strokeDashoffset={expenseStrokeDashoffset}
                              transform={`rotate(${((totalIncome / totalFlow) * 360) - 90} 60 60)`}
                              style={{ transition: 'all 0.5s ease', cursor: 'pointer' }}
                              onMouseEnter={() => setTooltip({
                                show: true,
                                text: `Egresos: ${Math.round((totalExpense / totalFlow) * 100)}%`,
                                x: 0, y: 0
                              })}
                              onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
                            />
                          </>
                        )}
                        {/* Center hole for donut effect */}
                        <circle cx="60" cy="60" r="38" fill="#ffffff" />
                        <text x="60" y="65" textAnchor="middle" fontSize="9" fontWeight="900" fill="#0b0f19">
                          BALANCE
                        </text>
                      </svg>

                      {/* Donut Legend */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 14, height: 14, bgcolor: '#16a34a', borderRadius: '4px' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0b0f19' }}>
                            Ingresos ({Math.round((totalIncome / totalFlow) * 100)}%)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 14, height: 14, bgcolor: '#dc2626', borderRadius: '4px' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0b0f19' }}>
                            Egresos ({Math.round((totalExpense / totalFlow) * 100)}%)
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Breakdown by Payment Method Card */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0b0f19', letterSpacing: '0.5px', mb: 3 }}>
                  RESUMEN POR MÉTODOS DE PAGO
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flexGrow: 1 }}>
                  {/* Global Incomes Card */}
                  <Box 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(34, 197, 94, 0.04)', 
                      border: '1px solid rgba(34, 197, 94, 0.15)', 
                      borderRadius: 2 
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.5px' }}>
                      INGRESOS GLOBALES
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
                      {formatCurrency(totalIncome)}
                    </Typography>
                  </Box>

                  {/* Expenses by Method Header */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0b0f19', mb: 1.5, letterSpacing: '0.5px' }}>
                      EGRESOS POR MÉTODOS DE PAGO
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ bgcolor: '#faf9f5', border: '1px solid rgba(11, 15, 25, 0.08)', p: 1.5, borderRadius: 1.5, height: '100%' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Nequi</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>
                            {formatCurrency(methodBreakdown.nequi.expense)}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ bgcolor: '#faf9f5', border: '1px solid rgba(11, 15, 25, 0.08)', p: 1.5, borderRadius: 1.5, height: '100%' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Bancolombia</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>
                            {formatCurrency(methodBreakdown.bancolombia.expense)}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ bgcolor: '#faf9f5', border: '1px solid rgba(11, 15, 25, 0.08)', p: 1.5, borderRadius: 1.5, height: '100%' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Efectivo</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>
                            {formatCurrency(methodBreakdown.efectivo.expense)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 0.5 }} />

                  {/* Net Calculation Bottom Card */}
                  <Box 
                    sx={{ 
                      p: 2, 
                      bgcolor: isOverdrawn ? 'rgba(239, 68, 68, 0.04)' : 'rgba(34, 197, 94, 0.04)', 
                      border: '1px dashed', 
                      borderColor: isOverdrawn ? '#dc2626' : '#16a34a', 
                      borderRadius: 2 
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1.5, letterSpacing: '0.5px' }}>
                      CÓMPUTO NETO (INGRESOS MENOS EGRESOS)
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>Ingresos Globales:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#16a34a' }}>+{formatCurrency(totalIncome)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>Egresos Globales:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#dc2626' }}>-{formatCurrency(totalExpense)}</Typography>
                    </Box>
                    <Divider sx={{ mb: 1.5, borderColor: isOverdrawn ? 'rgba(220, 38, 38, 0.15)' : 'rgba(34, 197, 94, 0.15)' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0b0f19' }}>Diferencia / Balance:</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: isOverdrawn ? '#dc2626' : '#16a34a' }}>
                        {isOverdrawn ? '-' : '+'} {formatCurrency(Math.abs(netBalance))}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

export default Dashboard;
