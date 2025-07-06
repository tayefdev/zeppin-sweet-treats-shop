
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const WebhookTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testWebhook = async () => {
    setIsLoading(true);
    
    try {
      const testData = {
        order_id: `TEST-${Date.now()}`,
        item_name: 'Test Chocolate Cake',
        quantity: 1,
        total_amount: 850,
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '01234567890',
        customer_address: 'Test Address, Dhaka',
        special_notes: 'This is a test order',
        order_date: new Date().toISOString(),
        currency: 'BDT',
        test: true
      };

      console.log('Testing webhook with data:', testData);

      const response = await fetch('https://hook.eu2.make.com/zslt1cygtanaa2soxp8jpcryokve80ij', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(testData),
      });

      toast({
        title: "Webhook Test Sent",
        description: "Test data has been sent to your Make.com webhook. Check your Make.com scenario for the test execution.",
      });
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test data to webhook.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Make.com Webhook Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Webhook URL</Label>
            <Input 
              value="https://hook.eu2.make.com/zslt1cygtanaa2soxp8jpcryokve80ij"
              readOnly
              className="bg-gray-50"
            />
          </div>
          <Button 
            onClick={testWebhook}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Webhook'}
          </Button>
          <p className="text-sm text-gray-600">
            This webhook will be automatically triggered when customers place orders. 
            Use the test button to verify your Make.com scenario is working correctly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookTester;
