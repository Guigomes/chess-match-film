import {useEffect, useState} from 'react';
import {useCameraDevice, useCameraPermission} from 'react-native-vision-camera';
import type {CameraDevice} from 'react-native-vision-camera';

interface UseCameraResult {
  device: CameraDevice | undefined;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useCamera(): UseCameraResult {
  const {hasPermission, requestPermission} = useCameraPermission();
  // Prefer wide-angle back camera for a better board overview
  const device = useCameraDevice('back', {
    physicalDevices: ['wide-angle-camera'],
  });

  return {device, hasPermission, requestPermission};
}
