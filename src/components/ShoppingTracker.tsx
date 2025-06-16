import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingBag, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CategoryTabs, { ExpenseCategory, AppView } from './CategoryTabs';
import AnalysisDashboard from './AnalysisDashboard';

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

const SITE_OPTIONS = {
  shopping: [
    'SHEIN',
    'Brandy Melville',
    'Hollister',
    'H&M',
    'Zara',
    'Urban Outfitters',
    'Forever 21',
    'Asos',
    'Target',
    'Amazon',
    'Other'
  ],
  groceries: [
    'Walmart',
    'Target',
    'Kroger',
    'Safeway',
    'Whole Foods',
    'Trader Joe\'s',
    'Costco',
    'Sam\'s Club',
    'Aldi',
    'Food Lion',
    'Other'
  ],
  'rent-utilities': [
    'Landlord',
    'Property Management',
    'Electric Company',
    'Gas Company',
    'Water Company',
    'Internet Provider',
    'Cable/TV',
    'Trash Service',
    'Other'
  ]
};

const CATEGORY_LABELS = {
  shopping: 'Shopping',
  groceries: 'Groceries',
  'rent-utilities': 'Rent & Utilities'
};

const ShoppingTracker = () => {
  const [activeView, setActiveView] = useState<AppView>('shopping');
  const [activeCategory, setActiveCategory] = useState<ExpenseCategory>('shopping'); // Initialize activeCategory
  const [currentSite, setCurrentSite] = useState('');
  const [currentItem, setCurrentItem] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [currentData, setCurrentData] = useState<Record<ExpenseCategory, CategoryData>>({
    shopping: { purchases: [], threshold: 0 },
    groceries: { purchases: [], threshold: 0 },
    'rent-utilities': { purchases: [], threshold: 0 }
  });
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyData[]>([]);
  const [showThresholdDialog, setShowThresholdDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [tempThreshold, setTempThreshold] = useState('');

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysLeftInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() - currentDate.getDate();

  // Calculate current category total
  const currentCategoryTotal = currentData[activeCategory].purchases.reduce((sum, purchase) => sum + purchase.price, 0);
  const currentThreshold = currentData[activeCategory].threshold;

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('expenseTrackerData');
    if (savedData) {
      const data = JSON.parse(savedData);
      const savedMonth = data.currentMonth;
      
      // Check if it's a new month
      if (savedMonth !== currentMonth) {
        // Save current month to history if there are purchases
        const hasAnyPurchases = Object.values(data.currentData || {}).some((categoryData: any) => 
          categoryData.purchases && categoryData.purchases.length > 0
        );
        
        if (hasAnyPurchases) {
          const newHistoryEntry: MonthlyData = {
            month: savedMonth,
            categories: data.currentData || {
              shopping: { purchases: [], threshold: 0 },
              groceries: { purchases: [], threshold: 0 },
              'rent-utilities': { purchases: [], threshold: 0 }
            }
          };
          setMonthlyHistory([newHistoryEntry, ...(data.monthlyHistory || [])]);
        } else {
          setMonthlyHistory(data.monthlyHistory || []);
        }
        
        // Reset for new month
        setCurrentData({
          shopping: { purchases: [], threshold: 0 },
          groceries: { purchases: [], threshold: 0 },
          'rent-utilities': { purchases: [], threshold: 0 }
        });
        setShowThresholdDialog(true);
      } else {
        setCurrentData(data.currentData || {
          shopping: { purchases: [], threshold: 0 },
          groceries: { purchases: [], threshold: 0 },
          'rent-utilities': { purchases: [], threshold: 0 }
        });
        setMonthlyHistory(data.monthlyHistory || []);
      }
    } else {
      // First time user
      setShowThresholdDialog(true);
    }
  }, [currentMonth]);

  // Save data to localStorage
  useEffect(() => {
    const dataToSave = {
      currentMonth,
      currentData,
      monthlyHistory
    };
    localStorage.setItem('expenseTrackerData', JSON.stringify(dataToSave));
  }, [currentMonth, currentData, monthlyHistory]);

  const handleAddPurchase = () => {
    if (!currentSite || !currentItem || !currentPrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before adding a purchase.",
        variant: "destructive"
      });
      return;
    }

    const price = parseFloat(currentPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive"
      });
      return;
    }

    const newTotal = currentCategoryTotal + price;
    const remainingBudget = currentThreshold - newTotal;

    // Check threshold warnings
    if (currentThreshold > 0) {
      if (newTotal >= currentThreshold) {
        toast({
          title: "🛑 Budget Threshold Reached!",
          description: `No more ${CATEGORY_LABELS[activeCategory].toLowerCase()} expenses this month!`,
          variant: "destructive"
        });
      } else if (remainingBudget < 5) {
        toast({
          title: "⚠️ Budget Warning",
          description: "Do you really need this right now?",
          variant: "destructive"
        });
      }
    }

    const newPurchase: Purchase = {
      id: Date.now().toString(),
      site: currentSite,
      item: currentItem,
      price: price,
      date: currentDate.toLocaleDateString(),
      category: activeCategory
    };

    setCurrentData(prev => ({
      ...prev,
      [activeCategory]: {
        ...prev[activeCategory],
        purchases: [newPurchase, ...prev[activeCategory].purchases]
      }
    }));

    setCurrentSite('');
    setCurrentItem('');
    setCurrentPrice('');

    toast({
      title: "Purchase Added!",
      description: `Added ${currentItem} from ${currentSite} for $${price.toFixed(2)}`,
    });
  };

  const handleSetThreshold = () => {
    const threshold = parseFloat(tempThreshold);
    if (isNaN(threshold) || threshold <= 0) {
      toast({
        title: "Invalid Threshold",
        description: "Please enter a valid threshold amount.",
        variant: "destructive"
      });
      return;
    }

    setCurrentData(prev => ({
      ...prev,
      [activeCategory]: {
        ...prev[activeCategory],
        threshold: threshold
      }
    }));

    setShowThresholdDialog(false);
    setTempThreshold('');
    
    toast({
      title: "Budget Set!",
      description: `${CATEGORY_LABELS[activeCategory]} budget set to $${threshold.toFixed(2)}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-pink to-baby-pink font-times">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-white/70 backdrop-blur-sm border-b border-baby-pink">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-muted-red" />
          <h1 className="text-3xl font-bold text-muted-red">Expense Tracker</h1>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 text-muted-red mb-1">
            <Calendar className="h-5 w-5" />
            <span className="text-lg font-semibold">{currentDate.toLocaleDateString()}</span>
          </div>
          <div className="text-sm text-muted-red/70">
            {daysLeftInMonth} days till next budget
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Category Navigation */}
        <div className="mb-6">
          <CategoryTabs 
            activeView={activeView} 
            onViewChange={(view) => {
              setActiveView(view);
              if (view !== 'analysis') {
                setActiveCategory(view as ExpenseCategory);
              }
            }} 
          />
        </div>

        {activeView === 'analysis' ? (
          <AnalysisDashboard
            currentData={currentData}
            monthlyHistory={monthlyHistory}
            currentMonth={currentMonth}
          />
        ) : (
          <>
            {/* Budget Overview */}
            <Card className="mb-6 bg-white/80 backdrop-blur-sm border-baby-pink shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-red">
                  <DollarSign className="h-6 w-6" />
                  {currentMonth} {CATEGORY_LABELS[activeCategory]} Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-baby-pink/30 rounded-lg">
                    <p className="text-sm text-muted-red/70 mb-1">Monthly Threshold</p>
                    <p className="text-2xl font-bold text-muted-red">${currentThreshold.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-baby-pink/30 rounded-lg">
                    <p className="text-sm text-muted-red/70 mb-1">Spent This Month</p>
                    <p className="text-2xl font-bold text-muted-red">${currentCategoryTotal.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-baby-pink/30 rounded-lg">
                    <p className="text-sm text-muted-red/70 mb-1">Remaining Budget</p>
                    <p className={`text-2xl font-bold ${(currentThreshold - currentCategoryTotal) < 0 ? 'text-red-600' : 'text-muted-red'}`}>
                      ${Math.max(0, currentThreshold - currentCategoryTotal).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={() => setShowThresholdDialog(true)}
                    variant="outline"
                    className="border-muted-red text-muted-red hover:bg-baby-pink"
                  >
                    Update Budget
                  </Button>
                  <Button 
                    onClick={() => setShowHistoryDialog(true)}
                    variant="outline"
                    className="border-muted-red text-muted-red hover:bg-baby-pink"
                  >
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add Purchase Form */}
            <Card className="mb-6 bg-white/80 backdrop-blur-sm border-baby-pink shadow-lg">
              <CardHeader>
                <CardTitle className="text-muted-red">Add New {CATEGORY_LABELS[activeCategory]} Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={currentSite} onValueChange={setCurrentSite}>
                    <SelectTrigger className="border-baby-pink focus:border-muted-red">
                      <SelectValue placeholder="Select store/service" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-baby-pink">
                      {SITE_OPTIONS[activeCategory].map((site) => (
                        <SelectItem key={site} value={site}>{site}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="What did you buy/pay for?"
                    value={currentItem}
                    onChange={(e) => setCurrentItem(e.target.value)}
                    className="border-baby-pink focus:border-muted-red"
                  />
                  
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price ($)"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    className="border-baby-pink focus:border-muted-red"
                  />
                  
                  <Button 
                    onClick={handleAddPurchase}
                    className="bg-muted-red hover:bg-muted-red/90 text-white"
                  >
                    Add Expense
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Category Purchases */}
            <Card className="bg-white/80 backdrop-blur-sm border-baby-pink shadow-lg">
              <CardHeader>
                <CardTitle className="text-muted-red">{currentMonth} {CATEGORY_LABELS[activeCategory]} Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {currentData[activeCategory].purchases.length === 0 ? (
                  <p className="text-muted-red/70 text-center py-8">No {CATEGORY_LABELS[activeCategory].toLowerCase()} expenses yet this month!</p>
                ) : (
                  <div className="space-y-3">
                    {currentData[activeCategory].purchases.map((purchase) => (
                      <div key={purchase.id} className="flex justify-between items-center p-3 bg-baby-pink/20 rounded-lg">
                        <div>
                          <p className="font-semibold text-muted-red">{purchase.item}</p>
                          <p className="text-sm text-muted-red/70">{purchase.site} • {purchase.date}</p>
                        </div>
                        <p className="font-bold text-muted-red">${purchase.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Set Threshold Dialog */}
      <Dialog open={showThresholdDialog} onOpenChange={setShowThresholdDialog}>
        <DialogContent className="bg-white border-baby-pink">
          <DialogHeader>
            <DialogTitle className="text-muted-red">Set {CATEGORY_LABELS[activeCategory]} Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-red/70">How much do you want to spend on {CATEGORY_LABELS[activeCategory].toLowerCase()} this month?</p>
            <Input
              type="number"
              step="0.01"
              placeholder="Enter budget amount ($)"
              value={tempThreshold}
              onChange={(e) => setTempThreshold(e.target.value)}
              className="border-baby-pink focus:border-muted-red"
            />
            <Button 
              onClick={handleSetThreshold}
              className="w-full bg-muted-red hover:bg-muted-red/90 text-white"
            >
              Set Budget
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="bg-white border-baby-pink max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-muted-red">Expense History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {monthlyHistory.length === 0 ? (
              <p className="text-muted-red/70 text-center py-8">No history available yet!</p>
            ) : (
              monthlyHistory.map((monthData, index) => (
                <Card key={index} className="border-baby-pink">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-muted-red">
                      {monthData.month}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(monthData.categories).map(([category, data]) => {
                        const categoryKey = category as ExpenseCategory;
                        const total = data.purchases.reduce((sum, p) => sum + p.price, 0);
                        return total > 0 ? (
                          <div key={category} className="flex justify-between items-center p-2 bg-baby-pink/10 rounded">
                            <span className="text-sm text-muted-red">{CATEGORY_LABELS[categoryKey]}</span>
                            <span className="text-sm text-muted-red font-semibold">
                              ${total.toFixed(2)} / ${data.threshold.toFixed(2)}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppingTracker;