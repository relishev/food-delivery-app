'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Input from '@/app/components/shared-ui/Input';
import Button from '@/app/components/shared-ui/Button';
import { KakaoAddress } from './types';

interface DetailStepProps {
  addressData: Partial<KakaoAddress>;
  onComplete: (address: KakaoAddress) => void;
  onBack: () => void;
  showSaveCheckbox?: boolean;
}

export default function DetailStep({
  addressData,
  onComplete,
  onBack,
  showSaveCheckbox = false
}: DetailStepProps) {
  const t = useTranslations('KakaoAddress');
  const [alias, setAlias] = useState(addressData.alias || '');
  const [addressDetail, setAddressDetail] = useState(addressData.addressDetail || '');
  const [isDefault, setIsDefault] = useState(addressData.isDefault || false);
  const [saveAddress, setSaveAddress] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const fullAddress = addressData.roadAddress
      ? `${addressData.roadAddress}${addressDetail ? ` ${addressDetail}` : ''}`
      : addressData.fullAddress || '';

    const completeAddress: KakaoAddress = {
      alias: alias || undefined,
      isDefault,
      fullAddress,
      roadAddress: addressData.roadAddress || '',
      jibunAddress: addressData.jibunAddress || '',
      zonecode: addressData.zonecode || '',
      latitude: addressData.latitude || 0,
      longitude: addressData.longitude || 0,
      buildingName: addressData.buildingName || '',
      addressDetail,
      district: '',
      houseNumber: '',
      apartment: addressData.buildingName || '',
    };

    onComplete(completeAddress);
  }, [alias, addressDetail, isDefault, addressData, onComplete]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-900">
          {addressData.roadAddress || addressData.fullAddress}
        </p>
        {addressData.jibunAddress && addressData.jibunAddress !== addressData.roadAddress && (
          <p className="mt-1 text-xs text-gray-500">
            {addressData.jibunAddress}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          {t('zonecode')}: {addressData.zonecode}
        </p>
      </div>

      <Input
        label={t('addressDetail')}
        value={addressDetail}
        onChange={(e) => setAddressDetail(e.target.value)}
        placeholder={t('addressDetailPlaceholder')}
      />

      <Input
        label={t('alias')}
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        placeholder={t('aliasPlaceholder')}
      />

      {/* Only show save options for logged-in users (when showSaveCheckbox is true) */}
      {showSaveCheckbox && (
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            {t('setAsDefault')}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            {t('saveForFuture')}
          </label>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          {t('back')}
        </Button>
        <Button type="submit" className="flex-1">
          {t('save')}
        </Button>
      </div>
    </form>
  );
}
