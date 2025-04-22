import React, { useState, useEffect } from 'react';
import { fetchInvoicesForPeriodDeep } from '../services/SupaEndPoints';
import {
  Box,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Paper,
  Typography,
  TableContainer,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enAU } from 'date-fns/locale';
import { InvoiceDeep } from '../models'; // Adjust the import based on your project structure



interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const BASReportPage: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [reportPeriod, setReportPeriod] = useState<'' | 'quarterly' | 'half-yearly' | 'annually'>('');
  const currentYear = new Date().getFullYear();
  let financialYearStartYear = currentYear;
  let financialYearEndYear = currentYear + 1;

  // If the current month is before July, the current financial year started in the previous year
  const currentMonth = new Date().getMonth(); // 0-indexed (0 for January, 6 for July)
  if (currentMonth < 6) {
    financialYearStartYear = currentYear - 1;
    financialYearEndYear = currentYear;
  }

  const financialYearStart = new Date(financialYearStartYear, 6, 1); // July 1st
  const financialYearEnd = new Date(financialYearEndYear, 5, 30);   // June 30th

  //   const [startDate, setStartDate] = useState<Date | null>(financialYearStart);
  //   const [endDate, setEndDate] = useState<Date | null>(financialYearEnd);
  const [startDate, setStartDate] = useState<Date | null>();
  const [endDate, setEndDate] = useState<Date | null>();
  const [invoices, setInvoices] = useState<InvoiceDeep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState(0); // 0: GST, 1: TPAR

  const handleChangeReportType = (event: React.SyntheticEvent, newValue: number) => {
    setReportType(newValue);
  };

  const handlePeriodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReportPeriod(event.target.value as 'quarterly' | 'half-yearly' | 'annually');
    // Reset dates when period changes
    setStartDate(null);
    setEndDate(null);
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };

  const generateDateRange = (period: 'quarterly' | 'half-yearly' | 'annually') => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (period) {
      case 'quarterly':
        // Logic to set default quarterly ranges (e.g., based on current month)
        if (month >= 0 && month <= 2) {
          setStartDate(new Date(year, 0, 1));
          setEndDate(new Date(year, 3, 0));
        } else if (month >= 3 && month <= 5) {
          setStartDate(new Date(year, 3, 1));
          setEndDate(new Date(year, 6, 0));
        } else if (month >= 6 && month <= 8) {
          setStartDate(new Date(year, 6, 1));
          setEndDate(new Date(year, 9, 0));
        } else {
          setStartDate(new Date(year, 9, 1));
          setEndDate(new Date(year, 12, 0));
        }
        break;
      case 'half-yearly':
        if (month >= 0 && month <= 5) {
          setStartDate(new Date(year, 0, 1));
          setEndDate(new Date(year, 6, 0));
        } else {
          setStartDate(new Date(year, 6, 1));
          setEndDate(new Date(year + 1, 0, 0)); // End of December
        }
        break;
      case 'annually':
        setStartDate(new Date(year, 0, 1));
        setEndDate(new Date(year + 1, 0, 0)); // End of December
        break;
      default:
        break;
    }
  };

  const fetchData = async () => {
    if (!startDate || !endDate) {
      //   setError('Please select a valid date range.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedInvoices = await fetchInvoicesForPeriodDeep(startDate, endDate);
      setInvoices(fetchedInvoices);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoice data.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (reportPeriod) {
      generateDateRange(reportPeriod);
    }
  }, [reportPeriod]);

  const calculateGST = (cost: number) => {
    return cost / 11; // Assuming cost includes GST
  };
  const calculateGST2 = (cost: number, gst_registered: boolean) => {
    if (gst_registered)
      return cost / 11;
    else return 0; // Assuming cost includes GST
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '';
    return parseFloat(num.toFixed(2));
  };

  const handleExportATO = () => {
    if (reportType === 0) {
      // Generate GST ATO export data (likely a CSV format)
      const gstData = invoices.map(invoice => ({
        invoiceId: invoice.code,
        date: invoice.create_at.toString(),
        supplier: invoice.by_id.company_name,
        grossAmount: formatNumber(invoice.cost),
        gstAmount: formatNumber(calculateGST2(invoice.cost, invoice.by_id.gst_registered)),
      }));
      downloadCSV(gstData, 'gst_report_ato.csv');
    } else {
      // Generate TPAR ATO export data (needs specific ATO format - likely CSV)
      const tparData = invoices.map(invoice => ({
        invoiceId: invoice.code,
        date: invoice.create_at.toString(),
        contractorABN: invoice.by_id.abn, // You'll need to fetch contractor ABN
        contractorName: invoice.by_id.company_name,
        grossAmountPaid: formatNumber(invoice.cost),
        gstPaid: formatNumber(calculateGST2(invoice.cost, invoice.by_id.gst_registered)), // Assuming cost includes GST
      }));
      downloadCSV(tparData, 'tpar_report_ato.csv');
    }
  };

  const handleExportMYOB = () => {
    if (reportType === 0) {
      // Generate GST MYOB export data (likely a different CSV format or other)
      const gstData = invoices.map(invoice => ({
        date: invoice.create_at.toString(),
        invoiceId: invoice.code,
        supplier: invoice.by_id.company_name,
        total: formatNumber(invoice.cost),
        gst: formatNumber(calculateGST2(invoice.cost, invoice.by_id.gst_registered)),
        // Add other MYOB specific fields
      }));
      downloadCSV(gstData, 'gst_report_myob.csv');
    } else {
      // Generate TPAR MYOB export data (likely CSV)
      const tparData = invoices.map(invoice => ({
        date: invoice.create_at.toString(),
        invoiceId: invoice.code,
        contractor: invoice.by_id.company_name,
        amount: formatNumber(invoice.cost),
        gst: formatNumber(calculateGST2(invoice.cost, invoice.by_id.gst_registered)),
        // Add other MYOB specific fields
      }));
      downloadCSV(tparData, 'tpar_report_myob.csv');
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    const csvRows = [];
    const headers = Object.keys(data[0] || {});
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => String(row[header]).replace(/,/g, '')); // Escape commas
      csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  const handleStartDateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value ? new Date(event.target.value) : null);
  };

  const handleEndDateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value ? new Date(event.target.value) : null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <h2>Business Activity Statement (BAS) Report</h2>

      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <RadioGroup row aria-label="report-period" name="report-period" value={reportPeriod} onChange={handlePeriodChange}>
          <FormControlLabel value="quarterly" control={<Radio />} label="Quarterly" />
          <FormControlLabel value="half-yearly" control={<Radio />} label="Half-Yearly" />
          <FormControlLabel value="annually" control={<Radio />} label="Annually" />
        </RadioGroup>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Start Date"
          type="date"
          value={startDate ? startDate.toISOString().split('T')[0] : ''}
          onChange={handleStartDateInputChange}
          disabled={!reportPeriod}
          InputLabelProps={{ shrink: true }} // To keep the label at the top
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate ? endDate.toISOString().split('T')[0] : ''}
          onChange={handleEndDateInputChange}
          disabled={!reportPeriod}
          InputLabelProps={{ shrink: true }} // To keep the label at the top
        />
        <Button variant="contained" onClick={fetchData} disabled={!startDate || !endDate || loading}>
          Generate Report Data
        </Button>
      </Box>


      <Box sx={{ width: '100%', mb: 2 }}>
        <Tabs value={reportType} onChange={handleChangeReportType} aria-label="report type tabs">
          <Tab label="GST Report" {...a11yProps(0)} />
          <Tab label="TPAR Report" {...a11yProps(1)} />
        </Tabs>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      <TabPanel value={reportType} index={0}>
        {invoices.length > 0 && (
          <>
            {isSmallScreen ? (
              <Box>
                {invoices.map((invoice) => (
                  <Paper key={invoice.code} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle2">{invoice.code}</Typography>
                        <Typography variant="caption">{invoice.create_at?.toString()}</Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2">{formatNumber(invoice.cost)}</Typography>
                        <Typography variant="caption">GST: {formatNumber(calculateGST2(invoice.cost, invoice.by_id.gst_registered))}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>{invoice.by_id.company_name}</Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table sx={{
                  minWidth: 650,
                  '& .MuiTableCell-root': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    padding: { xs: '8px', sm: '16px' }
                  }
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell sx={{ maxWidth: 100 }}>Supplier</TableCell>
                      <TableCell align="right">Gross Amount</TableCell>
                      <TableCell align="right">GST Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.code}>
                        <TableCell component="th" scope="row" sx={{ whiteSpace: 'nowrap' }}>
                          {invoice.code}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {invoice.create_at?.toString()}
                        </TableCell>
                        <TableCell sx={{
                          maxWidth: 100,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {invoice.by_id.company_name}
                        </TableCell>
                        <TableCell align="right">{formatNumber(invoice.cost)}</TableCell>
                        <TableCell align="right">
                          {formatNumber(calculateGST2(invoice.cost, invoice.by_id.gst_registered))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
        {invoices.length === 0 && !loading && !error && <Alert severity="info">No invoices found.</Alert>}
      </TabPanel>
      <TabPanel value={reportType} index={1}>
        {invoices.length > 0 && (
          <>
            {isSmallScreen ? (
              <Box>
                {invoices.map((invoice) => (
                  <Paper key={invoice.code} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle2">{invoice.code}</Typography>
                        <Typography variant="caption">{invoice.create_at?.toString()}</Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2">{formatNumber(invoice.cost)}</Typography>
                        <Typography variant="caption">
                          GST: {formatNumber(calculateGST2(invoice.cost, invoice.by_id.gst_registered))}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Contractor: {invoice.by_id.company_name}
                    </Typography>
                    {/* Add any additional TPAR-specific fields here */}
                    <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {/* Example of additional TPAR data - adjust based on your needs */}
                      ABN: {invoice.by_id.abn || 'N/A'}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table sx={{
                  minWidth: 650,
                  '& .MuiTableCell-root': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    padding: { xs: '8px', sm: '16px' }
                  }
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell sx={{ maxWidth: 100 }}>Contractor</TableCell>
                      <TableCell>ABN</TableCell> {/* Added ABN column for TPAR */}
                      <TableCell align="right">Gross Amount Paid</TableCell>
                      <TableCell align="right">GST Paid</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.code}>
                        <TableCell component="th" scope="row" sx={{ whiteSpace: 'nowrap' }}>
                          {invoice.code}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {invoice.create_at?.toString()}
                        </TableCell>
                        <TableCell sx={{
                          maxWidth: 100,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {invoice.by_id.company_name}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {invoice.by_id.abn || 'N/A'}
                        </TableCell>
                        <TableCell align="right">{formatNumber(invoice.cost)}</TableCell>
                        <TableCell align="right">
                          {formatNumber(calculateGST2(invoice.cost, invoice.by_id.gst_registered))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
        {invoices.length === 0 && !loading && !error && <Alert severity="info">No invoices found for the selected period.</Alert>}
      </TabPanel>

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleExportATO} disabled={invoices.length === 0}>
          Export for ATO
        </Button>
        <Button sx={{ ml: 2 }} variant="contained" color="secondary" onClick={handleExportMYOB} disabled={invoices.length === 0}>
          Export for MYOB
        </Button>
      </Box>
    </Box>
  );
};

export default BASReportPage;