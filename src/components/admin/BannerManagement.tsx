import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Trash2, GripVertical, MoveUp, MoveDown } from 'lucide-react';
import { uploadToCloudinary, extractPublicId } from '@/lib/cloudinary';

interface BannerSetting {
  id: string;
  banner_type: 'image' | 'video';
  banner_url: string;
  display_order: number;
  created_at: string;
}

export const BannerManagement = () => {
  const [bannerType, setBannerType] = useState<'image' | 'video'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banner_settings')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as BannerSetting[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');

      setUploading(true);
      setUploadProgress(0);

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, {
        onProgress: (progress) => setUploadProgress(progress),
        folder: 'banners'
      });

      // Get the highest display order
      const maxOrder = banners.length > 0 
        ? Math.max(...banners.map(b => b.display_order)) 
        : -1;

      // Insert new banner
      const { error: insertError } = await supabase
        .from('banner_settings')
        .insert({
          banner_type: bannerType,
          banner_url: result.secure_url,
          display_order: maxOrder + 1,
        });

      if (insertError) throw insertError;

      return result.secure_url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: 'Success',
        description: 'Banner uploaded successfully!',
      });
      setFile(null);
      setUploading(false);
      setUploadProgress(0);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload banner. Please try again.',
        variant: 'destructive',
      });
      setUploading(false);
      setUploadProgress(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (banner: BannerSetting) => {
      // Delete from Cloudinary
      if (banner.banner_url.includes('cloudinary.com')) {
        const publicId = extractPublicId(banner.banner_url);
        if (publicId) {
          try {
            await supabase.functions.invoke('delete-cloudinary-asset', {
              body: { publicId }
            });
          } catch (error) {
            console.error('Error deleting from Cloudinary:', error);
          }
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('banner_settings')
        .delete()
        .eq('id', banner.id);

      if (error) throw error;

      // Reorder remaining banners
      const remainingBanners = banners
        .filter(b => b.id !== banner.id)
        .sort((a, b) => a.display_order - b.display_order);

      for (let i = 0; i < remainingBanners.length; i++) {
        await supabase
          .from('banner_settings')
          .update({ display_order: i })
          .eq('id', remainingBanners[i].id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: 'Success',
        description: 'Banner deleted successfully!',
      });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete banner.',
        variant: 'destructive',
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ bannerId, newOrder }: { bannerId: string; newOrder: number }) => {
      const banner = banners.find(b => b.id === bannerId);
      if (!banner) return;

      const oldOrder = banner.display_order;

      // Update the moved banner
      await supabase
        .from('banner_settings')
        .update({ display_order: newOrder })
        .eq('id', bannerId);

      // Shift other banners
      if (newOrder < oldOrder) {
        // Moving up: shift banners down
        for (const b of banners) {
          if (b.id !== bannerId && b.display_order >= newOrder && b.display_order < oldOrder) {
            await supabase
              .from('banner_settings')
              .update({ display_order: b.display_order + 1 })
              .eq('id', b.id);
          }
        }
      } else {
        // Moving down: shift banners up
        for (const b of banners) {
          if (b.id !== bannerId && b.display_order > oldOrder && b.display_order <= newOrder) {
            await supabase
              .from('banner_settings')
              .update({ display_order: b.display_order - 1 })
              .eq('id', b.id);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: 'Success',
        description: 'Banner order updated!',
      });
    },
    onError: (error) => {
      console.error('Reorder error:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder banner.',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    uploadMutation.mutate();
  };

  const handleDelete = (banner: BannerSetting) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      deleteMutation.mutate(banner);
    }
  };

  const handleMoveUp = (banner: BannerSetting) => {
    if (banner.display_order > 0) {
      reorderMutation.mutate({
        bannerId: banner.id,
        newOrder: banner.display_order - 1,
      });
    }
  };

  const handleMoveDown = (banner: BannerSetting) => {
    if (banner.display_order < banners.length - 1) {
      reorderMutation.mutate({
        bannerId: banner.id,
        newOrder: banner.display_order + 1,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Banner Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload New Banner */}
          <div className="space-y-4">
            <Label>Upload New Banner</Label>
            
            <RadioGroup value={bannerType} onValueChange={(value: 'image' | 'video') => setBannerType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="image" />
                <Label htmlFor="image">Image</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video">Video</Label>
              </div>
            </RadioGroup>

            <input
              type="file"
              accept={bannerType === 'video' ? 'video/*' : 'image/*'}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
            />

            {file && (
              <p className="text-sm text-gray-600">
                Selected: {file.name}
              </p>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Banner
                </>
              )}
            </Button>
          </div>

          {/* Current Banners */}
          {banners.length > 0 && (
            <div className="space-y-4">
              <Label>Current Banners ({banners.length})</Label>
              <div className="space-y-3">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                  >
                    {/* Preview */}
                    <div className="relative w-32 h-20 flex-shrink-0 border rounded overflow-hidden bg-white">
                      {banner.banner_type === 'video' ? (
                        <video
                          src={banner.banner_url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={banner.banner_url}
                          alt={`Banner ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {banner.banner_type === 'video' ? 'Video' : 'Image'} Banner #{index + 1}
                      </p>
                      <p className="text-xs text-gray-500">
                        Order: {banner.display_order}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveUp(banner)}
                        disabled={banner.display_order === 0 || reorderMutation.isPending}
                        className="h-8 w-8"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveDown(banner)}
                        disabled={banner.display_order === banners.length - 1 || reorderMutation.isPending}
                        className="h-8 w-8"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(banner)}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {banners.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No banners uploaded yet. Upload your first banner above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};