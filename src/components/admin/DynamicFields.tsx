'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { computeDiscountDetails, computeTaxInfo, formatTaxRate } from '@/lib/pricing';

interface VolumePricingEntry {
  volume: string;
  price: string;
  comparePrice: string;
  taxAmount: string;
}

interface DynamicFieldsProps {
  category: string;
  sizes: string;
  colors: string;
  specifications: Record<string, string>;
  volumePricing: VolumePricingEntry[];
  onChange: (field: string, value: string | Record<string, string>) => void;
  onVolumePricingChange: (vp: VolumePricingEntry[]) => void;
}

const SIZE_OPTIONS: Record<string, string[]> = {
  shirts: ['S', 'M', 'L', 'XL', 'XXL'],
  pants: ['28', '30', '32', '34', '36', '38', '40'],
  perfumes: ['50ml', '100ml', '120ml', '200ml'],
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
  volumePricing = [],
  onChange,
  onVolumePricingChange,
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
        {(category === 'shirts' || category === 'pants') && (
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

        {category === 'perfumes' && (
          <div>
            <label className="block text-sm font-medium text-[var(--color-primary)] mb-3">
              Volume Pricing
            </label>
            <div className="space-y-2.5">
              {SIZE_OPTIONS.perfumes.map((volume) => {
                const entry = volumePricing.find((v) => v.volume === volume);
                const priceNum = parseFloat(entry?.price ?? '');
                const compareNum = parseFloat(entry?.comparePrice ?? '');
                const taxNum = parseFloat(entry?.taxAmount ?? '');
                const { discountPercent, discountAmount } = computeDiscountDetails(
                  Number.isNaN(priceNum) ? 0 : priceNum,
                  Number.isNaN(compareNum) || compareNum === 0 ? null : compareNum
                );
                const showDiscount = discountAmount > 0 && discountPercent > 0;
                const taxRateDisplay = formatTaxRate(
                  computeTaxInfo(Number.isNaN(priceNum) ? 0 : priceNum, Number.isNaN(taxNum) ? 0 : taxNum).taxRate
                );
                return (
                  <div key={volume} className="flex flex-wrap items-center gap-3">
                    <span className="w-14 shrink-0 text-sm font-medium text-[var(--color-dark-gray)]">
                      {volume}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={entry?.price ?? ''}
                      onChange={(e) => {
                        const updated = volumePricing.filter((v) => v.volume !== volume);
                        if (e.target.value) {
                          updated.push({
                            volume,
                            price: e.target.value,
                            comparePrice: entry?.comparePrice || '',
                            taxAmount: entry?.taxAmount || '',
                          });
                        }
                        onVolumePricingChange(updated);
                      }}
                      className="w-28 rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-3 py-2 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Compare at price"
                      value={entry?.comparePrice ?? ''}
                      onChange={(e) => {
                        const updated = volumePricing.filter((v) => v.volume !== volume);
                        if (entry?.price) {
                          updated.push({
                            volume,
                            price: entry.price,
                            comparePrice: e.target.value,
                            taxAmount: entry?.taxAmount || '',
                          });
                        }
                        onVolumePricingChange(updated);
                      }}
                      className="w-36 rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-3 py-2 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Tax Amount"
                      value={entry?.taxAmount ?? ''}
                      onChange={(e) => {
                        const updated = volumePricing.filter((v) => v.volume !== volume);
                        if (entry?.price) {
                          updated.push({
                            volume,
                            price: entry.price,
                            comparePrice: entry?.comparePrice || '',
                            taxAmount: e.target.value,
                          });
                        }
                        onVolumePricingChange(updated);
                      }}
                      className="w-28 rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-3 py-2 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                    />
                    <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--color-cream)] px-3 py-2 text-sm text-[var(--color-dark-gray)]">
                      Tax Rate: <span className="font-medium text-[var(--color-primary)]">{taxRateDisplay}</span>
                    </span>
                    {showDiscount ? (
                      <span className="rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 px-3 py-1 text-xs font-medium text-[var(--color-accent-dark)]">
                        Discount: {discountPercent}% &middot; Save Rs {discountAmount.toLocaleString('en-IN')}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[var(--color-mid-gray)] mt-2">
              Enter a price and tax amount for each bottle size. Tax Rate is read-only and calculated from Tax Amount &divide; Price &times; 100. Volumes without a price will not appear on the website.
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
