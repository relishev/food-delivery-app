'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

interface ManualPriceResponseProps {
  orderId: string;
  price: number;
  customerId: string;
  onComplete: (action: 'accept' | 'reject') => void;
}

export function ManualPriceResponse({
  orderId,
  price,
  customerId,
  onComplete,
}: ManualPriceResponseProps) {
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (action: 'accept' | 'reject') => {
      const res = await fetch('/api/shipping/customer-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action, customerId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to process response');
      }
      return res.json();
    },
    onSuccess: (_, action) => {
      onComplete(action);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleAccept = () => mutation.mutate('accept');
  const handleReject = () => mutation.mutate('reject');

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-medium text-yellow-800">배달비 확인</h3>
      <p className="text-lg mt-2">
        식당에서 배달비를 설정했습니다: <strong>₩{price.toLocaleString()}</strong>
      </p>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleAccept}
          disabled={mutation.isPending}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {mutation.isPending ? '처리중...' : '수락하기'}
        </button>
        <button
          onClick={handleReject}
          disabled={mutation.isPending}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
        >
          {mutation.isPending ? '처리중...' : '주문 취소'}
        </button>
      </div>
    </div>
  );
}
