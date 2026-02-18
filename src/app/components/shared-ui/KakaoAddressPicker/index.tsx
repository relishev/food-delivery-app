'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import PostcodeStep from './PostcodeStep';
import MapStep from './MapStep';
import DetailStep from './DetailStep';
import { KakaoAddress, KakaoAddressPickerProps, Step, PostcodeData, MapPosition } from './types';

export default function KakaoAddressPicker({
  onAddressSelect,
  onCancel,
  showSaveCheckbox = false
}: KakaoAddressPickerProps) {
  const t = useTranslations('KakaoAddress');
  const [currentStep, setCurrentStep] = useState<Step>('search');
  const [addressData, setAddressData] = useState<Partial<KakaoAddress>>({});

  const handlePostcodeComplete = useCallback((data: PostcodeData) => {
    setAddressData({
      roadAddress: data.roadAddress,
      jibunAddress: data.jibunAddress,
      zonecode: data.zonecode,
      buildingName: data.buildingName,
      latitude: data.latitude,
      longitude: data.longitude,
      fullAddress: data.fullAddress,
    });
    setCurrentStep('map');
  }, []);

  const handleMapConfirm = useCallback((position: MapPosition) => {
    setAddressData((prev) => ({
      ...prev,
      latitude: position.lat,
      longitude: position.lng,
    }));
    setCurrentStep('detail');
  }, []);

  const handleDetailComplete = useCallback((address: KakaoAddress) => {
    onAddressSelect(address);
  }, [onAddressSelect]);

  const handleBackToSearch = useCallback(() => {
    setCurrentStep('search');
  }, []);

  const handleBackToMap = useCallback(() => {
    setCurrentStep('map');
  }, []);

  const getStepTitle = (): string => {
    switch (currentStep) {
      case 'search':
        return t('searchTitle');
      case 'map':
        return t('mapTitle');
      case 'detail':
        return t('detailTitle');
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{getStepTitle()}</h2>
        {onCancel && currentStep === 'search' && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {t('cancel')}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {(['search', 'map', 'detail'] as Step[]).map((step, index) => (
          <div
            key={step}
            className={`flex-1 h-1 rounded-full ${
              index <= ['search', 'map', 'detail'].indexOf(currentStep)
                ? 'bg-primary'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {currentStep === 'search' && (
        <PostcodeStep onComplete={handlePostcodeComplete} />
      )}

      {currentStep === 'map' && addressData.latitude && addressData.longitude && (
        <MapStep
          position={{ lat: addressData.latitude, lng: addressData.longitude }}
          address={addressData.fullAddress || addressData.roadAddress || ''}
          onConfirm={handleMapConfirm}
          onBack={handleBackToSearch}
        />
      )}

      {currentStep === 'detail' && (
        <DetailStep
          addressData={addressData}
          onComplete={handleDetailComplete}
          onBack={handleBackToMap}
          showSaveCheckbox={showSaveCheckbox}
        />
      )}
    </div>
  );
}

export type { KakaoAddress, KakaoAddressPickerProps } from './types';
