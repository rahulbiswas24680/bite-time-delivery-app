
import React from 'react';
import { MenuItem } from '../../utils/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface MenuCardProps {
  item: MenuItem;
  onAddToOrder: (item: MenuItem) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToOrder }) => {
  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
        <CardDescription className="text-food-darkGray text-sm">{item.category}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
        <p className="mt-3 text-lg font-bold text-food-orange">${item.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-food-orange hover:bg-orange-600"
          onClick={() => onAddToOrder(item)}
        >
          Add to Order
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MenuCard;
