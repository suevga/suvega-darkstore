import { useState, useEffect, useCallback } from 'react';
import { toast } from './use-toast';
import { useBackend } from './useBackend';
import type { Banner as BannerType } from '../types/banner';

export const useBanner = () => {
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addingBanner, setAddingBanner] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statsCount, setStatsCount] = useState<{ offer: number; product: number; category: number; advertisement: number }>(
    {
      offer: 0,
      product: 0,
      category: 0,
      advertisement: 0,
    }
  );

  // Calculate stats whenever banners change
  useEffect(() => {
    const counts: { offer: number; product: number; category: number; advertisement: number } = {
      offer: 0,
      product: 0,
      category: 0,
      advertisement: 0,
    };

    // Ensure banners is an array before iterating
    const bannersArray: BannerType[] = Array.isArray(banners) ? banners : [];

    bannersArray.forEach((banner) => {
      const key = (banner.category as string) as keyof typeof counts;
      if (counts[key] !== undefined) {
        counts[key]++;
      }
    });

    setStatsCount(counts);
  }, [banners]);

  const api = useBackend();
  // Fetch all banners
  const fetchBanners = useCallback(async (storeId: string | null | undefined) => {
    setLoading(true);
    try {
      console.log('storeId coming from the hook', storeId);

      const response = await api.getStoreBanners(storeId as string);

      console.log('response coming from the api', response.data);

      const responseData = response.data;

      if (responseData && responseData.success === true) {
        // Try common shapes first
        const fromData = Array.isArray(responseData?.data?.banners)
          ? responseData.data.banners
          : Array.isArray(responseData?.data)
          ? responseData.data
          : undefined;

        const fromBanners = Array.isArray(responseData?.banners)
          ? responseData.banners
          : undefined;

        const fromMessageArray = Array.isArray(responseData?.message)
          ? responseData.message
          : undefined;

        let finalBanners: BannerType[] | undefined = fromData || fromBanners || fromMessageArray;

        // If message is a string, only attempt JSON.parse when it looks like valid JSON
        if (!finalBanners && typeof responseData?.message === 'string') {
          const msg = responseData.message.trim();
          
          // More robust JSON validation - check if it's properly formatted JSON
          const looksLikeValidJson = (
            (msg.startsWith('[') && msg.endsWith(']')) ||
            (msg.startsWith('{') && msg.endsWith('}'))
          );
          
          if (looksLikeValidJson) {
            try {
              const parsed = JSON.parse(msg);
              if (Array.isArray(parsed)) {
                finalBanners = parsed as BannerType[];
              } else if (parsed && typeof parsed === 'object') {
                // Handle case where parsed object might contain banners array
                if (Array.isArray(parsed.banners)) {
                  finalBanners = parsed.banners as BannerType[];
                } else if (Array.isArray(parsed.data)) {
                  finalBanners = parsed.data as BannerType[];
                }
              }
            } catch (parseError) {
              console.error('Error parsing banner data from message:', parseError);
              console.error('Raw message that failed to parse:', msg);
              // Don't fail silently - set empty array and log the issue
              finalBanners = [];
            }
          } else {
            // Handle known non-JSON message strings gracefully
            const lowerMsg = msg.toLowerCase();
            if (lowerMsg.includes('no banners') || lowerMsg.includes('no banner found')) {
              finalBanners = [];
            } else if (lowerMsg.includes('fetched successfully') || lowerMsg.includes('banners fetched')) {
              // If cache message, prefer any arrays found in data; otherwise empty
              finalBanners = fromData ?? [];
            } else {
              // Log unexpected message format for debugging
              console.warn('Unexpected message format (not JSON, not recognized pattern):', msg);
              finalBanners = [];
            }
          }
        }

        if (Array.isArray(finalBanners)) {
          setBanners(finalBanners);
        } else {
          console.error('Unexpected response format (no banner array found):', responseData);
          setBanners([]);
        }
      } else {
        console.error('API response indicates failure or unexpected format:', responseData);
        setBanners([]);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]);
      toast({
        title: 'Error',
        description: 'Failed to load banners',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new banner
  const addBanner = async (
    formData: { name: string; category: string; tags: string | string[]; isActive: boolean; storeId: string | null; redirectUrl: string },
    bannerImage: File | null
  ) => {
    setAddingBanner(true);

    try {
      // Create a new FormData object
      const formDataToSend = new FormData();

      // Append all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);

      // Convert tags if it's a string
       if (typeof formData.tags === 'string') {
        // If it's a comma-separated string, convert to array
        const tagsArray = formData.tags.split(',').map(tag => tag.trim());
        formDataToSend.append('tags', JSON.stringify(tagsArray));
      } else {
        formDataToSend.append('tags', formData.tags || '');
      }

      // Convert boolean to string
      formDataToSend.append('isActive', String(formData.isActive));
      formDataToSend.append('storeId', formData.storeId);
      
      // Append redirectUrl - send empty string if not available
      formDataToSend.append('redirectUrl', formData.redirectUrl || '');

      // Append the file with the correct field name expected by the backend
      formDataToSend.append('bannerImage', bannerImage);

      // Log the form data for debugging
      console.log('FormData being sent:', {
        name: formData.name,
        category: formData.category,
        tags: formData.tags,
        isActive: formData.isActive,
        storeId: formData.storeId,
        redirectUrl: formData.redirectUrl,
        bannerImage: bannerImage ? bannerImage.name : 'No image',
      });

      // Make the API call with explicit Content-Type header
      const response = await api.createBanner(formDataToSend);

      if (response.status === 200 || response.status === 201) {
        toast({
          title: 'Success',
          description: 'Banner created successfully',
        });

        // Fetch updated banners - make sure to pass storeId
        await fetchBanners(formData.storeId);
        return true;
      } else {
        throw new Error('Failed to create banner');
      }
    } catch (error) {
      console.error('Error creating banner:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create banner',
        variant: 'destructive',
      });
      return false;
    } finally {
      setAddingBanner(false);
    }
  };

  // Update banner status
  const updateBannerStatus = async (bannerId: string, isActive: boolean, storeId: string | null) => {
    try {
      const response = await api.updateBannerStatus(bannerId, isActive);
      console.log('response coming from the api after updating the status', response.data);
      if (response.status === 200) {
        toast({
          title: 'Success',
          description: 'Banner status updated',
        });
        await fetchBanners(storeId);
        return true;
      }
    } catch (error) {
      console.error('Error updating banner status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update banner status',
        variant: 'destructive',
      });
    }
  };

  // Delete banner
  const deleteBanner = async (bannerId: string, storeId: string | null) => {
    try {
      await api.deleteBanner(bannerId);
      toast({
        title: 'Success',
        description: 'Banner deleted successfully',
      });
      await fetchBanners(storeId);
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete banner',
        variant: 'destructive',
      });
    }
  };

  // Get filtered banners
  const getFilteredBanners = useCallback(() => {
    // Ensure banners is an array before filtering
    if (!Array.isArray(banners)) {
      console.error('banners is not an array:', banners);
      return [];
    }

    return banners.filter(
      banner =>
        banner.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === 'all' || banner.category === categoryFilter)
    );
  }, [banners, searchTerm, categoryFilter]);

  return {
    banners,
    loading,
    addingBanner,
    searchTerm,
    categoryFilter,
    statsCount,
    fetchBanners,
    setSearchTerm,
    setCategoryFilter,
    addBanner,
    updateBannerStatus,
    deleteBanner,
    getFilteredBanners,
  };
};
