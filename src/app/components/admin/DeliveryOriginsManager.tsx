'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface DeliveryOrigin {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  maxCapacity: number;
  currentLoad: number;
  operatingHours: Array<{ day: string; open: string; close: string }>;
}

interface DeliveryOriginsManagerProps {
  restaurantId: string;
}

export function DeliveryOriginsManager({ restaurantId }: DeliveryOriginsManagerProps) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: origins, isLoading } = useQuery({
    queryKey: ['delivery-origins', restaurantId],
    queryFn: async () => {
      const res = await fetch(`/api/delivery-origins?restaurantId=${restaurantId}`);
      if (!res.ok) throw new Error('Failed to fetch origins');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (originId: string) => {
      // Soft delete - set isActive to false
      const res = await fetch(`/api/delivery-origins/${originId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
      if (!res.ok) throw new Error('Failed to delete origin');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-origins', restaurantId] });
    },
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">배달 출발지 관리</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + 출발지 추가
        </button>
      </div>

      {/* Origins list */}
      <div className="space-y-2">
        {origins?.docs?.map((origin: DeliveryOrigin) => (
          <div
            key={origin.id}
            className={`p-4 border rounded-lg ${!origin.isActive ? 'opacity-50' : ''}`}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{origin.name}</h3>
                <p className="text-sm text-gray-500">{origin.address}</p>
                <p className="text-xs text-gray-400">
                  용량: {origin.currentLoad}/{origin.maxCapacity}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(origin.id)}
                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                >
                  수정
                </button>
                <button
                  onClick={() => deleteMutation.mutate(origin.id)}
                  disabled={deleteMutation.isPending}
                  className="px-3 py-1 text-sm text-red-500 bg-red-50 rounded hover:bg-red-100"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!origins?.docs || origins.docs.length === 0) && (
        <p className="text-gray-500 text-center py-4">
          등록된 배달 출발지가 없습니다. 출발지를 추가해주세요.
        </p>
      )}

      {/* TODO: Add form modal */}
      {/* TODO: Kakao Maps integration for address selection */}
    </div>
  );
}
