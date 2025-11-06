import { OsPlatform } from '@/types/system';

export const isContentURI = (uri: string) => {
  return uri.startsWith('content://');
};

export const isFileURI = (uri: string) => {
  return uri.startsWith('file://');
};

export const isValidURL = (url: string, allowedSchemes: string[] = ['http', 'https']) => {
  try {
    const { protocol } = new URL(url);
    return allowedSchemes.some((scheme) => `${scheme}:` === protocol);
  } catch {
    return false;
  }
};

// Note that iPad may have a user agent string like a desktop browser
// when possible please use appService.isIOSApp || getOSPlatform() === 'ios'
// to check if the app is running on iOS
export const getOSPlatform = (): OsPlatform => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (userAgent.includes('android')) return 'android';
  if (userAgent.includes('macintosh') || userAgent.includes('mac os x')) return 'macos';
  if (userAgent.includes('windows nt')) return 'windows';
  if (userAgent.includes('linux')) return 'linux';

  return 'unknown';
};
