export interface KakaoAddress {
  alias?: string;
  isDefault?: boolean;
  fullAddress: string;
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  latitude: number;
  longitude: number;
  buildingName: string;
  addressDetail: string;
  district: string;
  houseNumber: string;
  apartment: string;
}

export interface KakaoAddressPickerProps {
  onAddressSelect: (address: KakaoAddress) => void;
  onCancel?: () => void;
  showSaveCheckbox?: boolean;
}

export type Step = 'search' | 'map' | 'detail';

export interface PostcodeData {
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  buildingName: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
}

export interface MapPosition {
  lat: number;
  lng: number;
}
