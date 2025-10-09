"use client";

import { useState } from "react";
import { 
  Box, 
  Typography, 
  IconButton, 
  Card, 
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress
} from "@mui/material";
import { 
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  PieChart as PieChartIcon
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useProfile } from "@/lib/hooks/useProfile";
import { useYearSummary } from "@/lib/hooks/useYearSummary";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Colors for the bars
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"];

export default function YearSummary() {
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [chartView, setChartView] = useState<'expenses' | 'categories'>('categories');

  const { data: profile } = useProfile();
  const { data: yearSummary, isLoading } = useYearSummary(currentYear);

  if (!session) {
    return null;
  }

  const firstTrackedYear = profile?.firstTrackedMonth ? 
    new Date(profile.firstTrackedMonth).getFullYear() : 
    new Date().getFullYear();

  const navigateYear = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentYear > firstTrackedYear) {
      setCurrentYear(currentYear - 1);
    } else if (direction === 'next' && currentYear < new Date().getFullYear()) {
      setCurrentYear(currentYear + 1);
    }
  };

  const canNavigatePrev = currentYear > firstTrackedYear;
  const canNavigateNext = currentYear < new Date().getFullYear();

  return (
    <Box
      sx={{
        height: "100%", // Use full available height
        display: "flex",
        flexDirection: "column",
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        py: 2,
      }}
    >
      {/* Year Selector */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 4 }}>
        <IconButton 
          onClick={() => navigateYear('prev')}
          disabled={!canNavigatePrev}
        >
          <ArrowBackIosIcon />
        </IconButton>
        <Typography variant="h3" sx={{ mx: 4, fontWeight: 600 }}>
          {currentYear}
        </Typography>
        <IconButton 
          onClick={() => navigateYear('next')}
          disabled={!canNavigateNext}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1,
        display: "flex",
        gap: 3,
        minHeight: 0,
        flexDirection: { xs: "column", lg: "row" }
      }}>
        {/* Left Panel - Summary */}
        <Box sx={{ 
          flex: { xs: "0 0 auto", lg: "0 0 40%" },
          minWidth: 0
        }}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", p: 3 }}>
              {/* Summary Header */}
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Summary:
              </Typography>

              {/* Chart View Toggle */}
              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <ToggleButtonGroup
                  value={chartView}
                  exclusive
                  onChange={(_, newView) => {
                    if (newView !== null) {
                      setChartView(newView);
                    }
                  }}
                  size="small"
                  aria-label="chart view"
                >
                  <ToggleButton value="expenses" aria-label="by expenses">
                    By Expenses
                  </ToggleButton>
                  <ToggleButton value="categories" aria-label="by categories">
                    By Categories
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Bar Chart */}
              <Box sx={{ mb: 4, height: 300 }}>
                {isLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <CircularProgress />
                  </Box>
                ) : (() => {
                  const chartData = chartView === 'categories' ? yearSummary?.categoryData : yearSummary?.expenseData;
                  const hasData = chartData && chartData.length > 0;
                  
                  // Debug: Log the data to console
                  console.log('Year summary data:', yearSummary);
                  console.log('Chart data:', chartData);
                  console.log('Chart view:', chartView);
                  console.log('Has data:', hasData);
                  
                  // Fallback test data if no real data
                  const testData = [
                    { name: "Test Category 1", amount: 1000 },
                    { name: "Test Category 2", amount: 800 },
                    { name: "Test Category 3", amount: 600 }
                  ];
                  
                  const finalData = hasData ? chartData : testData;
                  console.log('Final data for chart:', finalData);
                  
                  return (
                    <Box>
                      {!hasData && (
                        <Box sx={{ mb: 2, p: 2, backgroundColor: 'warning.light', borderRadius: 1 }}>
                          <Typography variant="body2" color="warning.contrastText">
                            Using test data - No real data available for {currentYear}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ height: 250, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={finalData}
                            layout="horizontal"
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              type="number"
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => `${value} PLN`}
                            />
                            <YAxis 
                              type="category"
                              dataKey="name"
                              tick={{ fontSize: 12 }}
                              width={120}
                            />
                            <Tooltip 
                              formatter={(value: number) => [`${value.toFixed(2)} PLN`, 'Amount']}
                              labelFormatter={(label) => `${chartView === 'categories' ? 'Category' : 'Expense'}: ${label}`}
                            />
                            <Bar 
                              dataKey="amount"
                              fill="#8884d8"
                            >
                              {finalData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                  );
                })()}
              </Box>

              {/* Empty space */}
              <Box sx={{ flex: 1 }} />

              {/* Savings */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Total Savings:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "success.main" }}>
                  {isLoading ? "..." : `${yearSummary?.totalSavings?.toFixed(2) || "0.00"} PLN`}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Panel - Months Grid */}
        <Box sx={{ 
          flex: { xs: "0 0 auto", lg: "0 0 60%" },
          minWidth: 0
        }}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ height: "100%", p: 3 }}>
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(4, 1fr)", 
                gridTemplateRows: "repeat(3, 1fr)",
                gap: 2,
                height: "100%"
              }}>
                {months.map((month, index) => {
                  const monthData = yearSummary?.monthlyData?.[index];
                  const hasData = monthData?.hasData || false;
                  
                  return (
                    <Box
                      key={month}
                      sx={{
                        border: `2px solid ${hasData ? theme.palette.primary.main : theme.palette.divider}`,
                        borderRadius: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        backgroundColor: hasData ? theme.palette.background.paper : "transparent",
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                          borderColor: theme.palette.primary.main,
                        }
                      }}
                    >
                      {hasData ? (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            {month}
                          </Typography>
                          <PieChartIcon sx={{ color: "text.secondary" }} />
                        </>
                      ) : (
                        <PieChartIcon sx={{ color: "text.disabled", opacity: 0.3 }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

