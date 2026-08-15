import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export function Rating({
  value,
  count,
  size = 14,
  interactive = false,
  onChange,
}: {
  value: number;
  count?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            disabled={!interactive}
            whileHover={interactive ? { scale: 1.2 } : undefined}
            onClick={() => interactive && onChange?.(star)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            aria-label={`${star} star`}
          >
            <Star
              size={size}
              className={
                star <= Math.round(value)
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              }
            />
          </motion.button>
        ))}
      </div>
      {count != null && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
}
