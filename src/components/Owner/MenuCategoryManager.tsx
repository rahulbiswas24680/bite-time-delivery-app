
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

// Demo data (should be replaced by backend in real world)
const initialCategories = [
  { id: "1", name: "Burgers" },
  { id: "2", name: "Pizza" },
  { id: "3", name: "Salads" },
  { id: "4", name: "Drinks" },
];
const initialShops = [
  { id: "shop1", name: "Downtown Pizza" },
  { id: "shop2", name: "Burger Point" },
];

const MenuCategoryManager: React.FC = () => {
  const [categoriesByShop, setCategoriesByShop] = useState<Record<string, { id: string, name: string }[]>>({
    shop1: [...initialCategories],
    shop2: [
      { id: "1", name: "Classics" },
      { id: "2", name: "Specials" },
    ],
  });
  const [selectedShop, setSelectedShop] = useState("shop1");
  const [newCategory, setNewCategory] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  // Add new category
  const handleAdd = () => {
    if (!newCategory.trim()) return;
    setCategoriesByShop(prev => ({
      ...prev,
      [selectedShop]: [
        ...prev[selectedShop],
        { id: Date.now().toString(), name: newCategory }
      ]
    }));
    setNewCategory("");
  };

  // Delete category
  const handleDelete = (id: string) => {
    setCategoriesByShop(prev => ({
      ...prev,
      [selectedShop]: prev[selectedShop].filter(cat => cat.id !== id),
    }));
  };

  // Update category name
  const handleEdit = () => {
    if (!editing) return;
    setCategoriesByShop(prev => ({
      ...prev,
      [selectedShop]: prev[selectedShop].map(cat =>
        cat.id === editing.id ? { ...cat, name: editing.name } : cat
      ),
    }));
    setEditing(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Menu Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Shop selector for owner */}
        <label className="block mb-1 font-medium">Shop</label>
        <select
          className="border p-2 mb-3 rounded"
          value={selectedShop}
          onChange={e => setSelectedShop(e.target.value)}
        >
          {initialShops.map(shop => (
            <option key={shop.id} value={shop.id}>{shop.name}</option>
          ))}
        </select>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(categoriesByShop[selectedShop] || []).map(category => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary" onClick={() => setEditing({ ...category })}>
                        Edit
                      </Button>
                    </DialogTrigger>
                    {editing && editing.id === category.id && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Category</DialogTitle>
                        </DialogHeader>
                        <Input
                          className="mb-2"
                          value={editing.name}
                          onChange={e => setEditing(editing ? { ...editing, name: e.target.value } : null)}
                        />
                        <DialogFooter>
                          <Button onClick={handleEdit}>Save</Button>
                          <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>
                  <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(category.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {categoriesByShop[selectedShop]?.length === 0 && (
              <TableRow><TableCell colSpan={2}>No categories yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="New Category"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
          />
          <Button onClick={handleAdd}>Add</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuCategoryManager;
