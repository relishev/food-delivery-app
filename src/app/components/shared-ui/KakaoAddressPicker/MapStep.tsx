'use client';

import { useState, useCallback } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/shared-ui/Button';
import { MapPosition } from './types';

interface MapStepProps {
  position: MapPosition;
  address: string;
  onConfirm: (position: MapPosition) => void;
  onBack: () => void;
}

export default function MapStep({ position, address, onConfirm, onBack }: MapStepProps) {
  const t = useTranslations('KakaoAddress');
  const [markerPosition, setMarkerPosition] = useState<MapPosition>(position);

  const handleMarkerDragEnd = useCallback((marker: kakao.maps.Marker) => {
    const latlng = marker.getPosition();
    setMarkerPosition({
      lat: latlng.getLat(),
      lng: latlng.getLng(),
    });
  }, []);

  const handleMapClick = useCallback((_: kakao.maps.Map, mouseEvent: kakao.maps.event.MouseEvent) => {
    const latlng = mouseEvent.latLng;
    setMarkerPosition({
      lat: latlng.getLat(),
      lng: latlng.getLng(),
    });
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(markerPosition);
  }, [markerPosition, onConfirm]);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-gray-600">
        <p className="font-medium">{address}</p>
        <p className="mt-1 text-xs text-gray-500">{t('dragMarkerHint')}</p>
      </div>

      <div className="h-[350px] sm:h-[220px] w-full overflow-hidden rounded-lg border border-gray-200">
        <Map
          center={markerPosition}
          style={{ width: '100%', height: '100%' }}
          level={3}
          onClick={handleMapClick}
        >
          <MapMarker
            position={markerPosition}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
          />
        </Map>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          {t('back')}
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          className="flex-1"
        >
          {t('confirmLocation')}
        </Button>
      </div>
    </div>
  );
}
