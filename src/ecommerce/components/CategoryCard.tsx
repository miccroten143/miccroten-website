import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { Category } from '../types';

export function CategoryCard({ category, index = 0 }: { category: Category; index?: number }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[
    category.icon ?? 'Cpu'
  ] ?? LucideIcons.Cpu;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -6 }}
    >
      <Link
        to={`/category/${category.slug}`}
        className="group block relative bg-white/80 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl border border-white/60 transition-all duration-300 overflow-hidden"
      >
        <div className="relative aspect-[5/3] overflow-hidden">
          {category.image_url && (
            <img
              src={category.image_url}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent" />
          <div className="absolute top-3 left-3 w-10 h-10 rounded-full gradient-bg flex items-center justify-center shadow-lg">
            <IconComponent className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <p className="text-xs text-gray-500 line-clamp-1">{category.description}</p>
          </div>
          <ArrowRight
            size={18}
            className="text-primary-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all"
          />
        </div>
      </Link>
    </motion.div>
  );
}
