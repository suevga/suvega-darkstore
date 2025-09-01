/**
 * Banner Redirect Utility
 * 
 * This utility helps handle banner redirects in your React Native Expo app.
 * It provides functions to determine redirect behavior based on banner data.
 */

import type { Banner } from '../types/banner';

export interface RedirectInfo {
  type: 'product' | 'category' | 'none';
  targetId: string;
  category: string;
}

/**
 * Determines the redirect information from a banner
 * @param banner - The banner object containing redirect information
 * @returns RedirectInfo object with type, targetId, and category
 */
export const getBannerRedirectInfo = (banner: Banner): RedirectInfo => {
  // If no redirectUrl is provided, return none
  if (!banner.redirectUrl || banner.redirectUrl.trim() === '') {
    return {
      type: 'none',
      targetId: '',
      category: banner.category || 'unknown'
    };
  }

  // For product banners, always redirect to product
  if (banner.category === 'product') {
    return {
      type: 'product',
      targetId: banner.redirectUrl,
      category: banner.category
    };
  }

  // For category banners, always redirect to category
  if (banner.category === 'category') {
    return {
      type: 'category',
      targetId: banner.redirectUrl,
      category: banner.category
    };
  }

  // For offer and advertisement banners, we need to determine the type
  // This would typically be determined by your backend response or data structure
  // For now, we'll assume it's based on the ID format or you can extend this logic
  return {
    type: 'product', // Default assumption - you may need to adjust this based on your backend
    targetId: banner.redirectUrl,
    category: banner.category || 'unknown'
  };
};

/**
 * Example usage in React Native navigation:
 * 
 * ```typescript
 * import { getBannerRedirectInfo } from '../utility/bannerRedirect';
 * 
 * const handleBannerPress = (banner: Banner) => {
 *   const redirectInfo = getBannerRedirectInfo(banner);
 *   
 *   switch (redirectInfo.type) {
 *     case 'product':
 *       navigation.navigate('ProductDetail', { productId: redirectInfo.targetId });
 *       break;
 *     case 'category':
 *       navigation.navigate('CategoryProducts', { categoryId: redirectInfo.targetId });
 *       break;
 *     case 'none':
 *       // Handle case where no redirect is configured
 *       console.log('No redirect configured for this banner');
 *       break;
 *   }
 * };
 * ```
 */

/**
 * Validates if a banner has a valid redirect configuration
 * @param banner - The banner object to validate
 * @returns boolean indicating if redirect is valid
 */
export const isValidBannerRedirect = (banner: Banner): boolean => {
  if (!banner.redirectUrl || banner.redirectUrl.trim() === '') {
    return false;
  }

  // Basic validation - you can extend this based on your ID format requirements
  return banner.redirectUrl.length > 0;
};

/**
 * Gets a user-friendly description of where the banner will redirect
 * @param banner - The banner object
 * @returns string description of the redirect destination
 */
export const getBannerRedirectDescription = (banner: Banner): string => {
  const redirectInfo = getBannerRedirectInfo(banner);
  
  switch (redirectInfo.type) {
    case 'product':
      return 'Redirects to product page';
    case 'category':
      return 'Redirects to category page';
    case 'none':
      return 'No redirect configured';
    default:
      return 'Unknown redirect type';
  }
};
