
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type ExpenseCategory = 'shopping' | 'groceries' | 'rent-utilities';
export type AppView = ExpenseCategory | 'analysis';

interface CategoryTabsProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

const CategoryTabs = ({ activeView, onViewChange }: CategoryTabsProps) => {
  return (
    <Tabs value={activeView} onValueChange={(value) => onViewChange(value as ExpenseCategory)}>
      <TabsList className="grid w-full grid-cols-4 bg-white/80 border-baby-pink">
        <TabsTrigger 
          value="shopping" 
          className="text-muted-red data-[state=active]:bg-baby-pink data-[state=active]:text-muted-red"
        >
          Shopping
        </TabsTrigger>
        <TabsTrigger 
          value="groceries"
          className="text-muted-red data-[state=active]:bg-baby-pink data-[state=active]:text-muted-red"
        >
          Groceries
        </TabsTrigger>
        <TabsTrigger 
          value="rent-utilities"
          className="text-muted-red data-[state=active]:bg-baby-pink data-[state=active]:text-muted-red"
        >
          Rent & Utilities
        </TabsTrigger>
        <TabsTrigger 
          value="analysis"
          className="text-muted-red data-[state=active]:bg-baby-pink data-[state=active]:text-muted-red"
        >
          Analysis
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default CategoryTabs;
