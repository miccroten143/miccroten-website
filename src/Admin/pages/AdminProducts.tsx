import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Search, Star, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchAdminProducts, createProduct, updateProduct, deleteProduct, fetchCategories,
} from '../../ecommerce/services';
import { formatINR, slugify } from '../../ecommerce/utils';
import type { Product, Category } from '../../ecommerce/types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    fetchAdminProducts().then(setProducts).catch(() => toast.error('Failed to load products')).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSave = async (data: Partial<Product>, id?: number) => {
    try {
      if (id) {
        const updated = await updateProduct(id, data);
        setProducts(products.map((p) => (p.id === id ? updated : p)));
        toast.success('Product updated');
      } else {
        const created = await createProduct(data);
        setProducts([created, ...products]);
        toast.success('Product created');
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{products.length} total products</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn btn-primary !py-2 !text-sm">
          <Plus size={18} className="mr-1" /> Add Product
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">SKU</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Stock</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center p-8 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-8 text-gray-400">No products found</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {p.is_featured && <Badge color="blue">Featured</Badge>}
                          {p.is_bestseller && <Badge color="amber">Bestseller</Badge>}
                          {p.is_new_arrival && <Badge color="green">New</Badge>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{p.sku ?? '—'}</td>
                  <td className="p-4 font-medium">{formatINR(p.price)}</td>
                  <td className="p-4">
                    <span className={p.stock <= 0 ? 'text-rose-600' : p.stock < 10 ? 'text-amber-600' : 'text-emerald-600'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${p.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <ProductForm
            product={editing}
            categories={categories}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditing(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Badge({ color, children }: { color: 'blue' | 'amber' | 'green'; children: React.ReactNode }) {
  const colors = { blue: 'bg-primary-100 text-primary-700', amber: 'bg-amber-100 text-amber-700', green: 'bg-emerald-100 text-emerald-700' };
  return <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${colors[color]}`}>{children}</span>;
}

function ProductForm({ product, categories, onSave, onClose }: {
  product: Product | null;
  categories: Category[];
  onSave: (data: Partial<Product>, id?: number) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    short_description: product?.short_description ?? '',
    long_description: product?.long_description ?? '',
    price: product?.price ?? 0,
    compare_at_price: product?.compare_at_price ?? 0,
    sku: product?.sku ?? '',
    stock: product?.stock ?? 0,
    category_id: product?.category_id ?? (categories[0]?.id ?? null),
    images: (product?.images ?? []).join('\n'),
    status: product?.status ?? 'published',
    is_featured: product?.is_featured ?? false,
    is_bestseller: product?.is_bestseller ?? false,
    is_new_arrival: product?.is_new_arrival ?? false,
    is_trending: product?.is_trending ?? false,
    warranty: product?.warranty ?? '',
    shipping_info: product?.shipping_info ?? '',
    youtube_url: product?.youtube_url ?? '',
    github_url: product?.github_url ?? '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const images = form.images.split('\n').map((s) => s.trim()).filter(Boolean);
    onSave(
      {
        ...form,
        slug: form.slug || slugify(form.name),
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        stock: Number(form.stock),
        category_id: form.category_id ? Number(form.category_id) : null,
        images,
        specifications: product?.specifications ?? [],
        package_contents: product?.package_contents ?? [],
        downloads: product?.downloads ?? [],
        tags: product?.tags ?? [],
      },
      product?.id
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
            <Field label="SKU"><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="Short Description"><input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className={inputCls} /></Field>
          <Field label="Long Description"><textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} rows={3} className={inputCls} /></Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Price (₹)"><input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputCls} /></Field>
            <Field label="Compare At Price (₹)"><input type="number" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: Number(e.target.value) })} className={inputCls} /></Field>
            <Field label="Stock"><input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select value={form.category_id ?? ''} onChange={(e) => setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })} className={inputCls}>
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'published' | 'draft' })} className={inputCls}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
          </div>
          <Field label="Image URLs (one per line)">
            <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={3} placeholder="https://..." className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Warranty"><input value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} className={inputCls} /></Field>
            <Field label="Shipping Info"><input value={form.shipping_info} onChange={(e) => setForm({ ...form, shipping_info: e.target.value })} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="YouTube URL"><input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} className={inputCls} /></Field>
            <Field label="GitHub URL"><input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'is_featured', label: 'Featured' },
              { key: 'is_bestseller', label: 'Bestseller' },
              { key: 'is_new_arrival', label: 'New Arrival' },
              { key: 'is_trending', label: 'Trending' },
            ].map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} />
                {f.label}
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" className="btn btn-primary flex-1">{product ? 'Update' : 'Create'} Product</button>
            <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
