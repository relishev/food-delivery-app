'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShippingQuoteCard } from './ShippingQuoteCard';
import type { ShippingQuote, QuoteResult } from '@/app/shipping/types';

interface ShippingOptionsSelectorProps {
  restaurantId: string;
  address: { lat: number; lng: number; fullAddress?: string };
  orderTotal: number;
  onSelect: (quote: ShippingQuote) => void;
  onSchedule?: (time: Date | null) => void;
}

export function ShippingOptionsSelector({
  restaurantId,
  address,
  orderTotal,
  onSelect,
  onSchedule,
}: ShippingOptionsSelectorProps) {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'eta'>('price');

  const { data, isLoading, error } = useQuery<QuoteResult>({
    queryKey: ['shipping-quotes', restaurantId, address.lat, address.lng, orderTotal, scheduledTime?.toISOString()],
    queryFn: async () => {
      const res = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          destinationLat: address.lat,
          destinationLng: address.lng,
          orderTotal,
          scheduledTime: scheduledTime?.toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Failed to fetch quotes');
      return res.json();
    },
    enabled: !!restaurantId && !!address.lat && !!address.lng,
  });

  const quotes = data?.quotes || [];
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (sortBy === 'price') {
      // Sort pending prices (-1) to the end
      if (a.price === -1 && b.price !== -1) return 1;
      if (b.price === -1 && a.price !== -1) return -1;
      return a.price - b.price;
    }
    return a.estimatedMinutes - b.estimatedMinutes;
  });

  // Check for free delivery threshold
  const freeDeliveryQuote = quotes.find(
    (q: ShippingQuote) => {
      const freeAfter = q.metadata?.freeAfterAmount;
      return typeof freeAfter === 'number' && orderTotal < freeAfter;
    }
  );

  const handleSelect = (quote: ShippingQuote) => {
    setSelectedQuoteId(quote.quoteId);
    onSelect(quote);
  };

  const handleDeliveryTimeChange = (mode: 'asap' | 'scheduled') => {
    setDeliveryTime(mode);
    if (mode === 'asap') {
      setScheduledTime(null);
      onSchedule?.(null);
    }
  };

  const handleScheduledTimeChange = (time: Date) => {
    setScheduledTime(time);
    onSchedule?.(time);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <ShippingQuoteCard
            key={i}
            quote={{} as ShippingQuote}
            selected={false}
            onSelect={() => {}}
            loading={true}
          />
        ))}
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        배달 옵션을 불러올 수 없습니다. 다시 시도해주세요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Delivery time selector */}
      <div className="flex gap-2">
        <button
          onClick={() => handleDeliveryTimeChange('asap')}
          className={`px-4 py-2 rounded transition-colors ${
            deliveryTime === 'asap'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          바로 배달
        </button>
        <button
          onClick={() => handleDeliveryTimeChange('scheduled')}
          className={`px-4 py-2 rounded transition-colors ${
            deliveryTime === 'scheduled'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          예약 배달
        </button>
      </div>

      {/* Scheduled time picker (shown when scheduled is selected) */}
      {deliveryTime === 'scheduled' && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm text-gray-600 mb-2">배달 예약 시간</label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 border rounded-lg"
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => handleScheduledTimeChange(new Date(e.target.value))}
          />
        </div>
      )}

      {/* Free delivery indicator */}
      {freeDeliveryQuote && typeof freeDeliveryQuote.metadata?.freeAfterAmount === 'number' && (
        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          ₩{(freeDeliveryQuote.metadata.freeAfterAmount - orderTotal).toLocaleString()} 더 담으면 무료배달!
        </div>
      )}

      {/* Sort toggle */}
      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setSortBy('price')}
          className={`px-3 py-1 rounded ${sortBy === 'price' ? 'font-bold bg-gray-100' : ''}`}
        >
          가격순
        </button>
        <button
          onClick={() => setSortBy('eta')}
          className={`px-3 py-1 rounded ${sortBy === 'eta' ? 'font-bold bg-gray-100' : ''}`}
        >
          빠른순
        </button>
      </div>

      {/* Quote cards */}
      <div className="space-y-2">
        {sortedQuotes.map((quote: ShippingQuote) => (
          <ShippingQuoteCard
            key={quote.quoteId}
            quote={quote}
            selected={selectedQuoteId === quote.quoteId}
            onSelect={() => handleSelect(quote)}
          />
        ))}
      </div>

      {quotes.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          현재 이용 가능한 배달 옵션이 없습니다.
        </p>
      )}
    </div>
  );
}
