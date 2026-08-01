import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Product } from '../types';
import { formatINR } from '../utils';
import { useCartStore, useWishlistStore } from '../store';
import { Rating } from './Rating';
import { ImageSlider } from './ImageSlider';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.productIds.includes(product.id));
  const outOfStock = product.stock <= 0;

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -6 }}
      className="group relative bg-white/80 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl border border-white/60 transition-all duration-300 overflow-hidden"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <ImageSlider images={product.images} alt={product.name} className="w-full h-full" />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new_arrival && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500 text-white rounded-full">
                NEW
              </span>
            )}
            {discount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500 text-white rounded-full">
                -{discount}%
              </span>
            )}
            {product.is_bestseller && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500 text-white rounded-full">
                BESTSELLER
              </span>
            )}
          </div>
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
              inWishlist ? 'bg-rose-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
            aria-label="Toggle wishlist"
          >
            <Heart size={16} className={inWishlist ? 'fill-white' : ''} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.short_description}
          </p>
          <div className="mb-3">
            <Rating value={product.rating} count={product.review_count} />
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">{formatINR(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-sm text-gray-400 line-through">
                {formatINR(product.compare_at_price)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            {outOfStock ? (
              <span className="text-xs font-medium text-rose-600">Out of stock</span>
            ) : (
              <span className="text-xs font-medium text-emerald-600">
                In stock ({product.stock})
              </span>
            )}
            <span className="text-xs text-gray-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye size={12} /> View
            </span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          onClick={handleAddCart}
          disabled={outOfStock}
          className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} />
          {outOfStock ? 'Unavailable' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
}
