import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { StoreLayout } from '../components/StoreLayout';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeletons';
import { EmptyState } from '../components/EmptyState';
import { fetchCategoryBySlug, fetchProducts } from '../services';
import type { Category, Product, ProductFilters } from '../types';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<ProductFilters['sort']>('featured');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setCategory(null);
    fetchCategoryBySlug(slug)
      .then((cat) => {
        setCategory(cat);
        if (cat) {
          return fetchProducts({
            search: '',
            categoryId: cat.id,
            minPrice: null,
            maxPrice: null,
            sort,
          }).then(setProducts);
        }
        setProducts([]);
      })
      .catch(() => {
        setCategory(null);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!category) return;
    fetchProducts({
      search: '',
      categoryId: category.id,
      minPrice: null,
      maxPrice: null,
      sort,
    }).then(setProducts);
  }, [sort, category]);

  const isMiccroten = slug === 'miccroten-products';

  return (
    <StoreLayout>
      {/* Hero */}
      <section className="relative h-48 md:h-64 overflow-hidden bg-gradient-to-r from-primary-700 to-primary-500">
        {category?.image_url && (
          <img
            src={category.image_url}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-transparent" />
        <div className="relative container mx-auto px-4 md:px-6 lg:px-8 h-full flex flex-col justify-center">
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-sm text-primary-100 mb-2"
          >
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <Link to="/shop" className="hover:text-white">Shop</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">{category?.name ?? 'Category'}</span>
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-white mb-1"
          >
            {category?.name ?? 'Loading...'}
          </motion.h1>
          {category?.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-primary-100 max-w-xl"
            >
              {category.description}
            </motion.p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10">
        {isMiccroten && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-6 md:p-8 mb-8 text-white shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-2">Proprietary MICCROTEN Technology</h2>
            <p className="text-primary-50 max-w-2xl">
              Our in-house engineered RFID and Biomedical IoT devices with AI integration, built for industrial and healthcare applications.
            </p>
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ProductFilters['sort'])}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {loading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products in this category"
            description="We're stocking up. Check back soon or explore other categories."
            actionLabel="Browse Shop"
            actionTo="/shop"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
