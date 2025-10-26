import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Trash2 } from 'lucide-react';

interface BannerSetting {
  id: string;
  banner_type: 'image' | 'video';
  banner_url: string;
  is_active: boolean;
  created_at: string;
}

export const BannerManagement = () => {
  const [bannerType, setBannerType] = useState<'image' | 'video'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeBanner, isLoading } = useQuery({
    queryKey: ['active-banner'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banner_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data as BannerSetting | null;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');

      setUploading(true);

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      // Deactivate old banner
      if (activeBanner) {
        await supabase
          .from('banner_settings')
          .update({ is_active: false })
          .eq('id', activeBanner.id);
      }

      // Insert new banner
      const { error: insertError } = await supabase
        .from('banner_settings')
        .insert({
          banner_type: bannerType,
          banner_url: publicUrl,
          is_active: true,
        });

      if (insertError) throw insertError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-banner'] });
      toast({
        title: 'Success',
        description: 'Banner uploaded successfully!',
      });
      setFile(null);
      setUploading(false);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload banner. Please try again.',
        variant: 'destructive',
      });
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!activeBanner) return;

      // Delete from storage
      const fileName = activeBanner.banner_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('banners').remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase
        .from('banner_settings')
        .delete()
        .eq('id', activeBanner.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-banner'] });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    uploadMutation.mutate();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete the current banner?')) {
      deleteMutation.mutate();
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
          {/* Current Banner Preview */}
          {activeBanner && (
            <div className="space-y-4">
              <Label>Current Banner</Label>
              <div className="relative border rounded-lg overflow-hidden">
                {activeBanner.banner_type === 'video' ? (
                  <video
                    src={activeBanner.banner_url}
                    className="w-full h-48 object-cover"
                    controls
                    muted
                  />
                ) : (
                  <img
                    src={activeBanner.banner_url}
                    alt="Current banner"
                    className="w-full h-48 object-cover"
                  />
                )}
              </div>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Banner
                  </>
                )}
              </Button>
            </div>
          )}

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
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Banner
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
