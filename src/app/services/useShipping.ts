import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ShippingQuote, QuoteResult } from '@/app/shipping/types';

interface ShippingQuotesParams {
  restaurantId: string;
  destinationLat: number;
  destinationLng: number;
  orderTotal?: number;
  customerId?: string;
  scheduledTime?: string;
}

export function useShippingQuotes(params: ShippingQuotesParams | null) {
  return useQuery<QuoteResult>({
    queryKey: ['shipping-quotes', params],
    queryFn: async () => {
      if (!params) return { quotes: [] };
      const res = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Failed to fetch quotes');
      return res.json();
    },
    enabled: !!params?.restaurantId && !!params?.destinationLat && !!params?.destinationLng,
  });
}

export function useSelectQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quoteId,
      orderId,
      customerId,
    }: {
      quoteId: string;
      orderId: string;
      customerId?: string;
    }) => {
      const res = await fetch('/api/shipping/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, orderId, customerId }),
      });
      if (!res.ok) throw new Error('Failed to select quote');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useSetManualPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      price,
      restaurantId,
    }: {
      orderId: string;
      price: number;
      restaurantId: string;
    }) => {
      const res = await fetch('/api/shipping/manual-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, price, restaurantId }),
      });
      if (!res.ok) throw new Error('Failed to set manual price');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
