import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronRight } from 'lucide-react';
import { StoreLayout } from '../components/StoreLayout';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { ProductGridSkeleton, CategoryGridSkeleton } from '../components/Skeletons';
import { EmptyState } from '../components/EmptyState';
import { fetchCategories, fetchProducts } from '../services';
import { useCartStore } from '../store';
import type { Category, Product, ProductFilters } from '../types';
import { Link } from 'react-router-dom';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sort, setSort] = useState<ProductFilters['sort']>('featured');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setSearch(q);
    const filters: ProductFilters = {
      search: q,
      categoryId,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      sort,
    };
    setLoading(true);
    fetchProducts(filters)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [searchParams, categoryId, minPrice, maxPrice, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(search.trim() ? { q: search.trim() } : {});
  };

  const clearFilters = () => {
    setCategoryId(null);
    setMinPrice('');
    setMaxPrice('');
    setSort('featured');
    setSearchParams({});
  };

  const hasActiveFilters = categoryId || minPrice || maxPrice || searchParams.get('q');

  return (
    <StoreLayout>
      {/* Hero banner */}
      <section className="relative h-56 md:h-72 overflow-hidden bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80"
          alt="Shop"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-transparent" />
        <div className="relative container mx-auto px-4 md:px-6 lg:px-8 h-full flex flex-col justify-center">
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-sm text-primary-100 mb-3"
          >
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">Shop</span>
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-white mb-2"
          >
            Explore Our <span className="text-primary-200">Store</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-primary-100 text-lg max-w-xl"
          >
            Premium electronics, IoT modules, and development boards for builders and innovators.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10">
        {/* Search + sort bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, categories, tags..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400"
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          </form>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700"
            >
              <SlidersHorizontal size={18} /> Filters
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductFilters['sort'])}
              className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-md p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Categories</h4>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => setCategoryId(null)}
                      className={`block w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                        categoryId === null ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryId(cat.id)}
                        className={`block w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                          categoryId === cat.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Price Range (₹)</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {loading ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try adjusting your filters or search query to find what you're looking for."
                actionLabel="Clear Filters"
                actionTo="/shop"
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}

            {/* Categories showcase when no filter active */}
            {!hasActiveFilters && !loading && (
              <div className="mt-16">
                <div className="text-center mb-8">
                  <h2 className="section-title">Shop by <span className="text-gradient">Category</span></h2>
                  <p className="section-subtitle">Browse our curated electronics categories</p>
                </div>
                {categories.length === 0 ? (
                  <CategoryGridSkeleton />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((cat, i) => (
                      <CategoryCard key={cat.id} category={cat} index={i} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
