'use client';

import type { ShippingQuote } from '@/app/shipping/types';

interface ShippingQuoteCardProps {
  quote: ShippingQuote;
  selected: boolean;
  onSelect: () => void;
  loading?: boolean;
}

export function ShippingQuoteCard({ quote, selected, onSelect, loading }: ShippingQuoteCardProps) {
  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-24" />;
  }

  const isPendingPrice = quote.price === -1;
  const priceDisplay = isPendingPrice
    ? '가격 대기중'
    : `₩${quote.price.toLocaleString()}`;

  return (
    <div
      onClick={onSelect}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{quote.providerName}</h3>
          <p className="text-sm text-gray-500">
            약 {quote.estimatedMinutes}분 소요
          </p>
          {quote.features && quote.features.length > 0 && (
            <div className="flex gap-1 mt-1">
              {quote.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${isPendingPrice ? 'text-orange-500' : ''}`}>
            {priceDisplay}
          </p>
          {isPendingPrice && (
            <p className="text-xs text-gray-400">식당에서 설정 예정</p>
          )}
        </div>
      </div>
    </div>
  );
}
