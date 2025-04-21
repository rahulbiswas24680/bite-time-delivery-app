
import { MenuItem } from '../utils/types';

// Static menu data for demonstration
export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with melted cheese, lettuce, tomato, and special sauce',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Burgers',
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    description: 'Traditional pizza with tomato sauce, mozzarella, and fresh basil',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Pizza',
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce, croutons, parmesan cheese with Caesar dressing',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Salads',
  },
  {
    id: '4',
    name: 'Chicken Wings',
    description: 'Crispy wings tossed in your choice of buffalo, BBQ, or teriyaki sauce',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Appetizers',
  },
  {
    id: '5',
    name: 'Veggie Wrap',
    description: 'Fresh vegetables, hummus, and feta cheese wrapped in a spinach tortilla',
    price: 8.49,
    image: 'https://images.unsplash.com/photo-1640719028782-8230f1bdc515?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Sandwiches',
  },
  {
    id: '6',
    name: 'Chocolate Brownie Sundae',
    description: 'Warm chocolate brownie topped with vanilla ice cream and hot fudge',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    category: 'Desserts',
  },
];

// Helper functions to work with menu data
export const getMenuItemById = (id: string): MenuItem | undefined => {
  return menuItems.find(item => item.id === id);
};

export const getMenuItemsByCategory = (category: string): MenuItem[] => {
  return menuItems.filter(item => item.category === category);
};

export const getMenuCategories = (): string[] => {
  const categories = new Set(menuItems.map(item => item.category));
  return Array.from(categories);
};
