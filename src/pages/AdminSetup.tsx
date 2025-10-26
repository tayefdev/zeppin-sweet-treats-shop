import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (error) throw error;
      setAdminExists(data && data.length > 0);
    } catch (error) {
      console.error('Error checking admin:', error);
      setAdminExists(null);
    }
  };

  const handleCreateAdmin = async () => {
    setIsLoading(true);

    try {
      // Create the admin user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: 'zeppin@gmail.com',
        password: '123456',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Assign admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'admin'
        });

      if (roleError) throw roleError;

      toast({
        title: "Admin Account Created",
        description: "You can now login with your credentials.",
      });

      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to create admin account.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (adminExists === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Checking setup status...</p>
        </div>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800">Setup Complete</CardTitle>
              <p className="text-gray-600">Admin account already exists</p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/admin')}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-to-r from-pink-400 to-orange-400 p-3 rounded-full w-fit mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Admin Setup</CardTitle>
            <p className="text-gray-600">Create your first admin account</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-pink-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">Admin credentials will be:</p>
              <p className="text-sm font-mono text-gray-800">Email: zeppin@gmail.com</p>
              <p className="text-sm font-mono text-gray-800">Password: 123456</p>
            </div>

            <Button 
              onClick={handleCreateAdmin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold py-2 rounded-full disabled:opacity-50"
            >
              {isLoading ? 'Creating Admin...' : 'Create Admin Account'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSetup;
