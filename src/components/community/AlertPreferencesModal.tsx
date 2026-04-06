import React, { useState, useEffect } from 'react';
import { Bell, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface AlertPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOPICS = [
  { id: 'morning_lows', label: 'Morning Lows' },
  { id: 'exercise', label: 'Exercise & Sports' },
  { id: 'insulin_dosing', label: 'Insulin Dosing' },
  { id: 'cgm_sensors', label: 'CGM Sensors' },
  { id: 'pump_issues', label: 'Pump Issues' },
  { id: 'diet_nutrition', label: 'Diet & Nutrition' },
  { id: 'travel', label: 'Travel Tips' },
  { id: 'mental_health', label: 'Mental Health' },
];

const DEVICES = [
  { id: 'dexcom', label: 'Dexcom' },
  { id: 'omnipod', label: 'Omnipod' },
  { id: 'tandem', label: 'Tandem' },
  { id: 'medtronic', label: 'Medtronic' },
  { id: 'libre', label: 'Libre' },
];

export const AlertPreferencesModal: React.FC<AlertPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user?.email) {
      setEmail(user.email);
    }
      getUser();
    }
  }, [isOpen]);

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    );
  };

  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDevices(prev =>
      prev.includes(deviceId)
        ? prev.filter(d => d !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleSubmit = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (selectedTopics.length === 0 && selectedDevices.length === 0) {
      toast.error('Please select at least one topic or device');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Upsert the subscription
      const { error } = await supabase
        .from('email_subscriptions')
        .upsert({
          user_id: user?.id || email, // Use email as fallback ID for anonymous users
          email,
          subscription_type: 'trending_alerts',
          preferences: {
            topics: selectedTopics,
            devices: selectedDevices,
          },
          is_active: true,
        }, {
          onConflict: 'user_id,subscription_type',
          ignoreDuplicates: false,
        });

      if (error) throw error;

      toast.success('Alert preferences saved! You\'ll receive notifications for matching solutions.');
      onClose();
    } catch (error) {
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Get Solution Alerts
          </DialogTitle>
          <DialogDescription>
            Receive email notifications when new trending solutions match your interests.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-3">
            <Label>Topics of Interest</Label>
            <div className="grid grid-cols-2 gap-2">
              {TOPICS.map((topic) => (
                <div key={topic.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`topic-${topic.id}`}
                    checked={selectedTopics.includes(topic.id)}
                    onCheckedChange={() => handleTopicToggle(topic.id)}
                  />
                  <label
                    htmlFor={`topic-${topic.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {topic.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="space-y-3">
            <Label>Devices</Label>
            <div className="grid grid-cols-2 gap-2">
              {DEVICES.map((device) => (
                <div key={device.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`device-${device.id}`}
                    checked={selectedDevices.includes(device.id)}
                    onCheckedChange={() => handleDeviceToggle(device.id)}
                  />
                  <label
                    htmlFor={`device-${device.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {device.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
