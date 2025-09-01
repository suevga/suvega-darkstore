# Banner Redirect Implementation Guide

## Overview

This implementation provides a production-ready banner redirect system that allows admins to create banners with dynamic redirect URLs. Based on the banner category, admins can select either a product ID or category ID, which enables deep linking in your React Native Expo app.

## Key Features

✅ **Dynamic Redirect URL Selection**: Automatically shows relevant options based on banner category
✅ **Production-Ready Code**: Minimal, efficient implementation with proper error handling
✅ **Type Safety**: Full TypeScript support with proper type definitions
✅ **Empty String Handling**: Sends empty string when no redirect is available
✅ **Frontend Integration**: Utility functions for React Native app integration

## Backend Integration

### Form Data Structure

When creating a banner, the following data is sent to your backend:

```typescript
interface BannerFormData {
  name: string;
  category: 'offer' | 'product' | 'category' | 'advertisement';
  tags: string; // JSON stringified array
  isActive: string; // "true" or "false"
  storeId: string;
  redirectUrl: string; // Product/Category ID or empty string
  bannerImage: File;
}
```

### Backend Expected Behavior

Your backend should:
1. Accept `redirectUrl` as a string field
2. Store empty string `""` when no redirect is configured
3. Return the `redirectUrl` field in banner responses

## Frontend Admin Panel

### Banner Creation Flow

1. **Select Banner Category**: User chooses from offer, product, category, or advertisement
2. **Dynamic Redirect Selection**: 
   - **Product banners**: Shows product selector
   - **Category banners**: Shows category selector  
   - **Offer/Advertisement banners**: Shows type selector (product or category) then relevant options
3. **Validation**: Ensures redirect URL is selected before submission
4. **Submission**: Sends redirectUrl (or empty string) to backend

### Code Structure

```
src/
├── components/
│   └── BannerRedirectSelector.tsx    # Main redirect selector component
├── hooks/
│   ├── useBanner.ts                  # Banner CRUD operations (updated)
│   ├── useProducts.ts                # Product data fetching
│   └── useCategories.ts              # Category data fetching
├── pages/
│   └── Banner.tsx                    # Banner management page (updated)
├── types/
│   └── banner.ts                     # Banner type definitions
└── utility/
    └── bannerRedirect.ts             # Frontend app integration utilities
```

## React Native App Integration

### 1. Install the Utility

Copy the `bannerRedirect.ts` utility to your React Native project:

```typescript
// utils/bannerRedirect.ts
import type { Banner } from '../types/banner';

export const getBannerRedirectInfo = (banner: Banner) => {
  if (!banner.redirectUrl || banner.redirectUrl.trim() === '') {
    return { type: 'none', targetId: '', category: banner.category };
  }

  if (banner.category === 'product') {
    return { type: 'product', targetId: banner.redirectUrl, category: banner.category };
  }

  if (banner.category === 'category') {
    return { type: 'category', targetId: banner.redirectUrl, category: banner.category };
  }

  // For offer/advertisement, determine type based on your backend logic
  return { type: 'product', targetId: banner.redirectUrl, category: banner.category };
};
```

### 2. Implement Banner Navigation

```typescript
// components/BannerCarousel.tsx
import React from 'react';
import { TouchableOpacity, Image, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getBannerRedirectInfo } from '../utils/bannerRedirect';

interface BannerCarouselProps {
  banners: Banner[];
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const navigation = useNavigation();

  const handleBannerPress = (banner: Banner) => {
    const redirectInfo = getBannerRedirectInfo(banner);
    
    switch (redirectInfo.type) {
      case 'product':
        navigation.navigate('ProductDetail', { 
          productId: redirectInfo.targetId 
        });
        break;
        
      case 'category':
        navigation.navigate('CategoryProducts', { 
          categoryId: redirectInfo.targetId 
        });
        break;
        
      case 'none':
        // Handle banners without redirect (maybe show a message or do nothing)
        console.log('Banner has no redirect configured');
        break;
    }
  };

  return (
    <View>
      {banners.map((banner) => (
        <TouchableOpacity
          key={banner._id}
          onPress={() => handleBannerPress(banner)}
          disabled={getBannerRedirectInfo(banner).type === 'none'}
        >
          <Image 
            source={{ uri: banner.image }} 
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### 3. Advanced Navigation with Analytics

```typescript
// hooks/useBannerNavigation.ts
import { useNavigation } from '@react-navigation/native';
import { getBannerRedirectInfo } from '../utils/bannerRedirect';
import { trackEvent } from '../analytics'; // Your analytics service

export const useBannerNavigation = () => {
  const navigation = useNavigation();

  const navigateFromBanner = (banner: Banner) => {
    const redirectInfo = getBannerRedirectInfo(banner);
    
    // Track banner click
    trackEvent('banner_clicked', {
      bannerId: banner._id,
      bannerName: banner.name,
      bannerCategory: banner.category,
      redirectType: redirectInfo.type,
      targetId: redirectInfo.targetId
    });

    switch (redirectInfo.type) {
      case 'product':
        navigation.navigate('ProductDetail', { 
          productId: redirectInfo.targetId,
          source: 'banner'
        });
        break;
        
      case 'category':
        navigation.navigate('CategoryProducts', { 
          categoryId: redirectInfo.targetId,
          source: 'banner'
        });
        break;
        
      case 'none':
        // Track banners without redirect for analytics
        trackEvent('banner_no_redirect', {
          bannerId: banner._id,
          bannerCategory: banner.category
        });
        break;
    }
  };

  return { navigateFromBanner };
};
```

## Testing

### Admin Panel Testing

1. **Create Product Banner**: Select product category → choose a product → verify redirectUrl is set
2. **Create Category Banner**: Select category → choose a category → verify redirectUrl is set  
3. **Create Offer Banner**: Select offer → choose type → select target → verify redirectUrl is set
4. **Empty State**: Try submitting without selection → should show validation error
5. **Backend Submission**: Verify redirectUrl is included in FormData sent to backend

### React Native App Testing

1. **Product Redirect**: Tap product banner → should navigate to ProductDetail screen
2. **Category Redirect**: Tap category banner → should navigate to CategoryProducts screen
3. **No Redirect**: Tap banner with empty redirectUrl → should handle gracefully
4. **Analytics**: Verify banner clicks are tracked with correct metadata

## Error Handling

### Admin Panel
- Loading states while fetching products/categories
- Error messages for failed API calls
- Validation errors for missing selections
- Graceful handling of empty data

### React Native App
- Handle invalid redirectUrl values
- Graceful fallback for unknown redirect types
- Network error handling when fetching banner data
- Analytics error handling

## Performance Considerations

- **Lazy Loading**: Products are loaded with pagination
- **Caching**: Categories and products are cached after first load
- **Minimal Re-renders**: Optimized React hooks prevent unnecessary updates
- **Image Optimization**: Banner images should be optimized for mobile

## Security Considerations

- **Input Validation**: Validate redirectUrl format on backend
- **Access Control**: Ensure users can only access authorized products/categories
- **Deep Link Validation**: Validate deep link targets exist before navigation

## Future Enhancements

- **Search Functionality**: Add search within product/category selectors
- **Bulk Operations**: Support for bulk banner creation/editing
- **A/B Testing**: Support for banner variants and testing
- **Scheduling**: Time-based banner activation/deactivation
- **Geolocation**: Location-based banner targeting

## Troubleshooting

### Common Issues

1. **redirectUrl not being sent**: Check useBanner.ts FormData append
2. **Navigation not working**: Verify navigation stack includes target screens
3. **Empty product/category lists**: Check API endpoints and data format
4. **Type errors**: Ensure Banner type includes redirectUrl field

### Debug Steps

1. Check browser network tab for FormData content
2. Verify backend receives redirectUrl field
3. Test banner redirect utility with sample data
4. Check React Native navigation logs
