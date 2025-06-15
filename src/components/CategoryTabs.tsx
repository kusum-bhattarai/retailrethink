
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type ExpenseCategory = 'shopping' | 'groceries' | 'rent-utilities';

interface CategoryTabsProps {
  activeCategory: ExpenseCategory;
  onCategoryChange: (category: ExpenseCategory) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <Tabs value={activeCategory} onValueChange={(value) => onCategoryChange(value as ExpenseCategory)}>
      <TabsList className="grid w-full grid-cols-3 bg-white/80 border-baby-pink">
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
      </TabsList>
    </Tabs>
  );
};

export default CategoryTabs;
