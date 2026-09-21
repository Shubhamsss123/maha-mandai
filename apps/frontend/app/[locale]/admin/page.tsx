"use client";

import type { Route } from "next";
import { FormEvent, useEffect, useState } from "react";

import { RequireAdmin } from "@/components/auth/RequireAuth";
import { Badge, OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert, EmptyState } from "@/components/ui/Feedback";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Container, PageHeader } from "@/components/ui/PageHeader";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";

type Category = { id: number; name_en: string; name_mr: string };
type Product = {
  id: number;
  slug: string;
  name_en: string;
  name_mr: string;
  description_en: string;
  description_mr: string;
  original_price: number;
  discounted_price: number;
  stock_quantity: number;
  image_url: string;
  category_id: number;
  is_active: boolean;
};
type Order = { id: number; order_status: string; payment_status: string; total_amount: number };
type Customer = { id: number; mobile_number: string; role: string; is_verified: boolean };
type Pincode = { id: number; pincode: string; active: boolean };

const emptyProductForm = {
  slug: "",
  name_en: "",
  name_mr: "",
  description_en: "",
  description_mr: "",
  original_price: 0,
  discounted_price: 0,
  stock_quantity: 0,
  image_url: "",
  category_id: 0,
  is_active: true,
};

const orderTransitions = ["confirmed", "packed", "out_for_delivery", "delivered"];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminContent() {
  const { isFullAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pincodes, setPincodes] = useState<Pincode[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [categoryNameEn, setCategoryNameEn] = useState("");
  const [categoryNameMr, setCategoryNameMr] = useState("");
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [newPincode, setNewPincode] = useState("");

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadAll = () => {
    setError("");
    Promise.all([
      apiGet<Category[]>("/api/v1/admin/categories"),
      apiGet<Product[]>("/api/v1/admin/products"),
      apiGet<Order[]>("/api/v1/admin/orders"),
      apiGet<Customer[]>("/api/v1/admin/customers"),
      apiGet<Pincode[]>("/api/v1/admin/pincodes"),
    ])
      .then(([categoryRows, productRows, orderRows, customerRows, pincodeRows]) => {
        setCategories(categoryRows);
        setProducts(productRows);
        setOrders(orderRows);
        setCustomers(customerRows);
        setPincodes(pincodeRows);
      })
      .catch((err: Error) => setError(err.message));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const createCategory = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await apiPost("/api/v1/admin/categories", { name_en: categoryNameEn, name_mr: categoryNameMr });
      setCategoryNameEn("");
      setCategoryNameMr("");
      flash("Category created");
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    }
  };

  const createProduct = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await apiPost("/api/v1/admin/products", productForm);
      flash("Product created");
      setProductForm(emptyProductForm);
      setSlugTouched(false);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    }
  };

  const toggleOrderStatus = async (orderId: number, next: string) => {
    try {
      await apiPatch(`/api/v1/admin/orders/${orderId}/status/${next}`);
      flash(`Order ${orderId} updated to ${next}`);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    }
  };

  const togglePincode = async (code: string, active: boolean) => {
    try {
      await apiPatch(`/api/v1/admin/pincodes/${code}/active/${active}`);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update pincode");
    }
  };

  const createPincode = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await apiPost(`/api/v1/admin/pincodes/${newPincode}`, {});
      setNewPincode("");
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add pincode");
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      await apiDelete(`/api/v1/admin/products/${productId}`);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      await apiDelete(`/api/v1/admin/categories/${categoryId}`);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const saveCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingCategory) return;
    try {
      await apiPut(`/api/v1/admin/categories/${editingCategory.id}`, {
        name_en: editingCategory.name_en,
        name_mr: editingCategory.name_mr,
      });
      flash("Category updated");
      setEditingCategory(null);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    }
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingProduct) return;
    try {
      await apiPut(`/api/v1/admin/products/${editingProduct.id}`, editingProduct);
      flash("Product updated");
      setEditingProduct(null);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    }
  };

  const deleteCustomer = async (customerId: number) => {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    try {
      await apiDelete(`/api/v1/admin/customers/${customerId}`);
      flash("Customer deleted");
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer");
    }
  };

  const deletePincode = async (code: string) => {
    try {
      await apiDelete(`/api/v1/admin/pincodes/${code}`);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete pincode");
    }
  };

  return (
    <Container className="max-w-6xl">
      <PageHeader title="Admin Dashboard" subtitle="Manage products, categories, orders, customers, and serviceable pincodes." />
      {message ? (
        <div className="mt-4">
          <Alert variant="success">{message}</Alert>
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
          {isFullAdmin ? (
            <form className="mt-3 space-y-2" onSubmit={createCategory}>
              <Input placeholder="Name (English)" value={categoryNameEn} onChange={(e) => setCategoryNameEn(e.target.value)} />
              <Input placeholder="Name (Marathi)" value={categoryNameMr} onChange={(e) => setCategoryNameMr(e.target.value)} />
              <Button type="submit" size="sm">
                Create
              </Button>
            </form>
          ) : null}
          <div className="mt-4 space-y-2 text-sm">
            {categories.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-brand-100 px-3 py-2">
                <span>
                  {item.name_en} / {item.name_mr}
                </span>
                {isFullAdmin ? (
                  <div className="flex gap-3">
                    <button className="font-medium text-brand-700 hover:underline" onClick={() => setEditingCategory(item)} type="button">
                      Edit
                    </button>
                    <button className="font-medium text-rose-600 hover:underline" onClick={() => deleteCategory(item.id)} type="button">
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        {isFullAdmin ? (
        <Card className="ring-1 ring-brand-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Create Product</h2>
            <Badge variant="accent">Admin only</Badge>
          </div>
          <form className="mt-3 space-y-3" onSubmit={createProduct}>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Name (English)"
                value={productForm.name_en}
                onChange={(e) =>
                  setProductForm((p) => ({
                    ...p,
                    name_en: e.target.value,
                    slug: slugTouched ? p.slug : slugify(e.target.value),
                  }))
                }
              />
              <Input
                label="Name (Marathi)"
                value={productForm.name_mr}
                onChange={(e) => setProductForm((p) => ({ ...p, name_mr: e.target.value }))}
              />
              <div className="col-span-2">
                <Input
                  label="Slug"
                  hint="Auto-filled from the name. This becomes the product's URL identifier and must be unique — usually no need to edit it."
                  value={productForm.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setProductForm((p) => ({ ...p, slug: e.target.value }));
                  }}
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Image URL"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm((p) => ({ ...p, image_url: e.target.value }))}
                />
              </div>
              <Input
                label="Original Price (₹)"
                type="number"
                value={productForm.original_price}
                onChange={(e) => setProductForm((p) => ({ ...p, original_price: Number(e.target.value) }))}
              />
              <Input
                label="Discounted Price (₹)"
                type="number"
                value={productForm.discounted_price}
                onChange={(e) => setProductForm((p) => ({ ...p, discounted_price: Number(e.target.value) }))}
              />
              <Input
                label="Stock Quantity"
                type="number"
                value={productForm.stock_quantity}
                onChange={(e) => setProductForm((p) => ({ ...p, stock_quantity: Number(e.target.value) }))}
              />
              <Select
                label="Category"
                value={productForm.category_id}
                onChange={(e) => setProductForm((p) => ({ ...p, category_id: Number(e.target.value) }))}
              >
                <option value={0}>Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_en}
                  </option>
                ))}
              </Select>
            </div>
            <Textarea
              label="Description (English)"
              value={productForm.description_en}
              onChange={(e) => setProductForm((p) => ({ ...p, description_en: e.target.value }))}
            />
            <Textarea
              label="Description (Marathi)"
              value={productForm.description_mr}
              onChange={(e) => setProductForm((p) => ({ ...p, description_mr: e.target.value }))}
            />
            <Button type="submit" size="sm">
              Create Product
            </Button>
          </form>
        </Card>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Products</h2>
          <div className="mt-3 space-y-2 text-sm">
            {products.length === 0 ? (
              <EmptyState title="No products" icon="🥕" />
            ) : (
              products.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg border border-brand-100 px-3 py-2">
                  <span>
                    {product.name_en} | ₹{product.discounted_price} | Stock {product.stock_quantity}
                  </span>
                  <div className="flex gap-3">
                    <button className="font-medium text-brand-700 hover:underline" onClick={() => setEditingProduct(product)} type="button">
                      Edit
                    </button>
                    <button className="font-medium text-rose-600 hover:underline" onClick={() => deleteProduct(product.id)} type="button">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Orders</h2>
          <div className="mt-3 space-y-2 text-sm">
            {orders.length === 0 ? (
              <EmptyState title="No orders" icon="📦" />
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-brand-100 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p>
                      Order #{order.id} | ₹{order.total_amount}
                    </p>
                    <OrderStatusBadge status={order.order_status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Payment: {order.payment_status}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {orderTransitions.map((next) => (
                      <button
                        key={next}
                        className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700"
                        onClick={() => toggleOrderStatus(order.id, next)}
                        type="button"
                      >
                        {next.replaceAll("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Customers</h2>
          <div className="mt-3 space-y-2 text-sm">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between rounded-lg border border-brand-100 px-3 py-2">
                <span>
                  #{customer.id} | {customer.mobile_number}
                </span>
                <Badge variant={customer.role === "admin" ? "accent" : "neutral"}>{customer.role}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Serviceable Pincodes</h2>
          <form className="mt-3 flex gap-2" onSubmit={createPincode}>
            <Input placeholder="Add PIN code" value={newPincode} onChange={(e) => setNewPincode(e.target.value)} />
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>
          <div className="mt-3 space-y-2 text-sm">
            {pincodes.map((pin) => (
              <div key={pin.id} className="flex items-center justify-between rounded-lg border border-brand-100 px-3 py-2">
                <span className="flex items-center gap-2">
                  {pin.pincode} <Badge variant={pin.active ? "success" : "neutral"}>{pin.active ? "active" : "inactive"}</Badge>
                </span>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700"
                    onClick={() => togglePincode(pin.pincode, !pin.active)}
                    type="button"
                  >
                    {pin.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700"
                    onClick={() => deletePincode(pin.pincode)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={!!editingCategory} onClose={() => setEditingCategory(null)} title="Edit Category">
        {editingCategory ? (
          <form className="space-y-3" onSubmit={saveCategory}>
            <Input
              label="Name (English)"
              value={editingCategory.name_en}
              onChange={(e) => setEditingCategory({ ...editingCategory, name_en: e.target.value })}
            />
            <Input
              label="Name (Marathi)"
              value={editingCategory.name_mr}
              onChange={(e) => setEditingCategory({ ...editingCategory, name_mr: e.target.value })}
            />
            <Button type="submit" fullWidth>
              Save Changes
            </Button>
          </form>
        ) : null}
      </Modal>

      <Modal open={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Product">
        {editingProduct ? (
          <form className="space-y-3" onSubmit={saveProduct}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Name (English)"
                value={editingProduct.name_en}
                onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
              />
              <Input
                label="Name (Marathi)"
                value={editingProduct.name_mr}
                onChange={(e) => setEditingProduct({ ...editingProduct, name_mr: e.target.value })}
              />
            </div>
            <Input
              label="Slug"
              hint="Used in the product's URL and must stay unique."
              value={editingProduct.slug}
              onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
            />
            <Input
              label="Image URL"
              value={editingProduct.image_url}
              onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Original Price (₹)"
                type="number"
                value={editingProduct.original_price}
                onChange={(e) => setEditingProduct({ ...editingProduct, original_price: Number(e.target.value) })}
              />
              <Input
                label="Discounted Price (₹)"
                type="number"
                value={editingProduct.discounted_price}
                onChange={(e) => setEditingProduct({ ...editingProduct, discounted_price: Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Stock Quantity"
                type="number"
                value={editingProduct.stock_quantity}
                onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
              />
              <Select
                label="Category"
                value={editingProduct.category_id}
                onChange={(e) => setEditingProduct({ ...editingProduct, category_id: Number(e.target.value) })}
              >
                <option value={0}>Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_en}
                  </option>
                ))}
              </Select>
            </div>
            <Textarea
              label="Description (English)"
              value={editingProduct.description_en}
              onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })}
            />
            <Textarea
              label="Description (Marathi)"
              value={editingProduct.description_mr}
              onChange={(e) => setEditingProduct({ ...editingProduct, description_mr: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-brand-200"
                checked={editingProduct.is_active}
                onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
              />
              Active (visible to customers)
            </label>
            <Button type="submit" fullWidth>
              Save Changes
            </Button>
          </form>
        ) : null}
      </Modal>
    </Container>
  );
}

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminContent />
    </RequireAdmin>
  );
}
