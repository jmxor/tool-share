"use client";

import { useState, useEffect } from "react";
import { NotificationSettings, sendVerificationCode, updateNotificationSettings } from "@/lib/auth/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function NotificationsArea({ isVerified, notificationSettings }: { isVerified: boolean, notificationSettings: NotificationSettings }) {
  const [settings, setSettings] = useState(notificationSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(notificationSettings);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    setSettings(notificationSettings);
    setOriginalSettings(notificationSettings);
  }, [notificationSettings]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    const changed = Object.keys(newSettings).some(
      (k) => newSettings[k as keyof NotificationSettings] !== originalSettings[k as keyof NotificationSettings]
    );
    setHasChanges(changed);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const result = await updateNotificationSettings(settings);
      if (result) {
        setStatusMessage({
          type: 'success',
          message: "Notification settings updated successfully."
        });
        setOriginalSettings(settings);
        setHasChanges(false);
      } else {
        setStatusMessage({
          type: 'error',
          message: "Failed to update notification settings. Please try again."
        });
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
      setStatusMessage({
        type: 'error',
        message: "An error occurred while updating notification settings."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsVerifying(true);
    try {
      const result = await sendVerificationCode();
      if (result) {
        setStatusMessage({
          type: 'success',
          message: "Verification email sent! Please check your inbox."
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: "Failed to send verification email. Please try again later."
        });
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      setStatusMessage({
        type: 'error',
        message: "An error occurred while sending the verification email."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4 text-amber-600 bg-amber-50 rounded-md">
            <p className="mb-3">Please verify your email to enable notification settings</p>
            <Button 
              onClick={handleVerifyEmail} 
              disabled={isVerifying}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isVerifying ? "Sending..." : "Send Verification Email"}
            </Button>
            
            {statusMessage && (
              <div className={`mt-4 p-3 rounded-md flex items-center gap-2 w-full ${
                statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {statusMessage.type === 'success' ? 
                  <CheckCircle className="h-5 w-5" /> : 
                  <AlertCircle className="h-5 w-5" />
                }
                <p>{statusMessage.message}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Email Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {[
              { key: 'transactions', label: 'Transaction Updates', description: 'Get notified about your tool rental transactions' },
              { key: 'borrowRequests', label: 'Borrow Request Updates', description: 'Get notified when someone requests to borrow your tools' },
              { key: 'reviews', label: 'Review Updates', description: 'Get notified when you receive a new review' },
              { key: 'messages', label: 'Message Updates', description: 'Get notified about new messages' },
              { key: 'warningsAndSuspensions', label: 'Warnings & Suspensions', description: 'Get notified about account warnings or suspensions' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <Switch 
                  checked={settings[item.key as keyof NotificationSettings]} 
                  onCheckedChange={(checked) => updateSetting(item.key as keyof NotificationSettings, checked)}
                  className={settings[item.key as keyof NotificationSettings] ? "bg-green-400 data-[state=checked]:bg-green-500" : ""}
                />
              </div>
            ))}
          </div>
          
          {hasChanges && (
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={() => {setSettings(originalSettings); setHasChanges(false);}}>Undo Changes</Button>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
          
          {statusMessage && (
            <div className={`mt-4 p-3 rounded-md flex items-center gap-2 w-full ${
              statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {statusMessage.type === 'success' ? 
                <CheckCircle className="h-5 w-5" /> : 
                <AlertCircle className="h-5 w-5" />
              }
              <p>{statusMessage.message}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}