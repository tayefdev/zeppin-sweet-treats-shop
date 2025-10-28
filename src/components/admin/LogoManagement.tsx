import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Image } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const LogoManagement = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: logoUrl, isLoading } = useQuery({
    queryKey: ['logo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'logo_url')
        .maybeSingle();

      if (error) throw error;
      return data?.value || '';
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('logo')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logo')
        .getPublicUrl(filePath);

      const { error: upsertError } = await supabase
        .from('site_settings')
        .upsert({
          key: 'logo_url',
          value: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (upsertError) throw upsertError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logo'] });
      toast({
        title: "Logo Updated",
        description: "Logo has been uploaded successfully!",
      });
    },
    onError: (error) => {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!logoUrl) return;

      const fileName = logoUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('logo')
          .remove([fileName]);
      }

      const { error } = await supabase
        .from('site_settings')
        .delete()
        .eq('key', 'logo_url');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logo'] });
      toast({
        title: "Logo Removed",
        description: "Logo has been removed successfully!",
      });
    },
    onError: (error) => {
      console.error('Error deleting logo:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete logo. Please try again.",
        variant: "destructive"
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      uploadImage(imageFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please drop an image file (PNG, JPG, etc.)",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete the logo?')) {
      await deleteMutation.mutateAsync();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {logoUrl ? (
          <Card className="relative">
            <CardContent className="p-4">
              <div className="relative">
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="w-full max-w-md h-auto object-contain rounded-lg mx-auto"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card 
            className={`border-2 border-dashed transition-colors cursor-pointer ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="p-8">
              <div className="text-center">
                {isUploading ? (
                  <div className="space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        Drop your logo here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      <Image className="h-4 w-4 mr-2" />
                      Choose Logo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default LogoManagement;
