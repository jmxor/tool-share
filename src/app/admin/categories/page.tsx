"use client";

import { useState, useEffect } from "react";
import { Category } from "@/lib/admin/types";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/admin/actions";
import { Edit, MoreHorizontal, Plus, Tag, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CategoriesManagement() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setIsLoading(true);
    try {
      const result = await getCategories();
      setCategories(result);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError("Category name cannot be empty");
      return;
    }

    try {
      const success = await addCategory(newCategoryName);
      if (success) {
        setNewCategoryName("");
        fetchCategories();
        router.refresh();
      } else {
        setError("Category already exists");
      }
    } catch (error) {
      console.error("Failed to add category:", error);
      setError("Failed to add category");
    }
  };

  const handleEditCategory = async () => {
    if (!editCategory) return;
    if (!editCategoryName.trim()) {
      setError("Category name cannot be empty");
      return;
    }

    try {
      const success = await updateCategory(editCategory.id, editCategoryName);
      if (success) {
        setEditCategory(null);
        setEditCategoryName("");
        fetchCategories();
        router.refresh();
      } else {
        setError("Category name already exists");
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      setError("Failed to update category");
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      const success = await deleteCategory(category.id);
      if (success) {
        fetchCategories();
        router.refresh();
      } else {
        setError("Cannot delete category with associated tools");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      setError("Failed to delete category");
    }
  };

  const openEditDialog = (category: Category) => {
    setEditCategory(category);
    setEditCategoryName(category.name);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="mt-1 text-muted-foreground">
            Manage tool categories and classifications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>Create a new tool category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    setError("");
                  }}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <Button onClick={handleAddCategory} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tool Count</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center">
                      Loading categories...
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {category.toolCount} tool
                          {category.toolCount !== 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Category</DialogTitle>
                                  <DialogDescription>
                                    Update the category name
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Input
                                    placeholder="Category name"
                                    value={
                                      editCategory?.id === category.id
                                        ? editCategoryName
                                        : category.name
                                    }
                                    onChange={(e) => {
                                      setEditCategoryName(e.target.value);
                                      setError("");
                                    }}
                                    onFocus={() => openEditDialog(category)}
                                  />
                                  {error && (
                                    <p className="mt-2 text-sm text-red-500">
                                      {error}
                                    </p>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditCategory(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={handleEditCategory}>
                                    Save Changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  disabled={category.toolCount > 0}
                                  className={
                                    category.toolCount > 0
                                      ? "cursor-not-allowed opacity-50"
                                      : ""
                                  }
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Category</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete the category
                                    &quot{category.name}&quot? This action
                                    cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => {}}>
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleDeleteCategory(category)
                                    }
                                  >
                                    Delete Category
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
