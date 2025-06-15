
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingBag, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Purchase {
  id: string;
  site: string;
  item: string;
  price: number;
  date: string;
}

interface MonthlyData {
  month: string;
  purchases: Purchase[];
  total: number;
  threshold: number;
}

const SHOPPING_SITES = [
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
];

const ShoppingTracker = () => {
  const [currentSite, setCurrentSite] = useState('');
  const [currentItem, setCurrentItem] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [monthlyThreshold, setMonthlyThreshold] = useState(0);
  const [currentPurchases, setCurrentPurchases] = useState<Purchase[]>([]);
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyData[]>([]);
  const [showThresholdDialog, setShowThresholdDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [tempThreshold, setTempThreshold] = useState('');

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysLeftInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() - currentDate.getDate();

  // Calculate current month total
  const currentMonthTotal = currentPurchases.reduce((sum, purchase) => sum + purchase.price, 0);

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('shoppingTrackerData');
    if (savedData) {
      const data = JSON.parse(savedData);
      const savedMonth = data.currentMonth;
      
      // Check if it's a new month
      if (savedMonth !== currentMonth) {
        // Save current month to history if there are purchases
        if (data.currentPurchases && data.currentPurchases.length > 0) {
          const newHistoryEntry: MonthlyData = {
            month: savedMonth,
            purchases: data.currentPurchases,
            total: data.currentPurchases.reduce((sum: number, p: Purchase) => sum + p.price, 0),
            threshold: data.monthlyThreshold || 0
          };
          setMonthlyHistory([newHistoryEntry, ...(data.monthlyHistory || [])]);
        } else {
          setMonthlyHistory(data.monthlyHistory || []);
        }
        
        // Reset for new month
        setCurrentPurchases([]);
        setMonthlyThreshold(0);
        setShowThresholdDialog(true);
      } else {
        setCurrentPurchases(data.currentPurchases || []);
        setMonthlyThreshold(data.monthlyThreshold || 0);
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
      currentPurchases,
      monthlyThreshold,
      monthlyHistory
    };
    localStorage.setItem('shoppingTrackerData', JSON.stringify(dataToSave));
  }, [currentMonth, currentPurchases, monthlyThreshold, monthlyHistory]);

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

    const newTotal = currentMonthTotal + price;
    const remainingBudget = monthlyThreshold - newTotal;

    // Check threshold warnings
    if (monthlyThreshold > 0) {
      if (newTotal >= monthlyThreshold) {
        toast({
          title: "🛑 Budget Threshold Reached!",
          description: "No more retail therapy this month!",
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
      date: currentDate.toLocaleDateString()
    };

    setCurrentPurchases([newPurchase, ...currentPurchases]);
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

    setMonthlyThreshold(threshold);
    setShowThresholdDialog(false);
    setTempThreshold('');
    
    toast({
      title: "Budget Set!",
      description: `Monthly budget set to $${threshold.toFixed(2)}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-pink to-baby-pink font-times">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-white/70 backdrop-blur-sm border-b border-baby-pink">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-muted-red" />
          <h1 className="text-3xl font-bold text-muted-red">Shopping Tracker</h1>
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
        {/* Budget Overview */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-baby-pink shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-red">
              <DollarSign className="h-6 w-6" />
              {currentMonth} Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-baby-pink/30 rounded-lg">
                <p className="text-sm text-muted-red/70 mb-1">Monthly Threshold</p>
                <p className="text-2xl font-bold text-muted-red">${monthlyThreshold.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-baby-pink/30 rounded-lg">
                <p className="text-sm text-muted-red/70 mb-1">Spent This Month</p>
                <p className="text-2xl font-bold text-muted-red">${currentMonthTotal.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-baby-pink/30 rounded-lg">
                <p className="text-sm text-muted-red/70 mb-1">Remaining Budget</p>
                <p className={`text-2xl font-bold ${(monthlyThreshold - currentMonthTotal) < 0 ? 'text-red-600' : 'text-muted-red'}`}>
                  ${Math.max(0, monthlyThreshold - currentMonthTotal).toFixed(2)}
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
            <CardTitle className="text-muted-red">Add New Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={currentSite} onValueChange={setCurrentSite}>
                <SelectTrigger className="border-baby-pink focus:border-muted-red">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent className="bg-white border-baby-pink">
                  {SHOPPING_SITES.map((site) => (
                    <SelectItem key={site} value={site}>{site}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="What did you buy?"
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
                Add Purchase
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Month Purchases */}
        <Card className="bg-white/80 backdrop-blur-sm border-baby-pink shadow-lg">
          <CardHeader>
            <CardTitle className="text-muted-red">{currentMonth} Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {currentPurchases.length === 0 ? (
              <p className="text-muted-red/70 text-center py-8">No purchases yet this month!</p>
            ) : (
              <div className="space-y-3">
                {currentPurchases.map((purchase) => (
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
      </div>

      {/* Set Threshold Dialog */}
      <Dialog open={showThresholdDialog} onOpenChange={setShowThresholdDialog}>
        <DialogContent className="bg-white border-baby-pink">
          <DialogHeader>
            <DialogTitle className="text-muted-red">Set Monthly Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-red/70">How much do you want to spend on shopping this month?</p>
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
            <DialogTitle className="text-muted-red">Shopping History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {monthlyHistory.length === 0 ? (
              <p className="text-muted-red/70 text-center py-8">No history available yet!</p>
            ) : (
              monthlyHistory.map((monthData, index) => (
                <Card key={index} className="border-baby-pink">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-muted-red flex justify-between">
                      {monthData.month}
                      <span>${monthData.total.toFixed(2)} / ${monthData.threshold.toFixed(2)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {monthData.purchases.slice(0, 3).map((purchase) => (
                        <div key={purchase.id} className="flex justify-between text-sm">
                          <span className="text-muted-red/70">{purchase.item} from {purchase.site}</span>
                          <span className="text-muted-red">${purchase.price.toFixed(2)}</span>
                        </div>
                      ))}
                      {monthData.purchases.length > 3 && (
                        <p className="text-xs text-muted-red/50">...and {monthData.purchases.length - 3} more</p>
                      )}
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
