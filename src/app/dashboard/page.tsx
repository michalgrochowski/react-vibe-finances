"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useProfile } from "@/lib/hooks/useProfile";
import { useRecurringExpenses } from "@/lib/hooks/useRecurringExpenses";
import { useBudgetMonth, useCreateBudgetMonth } from "@/lib/hooks/useBudgetMonths";
import { useExpenses, useCreateExpense, useDeleteExpense, useUpdateExpense } from "@/lib/hooks/useExpenses";
import { useCategories } from "@/lib/hooks/useCategories";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function MonthDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Initialize to first day of current month
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  
  // Convert month to string format "2025-10"
  const monthString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: recurringExpenses = [], isLoading: expensesLoading } = useRecurringExpenses();
  const { data: budgetMonth, isLoading: budgetMonthLoading } = useBudgetMonth(monthString);
  const createBudgetMonth = useCreateBudgetMonth();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData?.categories || [];
  
  // Expenses hooks
  const { data: manualExpenses = [], isLoading: manualExpensesLoading } = useExpenses(budgetMonth?.id || "");
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();
  const updateExpense = useUpdateExpense();
  
  const [monthlySalary, setMonthlySalary] = useState("");
  const [monthlySavings, setMonthlySavings] = useState("");
  const [isCreatingBudgetMonth, setIsCreatingBudgetMonth] = useState(false);
  
  // Add expense dialog state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("");
  
  // Edit expense dialog state
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editExpenseName, setEditExpenseName] = useState("");
  const [editExpenseAmount, setEditExpenseAmount] = useState("");
  const [editExpenseCategory, setEditExpenseCategory] = useState("");
  
  // Chart view toggle state
  const [chartView, setChartView] = useState<'expenses' | 'categories'>('expenses');

  // Save budget month data when values change
  const saveBudgetMonthData = useCallback(async () => {
    if (!budgetMonth) return;
    
    try {
      await fetch(`/api/budget-months/${budgetMonth.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salaryOverrideCents: monthlySalary ? Math.round(parseFloat(monthlySalary) * 100) : null,
          savingsCents: monthlySavings ? Math.round(parseFloat(monthlySavings) * 100) : 0,
        }),
      });
    } catch (error) {
      console.error("Failed to save budget month data:", error);
    }
  }, [budgetMonth, monthlySalary, monthlySavings]);

  // Save on input blur instead of auto-save
  const handleSalaryBlur = () => {
    if (budgetMonth) {
      saveBudgetMonthData();
    }
  };

  const handleSavingsBlur = () => {
    if (budgetMonth) {
      saveBudgetMonthData();
    }
  };

  // Auto-create budget month if it doesn't exist
  useEffect(() => {
    const createCurrentBudgetMonth = async () => {
      if (budgetMonthLoading || !profile || isCreatingBudgetMonth) return; // Still loading or already creating
      
      if (budgetMonth === null && profile) {
        // Budget month doesn't exist, create it
        setIsCreatingBudgetMonth(true);
        try {
          const result = await createBudgetMonth.mutateAsync({
            month: monthString,
            salaryOverrideCents: profile?.defaultSalaryCents ? Number(profile.defaultSalaryCents) : undefined,
          });
          
          // After creating budget month, add recurring expenses for this month
          if (result?.budgetMonth?.id && recurringExpenses.length > 0) {
            const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
            
            // Filter recurring expenses that apply to this month
            const applicableRecurringExpenses = recurringExpenses.filter(expense => {
              const expenseStart = new Date(expense.startsOn);
              return expenseStart <= currentMonthEnd && 
                     (!expense.endsOn || new Date(expense.endsOn) >= currentMonthStart);
            });
            
            // Create individual expense records for each recurring expense
            for (const recurringExpense of applicableRecurringExpenses) {
              try {
                await createExpense.mutateAsync({
                  name: recurringExpense.name,
                  amountCents: Number(recurringExpense.amountCents),
                  categoryId: recurringExpense.categoryId,
                  monthId: result.budgetMonth.id,
                });
              } catch (error) {
                console.error("Failed to create expense for recurring:", error);
              }
            }
          }
        } catch (error) {
          console.error("Failed to create budget month:", error);
        } finally {
          setIsCreatingBudgetMonth(false);
        }
      }
    };

    createCurrentBudgetMonth();
  }, [budgetMonth, budgetMonthLoading, profile, monthString, createBudgetMonth, isCreatingBudgetMonth, recurringExpenses, currentMonth, createExpense]);

  useEffect(() => {
    if (budgetMonth) {
      // Use budget month specific values if available
      setMonthlySalary(budgetMonth.salaryOverrideCents ? (Number(budgetMonth.salaryOverrideCents) / 100).toString() : (profile?.defaultSalaryCents ? (Number(profile.defaultSalaryCents) / 100).toString() : ""));
      setMonthlySavings((Number(budgetMonth.savingsCents) / 100).toString());
    } else if (profile) {
      // Use profile defaults
      setMonthlySalary((Number(profile.defaultSalaryCents) / 100).toString());
      setMonthlySavings("0");
    }
  }, [profile, budgetMonth]);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Handle adding new expense
  const handleAddExpense = async () => {
    if (!budgetMonth || !newExpenseName || !newExpenseAmount || !newExpenseCategory) return;
    
    try {
      await createExpense.mutateAsync({
        name: newExpenseName,
        amountCents: Math.round(parseFloat(newExpenseAmount) * 100),
        categoryId: newExpenseCategory,
        monthId: budgetMonth.id,
      });
      
      setNewExpenseName("");
      setNewExpenseAmount("");
      setNewExpenseCategory("");
      setShowAddExpense(false);
    } catch (error) {
      console.error("Failed to create expense:", error);
    }
  };

  // Handle editing expense
  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setEditExpenseName(expense.name);
    setEditExpenseAmount(expense.amount.toString());
    setEditExpenseCategory(expense.categoryId);
    setShowEditExpense(true);
  };

  // Handle updating expense
  const handleUpdateExpense = async () => {
    if (!editingExpense || !editExpenseName || !editExpenseAmount || !editExpenseCategory) return;
    
    try {
      // All expenses are now individual records, so we can update them directly
      await updateExpense.mutateAsync({
        id: editingExpense.id,
        data: {
          name: editExpenseName,
          amountCents: Math.round(parseFloat(editExpenseAmount) * 100),
          categoryId: editExpenseCategory,
        }
      });
      
      setEditExpenseName("");
      setEditExpenseAmount("");
      setEditExpenseCategory("");
      setEditingExpense(null);
      setShowEditExpense(false);
    } catch (error) {
      console.error("Failed to update expense:", error);
    }
  };

  // Handle deleting expense
  const handleDeleteExpense = async (expenseId: string) => {
    try {
      // All expenses are now individual records, so we can delete them directly
      await deleteExpense.mutateAsync(expenseId);
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  // Handle syncing recurring expenses for current month
  const handleSyncRecurringExpenses = async () => {
    if (!budgetMonth || !recurringExpenses.length) return;
    
    try {
      const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // Get existing expense names for this month to avoid duplicates
      const existingExpenseNames = manualExpenses.map((expense: any) => expense.name);
      
      // Filter recurring expenses that apply to this month and aren't already added
      const applicableRecurringExpenses = recurringExpenses.filter(expense => {
        const expenseStart = new Date(expense.startsOn);
        const isApplicable = expenseStart <= currentMonthEnd && 
                           (!expense.endsOn || new Date(expense.endsOn) >= currentMonthStart);
        const notAlreadyAdded = !existingExpenseNames.includes(expense.name);
        return isApplicable && notAlreadyAdded;
      });
      
      // Create individual expense records for missing recurring expenses
      for (const recurringExpense of applicableRecurringExpenses) {
        try {
          await createExpense.mutateAsync({
            name: recurringExpense.name,
            amountCents: Number(recurringExpense.amountCents),
            categoryId: recurringExpense.categoryId,
            monthId: budgetMonth.id,
          });
        } catch (error) {
          console.error("Failed to create expense for recurring:", error);
        }
      }
    } catch (error) {
      console.error("Failed to sync recurring expenses:", error);
    }
  };

  const navigateMonth = async (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  // Check if we can navigate to previous month
  const canNavigatePrev = () => {
    if (!profile?.firstTrackedMonth) return true;
    const firstTracked = new Date(profile.firstTrackedMonth);
    const firstTrackedMonth = new Date(firstTracked.getFullYear(), firstTracked.getMonth(), 1);
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    return currentMonthStart > firstTrackedMonth;
  };

  // Check if we can navigate to next month - allow future months
  const canNavigateNext = () => {
    return true; // Always allow going to future months
  };

  // All expenses are now individual records in the database
  // No need to separate recurring vs manual - they're all individual expense records
  const currentMonthExpenses = manualExpenses.map((expense: any) => ({
    id: expense.id,
    name: expense.name,
    amount: Number(expense.amountCents) / 100,
    category: expense.category.name,
    categoryId: expense.categoryId,
    type: 'expense' // All expenses are now treated the same way
  }));

  const totalExpenses = currentMonthExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
  const salary = parseFloat(monthlySalary) || 0;
  const savings = parseFloat(monthlySavings) || 0;
  const remaining = salary - totalExpenses - savings;

  // Prepare chart data based on selected view
  const chartDataByExpenses = [
    ...currentMonthExpenses.map((expense: any, index: number) => ({
      name: expense.name,
      value: expense.amount,
      color: COLORS[index % COLORS.length]
    })),
    ...(remaining > 0 ? [{ name: "Remaining", value: remaining, color: "#E0E0E0" }] : [])
  ];

  // Group expenses by category
  const chartDataByCategories = (() => {
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();
    
    currentMonthExpenses.forEach((expense: any) => {
      const existing = categoryMap.get(expense.categoryId);
      if (existing) {
        existing.value += expense.amount;
      } else {
        categoryMap.set(expense.categoryId, {
          name: expense.category,
          value: expense.amount,
          color: COLORS[categoryMap.size % COLORS.length]
        });
      }
    });
    
    const categoryData = Array.from(categoryMap.values());
    return [
      ...categoryData,
      ...(remaining > 0 ? [{ name: "Remaining", value: remaining, color: "#E0E0E0" }] : [])
    ];
  })();

  // Use the appropriate chart data based on the selected view
  const chartData = chartView === 'expenses' ? chartDataByExpenses : chartDataByCategories;

  if (profileLoading || expensesLoading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%", // Use full available height
        display: "flex",
        flexDirection: "column",
        px: { xs: 2, sm: 4, md: 6, lg: 8 }, // Responsive side margins
        py: 2, // Reduced padding
      }}
    >
      {/* Month Navigation */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 4, flexShrink: 0 }}>
        <IconButton 
          onClick={() => navigateMonth('prev')}
          disabled={!canNavigatePrev()}
        >
          <ArrowBackIosIcon />
        </IconButton>
        <Typography variant="h4" sx={{ mx: 3, minWidth: 200, textAlign: "center" }}>
          {formatMonth(currentMonth)}
        </Typography>
        <IconButton 
          onClick={() => navigateMonth('next')}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      {/* Main Content - Responsive Layout */}
      <Box sx={{ 
        display: "flex", 
        gap: 3, 
        flex: 1, 
        minHeight: 0, 
        overflow: { xs: "auto", lg: "hidden" }, // Allow scrolling on mobile, hidden on desktop
        flexDirection: { xs: "column", lg: "row" }, // Stack on mobile, row on desktop
        justifyContent: { xs: "flex-start", lg: "center" }
      }}>
        {/* Left Column - Salary & Savings */}
        <Box sx={{ 
          flex: { xs: "0 0 auto", lg: "0 0 20%" }, 
          minWidth: 0,
          width: { xs: "100%", lg: "auto" }
        }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                This Month
              </Typography>
              
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Salary:
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    onBlur={handleSalaryBlur}
                    placeholder="Enter amount"
                    size="small"
                    inputProps={{ min: 0, max: 999999, step: 0.01 }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Savings:
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={monthlySavings}
                    onChange={(e) => setMonthlySavings(e.target.value)}
                    onBlur={handleSavingsBlur}
                    placeholder="Enter amount"
                    size="small"
                    inputProps={{ min: 0, max: 999999, step: 0.01 }}
                  />
                </Box>

              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Center Column - Donut Chart */}
        <Box sx={{ 
          flex: { xs: "0 0 auto", lg: "0 0 50%" }, 
          minWidth: 0,
          width: { xs: "100%", lg: "auto" },
          height: { xs: "450px", lg: "auto" }
        }}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" gutterBottom align="center">
                Expense Breakdown
              </Typography>
              
              {/* Chart View Toggle */}
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
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
              
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 50 : 200}
                      outerRadius={isMobile ? 100 : 400}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} PLN`, 'Amount']} />
                    <Legend />
                    {/* Center text showing remaining amount */}
                    <text 
                      x="50%" 
                      y={isMobile ? '35%' : '45%'}
                      textAnchor="middle" 
                      dominantBaseline="middle"
                      style={{
                        fontSize: isMobile ? '12px' : '24px',
                        fontWeight: 'bold',
                        fill: theme.palette.text.primary
                      }}
                    >
                      Remaining
                    </text>
                    <text 
                      x="50%" 
                      y={isMobile ? '40%' : '55%'}
                      textAnchor="middle" 
                      dominantBaseline="middle"
                      style={{
                        fontSize: isMobile ? '12px' : '20px',
                        fontWeight: '600',
                        fill: theme.palette.text.secondary
                      }}
                    >
                      {remaining.toFixed(2)} PLN
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Expenses List */}
        <Box sx={{ 
          flex: { xs: "0 0 auto", lg: "0 0 20%" }, 
          minWidth: 0,
          width: { xs: "100%", lg: "auto" },
          height: { xs: "400px", lg: "auto" },
          mt: { xs: 3, lg: 0 } // Add top margin on mobile
        }}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6">
                  Expenses
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton 
                    size="small"
                    onClick={handleSyncRecurringExpenses}
                    title="Sync recurring expenses for this month"
                    sx={{ 
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => setShowAddExpense(true)}
                    sx={{ 
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>

              <List sx={{ flex: 1, overflow: "auto", minHeight: 0, maxHeight: "calc(100vh - 200px)" }}>
                {currentMonthExpenses.map((expense: any) => (
                  <ListItem
                    key={expense.id}
                    secondaryAction={
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => handleEditExpense(expense)}
                          sx={{ 
                            color: 'text.primary',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => handleDeleteExpense(expense.id)}
                          sx={{ 
                            color: 'error.light',
                            '&:hover': {
                              backgroundColor: 'error.lighter',
                              color: 'error.main',
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                    sx={{ px: 0 }}
                  >
                    <ListItemText
                      primary={expense.name}
                      secondary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {expense.amount.toFixed(2)} PLN
                          </Typography>
                          <Chip label={expense.category} size="small" variant="outlined" />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpense} onClose={() => setShowAddExpense(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Expense Name"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              placeholder="Enter expense name"
              inputProps={{ maxLength: 70 }}
            />
            <TextField
              fullWidth
              label="Amount (PLN)"
              type="number"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(e.target.value)}
              placeholder="Enter amount"
              inputProps={{ min: 0, max: 999999, step: 0.01 }}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
                label="Category"
              >
                {categories.map((category: any) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddExpense(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddExpense} 
            variant="contained"
            disabled={!newExpenseName || !newExpenseAmount || !newExpenseCategory || createExpense.isPending}
          >
            {createExpense.isPending ? "Adding..." : "Add Expense"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={showEditExpense} onClose={() => setShowEditExpense(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Expense Name"
              value={editExpenseName}
              onChange={(e) => setEditExpenseName(e.target.value)}
              placeholder="Enter expense name"
              inputProps={{ maxLength: 70 }}
            />
            <TextField
              fullWidth
              label="Amount (PLN)"
              type="number"
              value={editExpenseAmount}
              onChange={(e) => setEditExpenseAmount(e.target.value)}
              placeholder="Enter amount"
              inputProps={{ min: 0, max: 999999, step: 0.01 }}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={editExpenseCategory}
                onChange={(e) => setEditExpenseCategory(e.target.value)}
                label="Category"
              >
                {categories.map((category: any) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditExpense(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateExpense} 
            variant="contained"
            disabled={!editExpenseName || !editExpenseAmount || !editExpenseCategory || updateExpense.isPending}
          >
            {updateExpense.isPending ? "Updating..." : "Update Expense"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
