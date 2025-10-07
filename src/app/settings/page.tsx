"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Switch,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useTheme } from "@/app/providers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useProfile, useUpdateProfile } from "@/lib/hooks/useProfile";
import {
  useRecurringExpenses,
  useCreateRecurringExpense,
  useUpdateRecurringExpense,
  useDeleteRecurringExpense,
} from "@/lib/hooks/useRecurringExpenses";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/lib/hooks/useCategories";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { mode, toggleMode } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Fetch data
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: recurringExpenses = [], isLoading: expensesLoading } = useRecurringExpenses();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData?.categories || [];

  // Mutations
  const updateProfile = useUpdateProfile();
  const createExpense = useCreateRecurringExpense();
  const updateExpense = useUpdateRecurringExpense();
  const deleteExpense = useDeleteRecurringExpense();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Local state
  const [monthlySalary, setMonthlySalary] = useState("");
  const [firstTrackedMonth, setFirstTrackedMonth] = useState<Date | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("");
  const [editingExpense, setEditingExpense] = useState<{ id: string; name: string; amountCents: number; categoryId: string } | null>(null);
  
  // Category state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setMonthlySalary((profile.defaultSalaryCents / 100).toString());
      setFirstTrackedMonth(new Date(profile.firstTrackedMonth));
    }
  }, [profile]);

  // Handlers
  const handleSalaryBlur = () => {
    if (monthlySalary && !isNaN(parseFloat(monthlySalary))) {
      const cents = Math.round(parseFloat(monthlySalary) * 100);
      updateProfile.mutate({ defaultSalaryCents: cents });
    }
  };

  const handleFirstMonthChange = (newValue: Date | null) => {
    setFirstTrackedMonth(newValue);
    if (newValue) {
      updateProfile.mutate({ firstTrackedMonth: newValue.toISOString() });
    }
  };

  const handleAddExpense = () => {
    if (newExpenseName && newExpenseAmount && newExpenseCategory) {
      const cents = Math.round(parseFloat(newExpenseAmount) * 100);
      createExpense.mutate(
        {
          name: newExpenseName,
          amountCents: cents,
          categoryId: newExpenseCategory,
        },
        {
          onSuccess: () => {
            setNewExpenseName("");
            setNewExpenseAmount("");
            setNewExpenseCategory("");
            setShowAddExpense(false);
          },
        }
      );
    }
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setNewExpenseName(expense.name);
    setNewExpenseAmount((expense.amountCents / 100).toString());
    setNewExpenseCategory(expense.categoryId);
    setShowAddExpense(true);
  };

  const handleUpdateExpense = () => {
    if (editingExpense && newExpenseName && newExpenseAmount && newExpenseCategory) {
      const cents = Math.round(parseFloat(newExpenseAmount) * 100);
      updateExpense.mutate(
        {
          id: editingExpense.id,
          name: newExpenseName,
          amountCents: cents,
          categoryId: newExpenseCategory,
        },
        {
          onSuccess: () => {
            setEditingExpense(null);
            setNewExpenseName("");
            setNewExpenseAmount("");
            setNewExpenseCategory("");
            setShowAddExpense(false);
          },
        }
      );
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm("Are you sure you want to delete this recurring expense?")) {
      deleteExpense.mutate(id);
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createCategory.mutate(
        { name: newCategoryName.trim() },
        {
          onSuccess: () => {
            setNewCategoryName("");
            setShowAddCategory(false);
          },
          onError: (error: any) => {
            alert(error.message || "Failed to create category");
          },
        }
      );
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setShowAddCategory(true);
  };

  const handleUpdateCategory = () => {
    if (editingCategory && newCategoryName.trim()) {
      updateCategory.mutate(
        {
          id: editingCategory.id,
          name: newCategoryName.trim(),
        },
        {
          onSuccess: () => {
            setEditingCategory(null);
            setNewCategoryName("");
            setShowAddCategory(false);
          },
          onError: (error: any) => {
            alert(error.message || "Failed to update category");
          },
        }
      );
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category? This will only work if no expenses are using it.")) {
      deleteCategory.mutate(id, {
        onError: (error: any) => {
          alert(error.message || "Failed to delete category");
        },
      });
    }
  };

  if (profileLoading || expensesLoading || categoriesLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Settings
        </Typography>

        <Stack spacing={3}>
          {/* Theme Toggle */}
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="h6">Theme:</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography>Light</Typography>
                  <Switch
                    checked={mode === "dark"}
                    onChange={toggleMode}
                    inputProps={{ "aria-label": "theme toggle" }}
                  />
                  <Typography>Dark</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Monthly Salary */}
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ minWidth: 150 }}>
                  Monthly salary:
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
            </CardContent>
          </Card>

          {/* First Tracked Month */}
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ minWidth: 150 }}>
                  First tracked month:
                </Typography>
                {mounted ? (
                  <DatePicker
                    value={firstTrackedMonth}
                    onChange={handleFirstMonthChange}
                    views={["year", "month"]}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                      },
                    }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    disabled
                    placeholder="Loading..."
                  />
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6">Categories:</Typography>
                <IconButton
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategoryName("");
                    setShowAddCategory(true);
                  }}
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

              <List>
                {categories.map((category: any) => (
                  <ListItem
                    key={category.id}
                    secondaryAction={
                      <Box>
                        <IconButton edge="end" onClick={() => handleEditCategory(category)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteCategory(category.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={category.name}
                      slotProps={{
                        primary: { fontWeight: 500 }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Recurring Expenses */}
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6">Recurring expenses:</Typography>
                <IconButton
                  onClick={() => {
                    setEditingExpense(null);
                    setNewExpenseName("");
                    setNewExpenseAmount("");
                    setNewExpenseCategory("");
                    setShowAddExpense(true);
                  }}
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

              <List>
                {recurringExpenses.map((expense) => (
                  <ListItem
                    key={expense.id}
                    secondaryAction={
                      <Box>
                        <IconButton edge="end" onClick={() => handleEditExpense(expense)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteExpense(expense.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={expense.name}
                      secondary={`${(expense.amountCents / 100).toFixed(2)}`}
                      slotProps={{
                        primary: { fontWeight: 500 }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setShowChangePassword(true)}
            >
              Change password
            </Button>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={() => setShowDeleteAccount(true)}
            >
              Delete account
            </Button>
          </Box>
        </Stack>

        {/* Add/Edit Expense Dialog */}
        <Dialog open={showAddExpense} onClose={() => setShowAddExpense(false)}>
          <DialogTitle>
            {editingExpense ? "Edit Recurring Expense" : "Add Recurring Expense"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
              <TextField
                label="Name"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                fullWidth
                inputProps={{ maxLength: 70 }}
              />
              <TextField
                label="Amount"
                type="number"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                fullWidth
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
            <Button onClick={() => setShowAddExpense(false)}>Cancel</Button>
            <Button
              onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
              variant="contained"
              disabled={createExpense.isPending || updateExpense.isPending}
            >
              {(createExpense.isPending || updateExpense.isPending) ? (
                <CircularProgress size={24} />
              ) : (
                editingExpense ? "Update" : "Add"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add/Edit Category Dialog */}
        <Dialog open={showAddCategory} onClose={() => setShowAddCategory(false)}>
          <DialogTitle>
            {editingCategory ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
              <TextField
                label="Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                fullWidth
                inputProps={{ maxLength: 50 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddCategory(false)}>Cancel</Button>
            <Button
              onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
              variant="contained"
              disabled={createCategory.isPending || updateCategory.isPending}
            >
              {(createCategory.isPending || updateCategory.isPending) ? (
                <CircularProgress size={24} />
              ) : (
                editingCategory ? "Update" : "Add"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={showChangePassword} onClose={() => setShowChangePassword(false)}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
              <TextField label="Current Password" type="password" fullWidth />
              <TextField label="New Password" type="password" fullWidth />
              <TextField label="Confirm New Password" type="password" fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowChangePassword(false)}>Cancel</Button>
            <Button variant="contained">Change Password</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={showDeleteAccount} onClose={() => setShowDeleteAccount(false)}>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              This action cannot be undone. All your data will be permanently deleted.
            </Alert>
            <TextField
              label="Type 'DELETE' to confirm"
              fullWidth
              placeholder="DELETE"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteAccount(false)}>Cancel</Button>
            <Button color="error" variant="contained">
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}
