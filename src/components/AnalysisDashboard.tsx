import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartPie, TrendingUp, BarChart3 } from 'lucide-react';
import { ExpenseCategory } from './CategoryTabs';

interface Purchase {
  id: string;
  site: string;
  item: string;
  price: number;
  date: string;
  category: ExpenseCategory;
}

interface CategoryData {
  purchases: Purchase[];
  threshold: number;
}

interface MonthlyData {
  month: string;
  categories: Record<ExpenseCategory, CategoryData>;
}

interface AnalysisDashboardProps {
  currentData: Record<ExpenseCategory, CategoryData>;
  monthlyHistory: MonthlyData[];
  currentMonth: string;
}

const CATEGORY_LABELS = {
  shopping: 'Shopping',
  groceries: 'Groceries',
  'rent-utilities': 'Rent & Utilities'
};

const COLORS = {
  shopping: '#E8B4CB',
  groceries: '#F4C2C2',
  'rent-utilities': '#DDB892'
};

const AnalysisDashboard = ({ currentData, monthlyHistory, currentMonth }: AnalysisDashboardProps) => {
  // Calculate current month spending by category
  const currentSpendingData = Object.entries(currentData).map(([category, data]) => {
    const total = data.purchases.reduce((sum, purchase) => sum + purchase.price, 0);
    return {
      name: CATEGORY_LABELS[category as ExpenseCategory],
      value: total,
      category: category as ExpenseCategory,
      budget: data.threshold
    };
  }).filter(item => item.value > 0);

  // Calculate budget vs actual data
  const budgetComparisonData = Object.entries(currentData).map(([category, data]) => {
    const spent = data.purchases.reduce((sum, purchase) => sum + purchase.price, 0);
    return {
      category: CATEGORY_LABELS[category as ExpenseCategory],
      budget: data.threshold,
      spent: spent,
      remaining: Math.max(0, data.threshold - spent)
    };
  });

  // Calculate trends over last 6 months (including current)
  const trendsData = [];
  const allMonthsData = [{ month: currentMonth, categories: currentData }, ...monthlyHistory];
  
  for (let i = 0; i < Math.min(6, allMonthsData.length); i++) {
    const monthData = allMonthsData[i];
    const monthTotal = Object.values(monthData.categories).reduce((sum, categoryData) => {
      return sum + categoryData.purchases.reduce((catSum, purchase) => catSum + purchase.price, 0);
    }, 0);
    
    trendsData.unshift({
      month: monthData.month.split(' ')[0], // Just month name
      total: monthTotal,
      shopping: monthData.categories.shopping?.purchases.reduce((sum, p) => sum + p.price, 0) || 0,
      groceries: monthData.categories.groceries?.purchases.reduce((sum, p) => sum + p.price, 0) || 0,
      'rent-utilities': monthData.categories['rent-utilities']?.purchases.reduce((sum, p) => sum + p.price, 0) || 0
    });
  }

  const totalSpent = currentSpendingData.reduce((sum, item) => sum + item.value, 0);
  const totalBudget = Object.values(currentData).reduce((sum, data) => sum + data.threshold, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-baby-pink">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-red/70">Total Spent</p>
                <p className="text-2xl font-bold text-muted-red">${totalSpent.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-red/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-baby-pink">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-red/70">Total Budget</p>
                <p className="text-2xl font-bold text-muted-red">${totalBudget.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-red/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-baby-pink">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-red/70">Budget Usage</p>
                <p className="text-2xl font-bold text-muted-red">
                  {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <ChartPie className="h-8 w-8 text-muted-red/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Distribution Pie Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border-baby-pink">
          <CardHeader>
            <CardTitle className="text-muted-red flex items-center gap-2">
              <ChartPie className="h-5 w-5" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentSpendingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={currentSpendingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {currentSpendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.category]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-red/70">
                No spending data for this month
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget vs Actual Bar Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border-baby-pink">
          <CardHeader>
            <CardTitle className="text-muted-red flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Budget vs Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8B4CB" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: '#8B5A5A', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#8B5A5A', fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [`$${value}`, name]}
                  labelStyle={{ color: '#8B5A5A' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #E8B4CB' 
                  }}
                />
                <Bar dataKey="budget" fill="#E8B4CB" name="Budget" />
                <Bar dataKey="spent" fill="#8B5A5A" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trends Line Chart */}
      {trendsData.length > 1 && (
        <Card className="bg-white/80 backdrop-blur-sm border-baby-pink">
          <CardHeader>
            <CardTitle className="text-muted-red flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Spending Trends (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8B4CB" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#8B5A5A', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#8B5A5A', fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [`$${value}`, name]}
                  labelStyle={{ color: '#8B5A5A' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #E8B4CB' 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="shopping" 
                  stroke="#E8B4CB" 
                  strokeWidth={2}
                  name="Shopping"
                />
                <Line 
                  type="monotone" 
                  dataKey="groceries" 
                  stroke="#F4C2C2" 
                  strokeWidth={2}
                  name="Groceries"
                />
                <Line 
                  type="monotone" 
                  dataKey="rent-utilities" 
                  stroke="#DDB892" 
                  strokeWidth={2}
                  name="Rent & Utilities"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#8B5A5A" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisDashboard;
