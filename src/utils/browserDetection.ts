
/**
 * Utility functions for browser and device detection
 */

export const detectAppleDevice = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isMacOS = /mac/i.test(userAgent) || navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const isIOS = /ipad|iphone|ipod/i.test(userAgent);
  
  console.log('Browser detection:', { 
    isSafari, 
    isMacOS, 
    isIOS, 
    userAgent,
    platform: navigator.platform
  });
  
  return isSafari || isMacOS || isIOS;
};
