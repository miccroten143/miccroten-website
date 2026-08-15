import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ChevronRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { StoreLayout } from '../components/StoreLayout';
import { EmptyState } from '../components/EmptyState';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeletons';
import { fetchWishlistProducts } from '../services';
import { useWishlistStore } from '../store';
import { useAuth } from '../AuthContext';
import { removeFromWishlistDb } from '../services';
import type { Product } from '../types';

export default function WishlistPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const setIds = useWishlistStore((s) => s.setIds);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchWishlistProducts()
      .then((data) => {
        setProducts(data);
        setIds(data.map((p) => p.id));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [user]);

  const handleRemove = async (productId: number) => {
    toggleWishlist(productId);
    setProducts(products.filter((p) => p.id !== productId));
    try {
      await removeFromWishlistDb(productId);
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (!user) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 max-w-md">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Heart className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view your wishlist</h2>
            <Link to="/login" className="btn btn-primary mt-4">Sign In</Link>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Wishlist</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Heart className="text-rose-500 fill-rose-500" /> My Wishlist
        </h1>

        {loading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <EmptyState
            title="Your wishlist is empty"
            description="Save products you love by tapping the heart icon."
            actionLabel="Browse Products"
            actionTo="/shop"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, i) => (
              <div key={p.id} className="relative">
                <ProductCard product={p} index={i} />
                <button
                  onClick={() => handleRemove(p.id)}
                  className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow text-rose-500 hover:bg-rose-50"
                  aria-label="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
