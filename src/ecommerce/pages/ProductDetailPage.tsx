import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Heart, ShoppingCart, Share2, Minus, Plus, Truck, ShieldCheck,
  Download, FileText, Youtube, Github, Star, Check, X, Maximize2, ChevronLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StoreLayout } from '../components/StoreLayout';
import { Rating } from '../components/Rating';
import { ProductCard } from '../components/ProductCard';
import { LineSkeleton } from '../components/Skeletons';
import { EmptyState } from '../components/EmptyState';
import {
  fetchProductById, fetchRelatedProducts, fetchReviews, addReview,
} from '../services';
import { useCartStore, useWishlistStore, useRecentlyViewedStore } from '../store';
import { useAuth } from '../AuthContext';
import { formatINR, deliveryEstimate } from '../utils';
import type { Product, Review } from '../types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'description' | 'specifications' | 'reviews' | 'faqs'>('description');

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.productIds.includes(Number(id)));
  const addRecent = useRecentlyViewedStore((s) => s.add);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setActiveImage(0);
    setQty(1);
    setTab('description');
    fetchProductById(Number(id))
      .then((p) => {
        setProduct(p);
        if (p) {
          addRecent(p.id);
          fetchRelatedProducts(p.id, p.category_id, 4).then(setRelated);
          fetchReviews(p.id).then(setReviews);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddCart = () => {
    if (!product) return;
    addItem(product, qty);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, qty);
    window.location.href = '/cart';
  };

  const handleWishlist = () => {
    if (!product) return;
    toggleWishlist(product.id);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product?.name, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <LineSkeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <LineSkeleton className="h-8 w-3/4" />
              <LineSkeleton className="h-6 w-1/3" />
              <LineSkeleton className="h-4 w-full" />
              <LineSkeleton className="h-4 w-2/3" />
              <LineSkeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <EmptyState
          title="Product not found"
          description="The product you're looking for may have been removed."
          actionLabel="Browse Shop"
          actionTo="/shop"
        />
      </StoreLayout>
    );
  }

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;
  const outOfStock = product.stock <= 0;

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-primary-600">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Gallery */}
          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square bg-white rounded-xl shadow-md overflow-hidden group"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={product.images[activeImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              <button
                onClick={() => setZoom(true)}
                className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Zoom"
              >
                <Maximize2 size={18} className="text-gray-700" />
              </button>
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((i) => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => setActiveImage((i) => (i + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={18} className="text-gray-700" />
                  </button>
                </>
              )}
            </motion.div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImage ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex flex-wrap gap-2 mb-3">
              {product.is_new_arrival && <Badge color="emerald">NEW</Badge>}
              {product.is_bestseller && <Badge color="amber">BESTSELLER</Badge>}
              {product.is_featured && <Badge color="primary">FEATURED</Badge>}
              {discount > 0 && <Badge color="rose">-{discount}% OFF</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <Rating value={product.rating} count={product.review_count} size={18} />
              <span className="text-sm text-gray-500">SKU: {product.sku ?? '—'}</span>
            </div>
            <p className="text-gray-600 mb-6">{product.short_description}</p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">{formatINR(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-lg text-gray-400 line-through">{formatINR(product.compare_at_price)}</span>
              )}
              {discount > 0 && (
                <span className="text-sm font-semibold text-emerald-600">Save {formatINR((product.compare_at_price ?? 0) - product.price)}</span>
              )}
            </div>

            <div className="mb-6">
              {outOfStock ? (
                <span className="inline-flex items-center gap-2 text-rose-600 font-medium"><X size={18} /> Out of stock</span>
              ) : (
                <span className="inline-flex items-center gap-2 text-emerald-600 font-medium"><Check size={18} /> In stock ({product.stock} available)</span>
              )}
            </div>

            {/* Quantity + actions */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-gray-600 hover:bg-gray-50" disabled={outOfStock}>
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="p-3 text-gray-600 hover:bg-gray-50" disabled={outOfStock}>
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-gray-500">Total: {formatINR(product.price * qty)}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button onClick={handleAddCart} disabled={outOfStock} className="btn btn-secondary flex-1 disabled:opacity-40">
                <ShoppingCart size={18} className="mr-2" /> Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={outOfStock} className="btn btn-primary flex-1 disabled:opacity-40">
                Buy Now
              </button>
              <button onClick={handleWishlist} className={`p-3 rounded-lg border transition-colors ${inWishlist ? 'border-rose-300 bg-rose-50 text-rose-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Heart size={18} className={inWishlist ? 'fill-rose-500' : ''} />
              </button>
              <button onClick={handleShare} className="p-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                <Share2 size={18} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Truck className="h-5 w-5 text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Free Shipping</p>
                  <p className="text-xs text-gray-500">Orders over ₹2,000</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Warranty</p>
                  <p className="text-xs text-gray-500">{product.warranty ?? 'Standard'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Truck className="h-5 w-5 text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Delivery</p>
                  <p className="text-xs text-gray-500">{deliveryEstimate()}</p>
                </div>
              </div>
            </div>

            {/* Downloads */}
            {product.downloads.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Download size={18} /> Downloads & Resources</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.downloads.map((dl, i) => (
                    <a key={i} href={dl.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm text-primary-600 hover:underline">
                      <DownloadIcon type={dl.type} />
                      <span className="truncate">{dl.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Media links */}
            {(product.youtube_url || product.github_url) && (
              <div className="flex gap-3 mt-4">
                {product.youtube_url && (
                  <a href={product.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-red-600 hover:underline">
                    <Youtube size={18} /> Watch on YouTube
                  </a>
                )}
                {product.github_url && (
                  <a href={product.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-900 hover:underline">
                    <Github size={18} /> View on GitHub
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-12">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {(['description', 'specifications', 'reviews', 'faqs'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-4 text-sm font-medium capitalize whitespace-nowrap transition-colors relative ${
                  tab === t ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t}
                {tab === t && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">{product.long_description ?? product.short_description}</p>
                {product.package_contents.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold text-gray-900 mb-3">Package Contents</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {product.package_contents.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-600">
                          <Check size={16} className="text-emerald-500" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {tab === 'specifications' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-3 px-4 font-medium text-gray-900 w-1/3">{spec.label}</td>
                        <td className="py-3 px-4 text-gray-600">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {tab === 'reviews' && (
              <ReviewsSection productId={product.id} reviews={reviews} setReviews={setReviews} canReview={!!user} />
            )}
            {tab === 'faqs' && (
              <div className="space-y-4">
                {defaultFaqs.map((faq, i) => (
                  <div key={i} className="border-b border-gray-100 pb-4">
                    <h4 className="font-semibold text-gray-900 mb-1">{faq.q}</h4>
                    <p className="text-gray-600 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(false)}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          >
            <button className="absolute top-4 right-4 text-white p-2" onClick={() => setZoom(false)}>
              <X size={28} />
            </button>
            <img src={product.images[activeImage]} alt={product.name} className="max-w-full max-h-full object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </StoreLayout>
  );
}

function Badge({ color, children }: { color: 'emerald' | 'amber' | 'primary' | 'rose'; children: React.ReactNode }) {
  const colors = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    primary: 'bg-primary-600',
    rose: 'bg-rose-500',
  };
  return <span className={`px-2.5 py-1 text-xs font-semibold text-white rounded-full ${colors[color]}`}>{children}</span>;
}

function DownloadIcon({ type }: { type: string }) {
  const map: Record<string, React.ElementType> = {
    pdf: FileText, datasheet: FileText, manual: FileText, driver: Download,
    circuit: FileText, code: FileText, github: Github,
  };
  const Icon = map[type] ?? Download;
  return <Icon size={16} />;
}

const defaultFaqs = [
  { q: 'What is the warranty period?', a: 'This product comes with the manufacturer warranty as listed above. Extended warranty options may be available at checkout.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3-7 business days depending on your location. Express options are available at checkout.' },
  { q: 'Can I return this product?', a: 'Yes, products can be returned within 7 days of delivery if unused and in original packaging. See our return policy for details.' },
  { q: 'Do you provide technical support?', a: 'Yes, our team provides technical support for all MICCROTEN products. Contact us via the support page for assistance.' },
];

function ReviewsSection({
  productId, reviews, setReviews, canReview,
}: {
  productId: number;
  reviews: Review[];
  setReviews: (r: Review[]) => void;
  canReview: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newReview = await addReview(productId, rating, title, body);
      setReviews([newReview, ...reviews]);
      setTitle('');
      setBody('');
      setRating(5);
      toast.success('Review submitted');
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
            <Rating value={avgRating} size={16} />
            <p className="text-xs text-gray-500 mt-1">{reviews.length} reviews</p>
          </div>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <Rating value={r.rating} size={14} />
                  {r.verified && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><Check size={12} /> Verified</span>}
                </div>
                {r.title && <h4 className="font-semibold text-gray-900 text-sm">{r.title}</h4>}
                <p className="text-gray-600 text-sm">{r.body}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        {canReview ? (
          <form onSubmit={submit} className="space-y-4">
            <h4 className="font-bold text-gray-900">Write a Review</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <Rating value={rating} interactive onChange={setRating} size={24} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <Star className="h-10 w-10 text-amber-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-2">Sign in to write a review</p>
            <p className="text-sm text-gray-500 mb-4">Only verified customers can leave reviews.</p>
            <Link to="/login" className="btn btn-primary">Sign In</Link>
          </div>
        )}
      </div>
    </div>
  );
}
