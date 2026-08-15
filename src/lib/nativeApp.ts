import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/** Configuration native Capacitor (iOS / Android) */
export async function initNativeApp(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0B213F' });
    await SplashScreen.hide();
  } catch {
    /* plugins optionnels */
  }
}

export function useNativeAppInit(): void {
  useEffect(() => {
    void initNativeApp();
  }, []);
}
