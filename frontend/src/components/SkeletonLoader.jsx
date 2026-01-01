/**
 * SkeletonLoader - Glass shimmer loading state
 */

import { motion } from 'framer-motion';

export default function SkeletonLoader({ lines = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="shimmer rounded-lg"
          style={{
            height: '16px',
            width: i === lines - 1 ? '60%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 max-w-[85%]">
      <div className="space-y-3">
        {/* Trace bar skeleton */}
        <div className="flex gap-2">
          <div className="shimmer rounded-full w-16 h-5" />
          <div className="shimmer rounded-full w-14 h-5" />
        </div>
        
        {/* Content skeleton */}
        <SkeletonLoader lines={4} />
      </div>
    </div>
  );
}
