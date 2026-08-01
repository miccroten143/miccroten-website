import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  Package,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useCartStore, useWishlistStore } from '../store';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.getCount());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link to="/" className="flex items-center ">
            <img src="/assets/logo.png" alt="MICCROTEN" height="98px" width="98px" />
            <span className="text-xl font-bold text-primary-700 hidden sm:inline">MICCROTEN</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-5">
            <NavLink to="/shop" className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`
            }>
              Shop
            </NavLink>
            <Link to="/shop" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors" aria-label="Wishlist">
              <Heart size={20} className={wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors" aria-label="Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="p-2 text-gray-700 hover:text-primary-600 transition-colors" aria-label="Profile">
                  <User size={20} />
                </Link>
                <button onClick={handleSignOut} className="p-2 text-gray-700 hover:text-rose-500 transition-colors" aria-label="Sign out">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary !py-2 !px-4 !text-sm">
                Sign In
              </Link>
            )}
          </nav>

          <button className="md:hidden text-gray-700" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-t overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </form>
                <MobileLink to="/shop" onClick={() => setMobileOpen(false)}>Shop</MobileLink>
                <MobileLink to="/wishlist" onClick={() => setMobileOpen(false)}>
                  <span className="flex items-center gap-2"><Heart size={18} /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</span>
                </MobileLink>
                <MobileLink to="/cart" onClick={() => setMobileOpen(false)}>
                  <span className="flex items-center gap-2"><ShoppingCart size={18} /> Cart {cartCount > 0 && `(${cartCount})`}</span>
                </MobileLink>
                {user ? (
                  <>
                    <MobileLink to="/profile" onClick={() => setMobileOpen(false)}>
                      <span className="flex items-center gap-2"><User size={18} /> Profile</span>
                    </MobileLink>
                    <MobileLink to="/orders" onClick={() => setMobileOpen(false)}>
                      <span className="flex items-center gap-2"><Package size={18} /> Orders</span>
                    </MobileLink>
                    <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="text-left py-2 text-gray-700 hover:text-rose-500 flex items-center gap-2">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </>
                ) : (
                  <MobileLink to="/login" onClick={() => setMobileOpen(false)}>Sign In</MobileLink>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/assets/footer-logo.png" alt="MICCROTEN" height="48px" width="48px" />
                <span className="text-xl font-bold">MICCROTEN</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Pioneering electronic development with cutting-edge RFID and Biomedical IoT solutions for a smarter, more connected world.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Shop</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link to="/category/miccroten-products" className="hover:text-white transition-colors">MICCROTEN Products</Link></li>
                <li><Link to="/category/arduino" className="hover:text-white transition-colors">Arduino</Link></li>
                <li><Link to="/category/raspberry-pi" className="hover:text-white transition-colors">Raspberry Pi</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Account</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
                <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
                <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 MICCROTEN. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 md:gap-6 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</Link>
              <Link to="/refund-policy" className="text-gray-400 hover:text-white text-sm transition-colors">Refunds</Link>
              <Link to="/cancellation-policy" className="text-gray-400 hover:text-white text-sm transition-colors">Cancellation</Link>
              <Link to="/shop" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
                Continue Shopping <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="py-2 text-gray-700 font-medium hover:text-primary-600 transition-colors">
      {children}
    </Link>
  );
}
