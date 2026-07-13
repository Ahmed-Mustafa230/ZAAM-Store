'use client';

import { motion } from 'framer-motion';

interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const categories: CategoryConfig[] = [
  {
    id: 'shirts',
    label: 'Shirts',
    icon: '👔',
    description: 'Tops, button-downs, casual & formal shirts',
  },
  {
    id: 'pant',
    label: 'Pants',
    icon: '👖',
    description: 'Trousers, chinos, jeans & dress pants',
  },
  {
    id: 'perfume',
    label: 'Perfume',
    icon: '🧴',
    description: 'Fragrances, colognes & attars',
  },
  {
    id: 'watches',
    label: 'Watches',
    icon: '⌚',
    description: 'Wristwatches, smartwatches & luxury timepieces',
  },
];

interface CategorySelectProps {
  onSelect: (category: string) => void;
}

export default function CategorySelect({ onSelect }: CategorySelectProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]">
          What are you listing?
        </h1>
        <p className="text-[var(--color-mid-gray)] text-sm mt-2">
          Choose a product category to get started
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onSelect(cat.id)}
            className="group relative rounded-2xl border-2 border-[var(--color-light-gray)] bg-[var(--color-white)] p-6 text-left transition-all hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-gold)] hover:-translate-y-1"
          >
            <span className="text-4xl block mb-3">{cat.icon}</span>
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)] group-hover:text-[var(--color-accent-dark)] transition-colors">
              {cat.label}
            </h3>
            <p className="text-sm text-[var(--color-mid-gray)] mt-1 leading-relaxed">
              {cat.description}
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Select</span>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
