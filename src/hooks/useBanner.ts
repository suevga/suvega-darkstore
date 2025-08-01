import { useState, useEffect, useCallback } from 'react';
import { toast } from './use-toast';
import axiosInstance from '../api/axiosInstance';

export const useBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingBanner, setAddingBanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statsCount, setStatsCount] = useState({
    offer: 0,
    product: 0,
    category: 0,
    advertisement: 0,
  });

  // Calculate stats whenever banners change
  useEffect(() => {
    const counts = {
      offer: 0,
      product: 0,
      category: 0,
      advertisement: 0,
    };

    // Ensure banners is an array before iterating
    const bannersArray = Array.isArray(banners) ? banners : [];

    bannersArray.forEach(banner => {
      if (counts[banner.category] !== undefined) {
        counts[banner.category]++;
      }
    });

    setStatsCount(counts);
  }, [banners]);

  // Fetch all banners
  const fetchBanners = useCallback(async storeId => {
    setLoading(true);
    try {
      console.log('storeId coming from the hook', storeId);

      const response = await axiosInstance.get(`api/v1/banner/get-stores-banners/${storeId}`);

      console.log('response coming from the api', response.data);

      // In this specific API, banner data is in the message field as a JSON string
      const responseData = response.data;

      if (responseData && responseData.success === true) {
        // Check if message contains JSON data (banner array)
        if (responseData.message && typeof responseData.message === 'string') {
          try {
            // Try to parse the message as JSON
            const parsedBanners = JSON.parse(responseData.message);
            console.log('Parsed banners from message:', parsedBanners);

            if (Array.isArray(parsedBanners)) {
              setBanners(parsedBanners);
            } else {
              console.error('Parsed message is not an array:', parsedBanners);
              setBanners([]);
            }
          } catch (parseError) {
            console.error('Error parsing banner data from message:', parseError);
            setBanners([]);
          }
        } else if (Array.isArray(responseData.message)) {
          // If message is already an array, use it directly
          setBanners(responseData.message);
        } else if (
          responseData.data === 'No banners found' ||
          responseData.data === 'Banners fetched successfully from cache'
        ) {
          // Handle the case when no banners are found
          console.log('No banners found');
          setBanners([]);
        } else {
          console.error('Unexpected response format:', responseData);
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
  const addBanner = async (formData, bannerImage) => {
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

      // Append the file with the correct field name expected by the backend
      formDataToSend.append('bannerImage', bannerImage);

      // Log the form data for debugging
      console.log('FormData being sent:', {
        name: formData.name,
        category: formData.category,
        tags: formData.tags,
        isActive: formData.isActive,
        storeId: formData.storeId,
        bannerImage: bannerImage ? bannerImage.name : 'No image',
      });

      // Make the API call with explicit Content-Type header
      const response = await axiosInstance.post('/api/v1/banner/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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
  const updateBannerStatus = async (bannerId, isActive, storeId) => {
    try {
      const response = await axiosInstance.put(`/api/v1/banner/update-status/${bannerId}`, {
        isActive,
      });
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
  const deleteBanner = async (bannerId, storeId) => {
    try {
      await axiosInstance.delete(`api/v1/banner/delete-banner/${bannerId}`);
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
