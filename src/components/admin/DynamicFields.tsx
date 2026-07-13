'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface DynamicFieldsProps {
  category: string;
  sizes: string;
  colors: string;
  specifications: Record<string, string>;
  onChange: (field: string, value: any) => void;
}

const SIZE_OPTIONS: Record<string, string[]> = {
  shirts: ['S', 'M', 'L', 'XL', 'XXL'],
  pant: ['28', '30', '32', '34', '36', '38', '40'],
  perfume: ['50ml', '100ml', '120ml', '200ml'],
};

const WATCH_SPECS = [
  { key: 'strap_material', label: 'Strap Material', placeholder: 'e.g. Leather, Stainless Steel' },
  { key: 'case_material', label: 'Case Material', placeholder: 'e.g. Titanium, Gold Plated' },
  { key: 'dial_color', label: 'Dial Color', placeholder: 'e.g. Black, Blue, White' },
  { key: 'movement', label: 'Movement', placeholder: 'e.g. Automatic, Quartz' },
  { key: 'water_resistance', label: 'Water Resistance', placeholder: 'e.g. 50m, 100m, 200m' },
  { key: 'warranty', label: 'Warranty', placeholder: 'e.g. 2 Years, 5 Years' },
];

function ChipSelect({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
}) {
  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
            selected.includes(opt)
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-deep-black)] shadow-[var(--shadow-gold)]'
              : 'border-[var(--color-light-gray)] text-[var(--color-dark-gray)] hover:border-[var(--color-mid-gray)]'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function DynamicFields({
  category,
  sizes,
  colors,
  specifications,
  onChange,
}: DynamicFieldsProps) {
  const selectedSizes = sizes ? sizes.split(',').map(s => s.trim()).filter(Boolean) : [];
  const selectedColors = colors ? colors.split(',').map(c => c.trim()).filter(Boolean) : [];

  const handleColorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const val = input.value.trim();
      if (val && !selectedColors.includes(val)) {
        onChange('colors', [...selectedColors, val].join(', '));
      }
      input.value = '';
    }
  };

  const removeColor = (color: string) => {
    onChange('colors', selectedColors.filter(c => c !== color).join(', '));
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {(category === 'shirts' || category === 'pant') && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--color-primary)] mb-3">
                Available Sizes
              </label>
              <ChipSelect
                options={SIZE_OPTIONS[category]}
                selected={selectedSizes}
                onChange={(vals) => onChange('sizes', vals.join(', '))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-primary)] mb-1.5">
                Colors
              </label>
              <input
                type="text"
                onKeyDown={handleColorKeyDown}
                placeholder="Type a color and press Enter"
                className="w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              {selectedColors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedColors.map(color => (
                    <span
                      key={color}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cream)] border border-[var(--color-light-gray)] px-3 py-1 text-xs font-medium text-[var(--color-dark-gray)]"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="text-[var(--color-mid-gray)] hover:text-[var(--color-error)] transition-colors"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {category === 'perfume' && (
          <div>
            <label className="block text-sm font-medium text-[var(--color-primary)] mb-3">
              Available Volumes
            </label>
            <ChipSelect
              options={SIZE_OPTIONS.perfume}
              selected={selectedSizes}
              onChange={(vals) => onChange('sizes', vals.join(', '))}
            />
            <p className="text-xs text-[var(--color-mid-gray)] mt-2">
              Select all bottle sizes this fragrance is available in
            </p>
          </div>
        )}

        {category === 'watches' && (
          <div className="grid gap-6 sm:grid-cols-2">
            {WATCH_SPECS.map(spec => (
              <div key={spec.key}>
                <label className="block text-sm font-medium text-[var(--color-primary)] mb-1.5">
                  {spec.label}
                </label>
                <input
                  type="text"
                  value={specifications[spec.key] || ''}
                  onChange={(e) =>
                    onChange('specifications', {
                      ...specifications,
                      [spec.key]: e.target.value,
                    })
                  }
                  placeholder={spec.placeholder}
                  className="w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
