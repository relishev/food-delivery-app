'use client';

import { useCallback } from 'react';
import DaumPostcodeEmbed, { Address } from 'react-daum-postcode';
import { PostcodeData } from './types';

interface PostcodeStepProps {
  onComplete: (data: PostcodeData) => void;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        services: {
          Geocoder: new () => {
            addressSearch: (
              address: string,
              callback: (
                result: Array<{ x: string; y: string }>,
                status: string
              ) => void
            ) => void;
          };
          Status: {
            OK: string;
          };
        };
      };
    };
  }
}

const geocodeAddress = (address: string): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps?.services) {
      reject(new Error('Kakao Maps services not loaded'));
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        resolve({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        });
      } else {
        reject(new Error('Geocoding failed'));
      }
    });
  });
};

export default function PostcodeStep({ onComplete }: PostcodeStepProps) {
  const handleComplete = useCallback(async (data: Address) => {
    const fullAddress = data.roadAddress || data.jibunAddress;

    try {
      const coords = await geocodeAddress(fullAddress);

      onComplete({
        roadAddress: data.roadAddress,
        jibunAddress: data.jibunAddress,
        zonecode: data.zonecode,
        buildingName: data.buildingName,
        latitude: coords.lat,
        longitude: coords.lng,
        fullAddress,
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      onComplete({
        roadAddress: data.roadAddress,
        jibunAddress: data.jibunAddress,
        zonecode: data.zonecode,
        buildingName: data.buildingName,
        latitude: 0,
        longitude: 0,
        fullAddress,
      });
    }
  }, [onComplete]);

  return (
    <div className="w-full">
      <DaumPostcodeEmbed
        onComplete={handleComplete}
        style={{ height: 'min(450px, calc(100dvh - 220px))' }}
        autoClose={false}
      />
    </div>
  );
}
