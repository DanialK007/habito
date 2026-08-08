'use client';

import { useState } from 'react';
import { HabitFormData } from '@/types/habit';
import { createHabit } from '@/lib/firebase/habits';
import { Habit } from '@/types/habit';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitAdded: (habit: Habit) => void;
  userId: string;
}

export default function AddHabitDialog({ open, onOpenChange, onHabitAdded, userId }: AddHabitDialogProps) {
  const [formData, setFormData] = useState<HabitFormData>({
    title: '',
    description: '',
    frequency: 'daily',
    customDays: [],
    startDate: new Date(),
    color: 'blue',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newHabit = await createHabit(userId, formData);
      onHabitAdded(newHabit);
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        frequency: 'daily',
        customDays: [],
        startDate: new Date(),
        color: 'blue',
      });
    } catch (error) {
      console.error('Error creating habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      customDays: prev.customDays?.includes(day)
        ? prev.customDays.filter(d => d !== day)
        : [...(prev.customDays || []), day],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
          <DialogDescription>
            Add a new habit to track your progress
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Habit Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Morning Exercise"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add some details about your habit"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.frequency === 'custom' && (
              <div className="grid gap-2">
                <Label>Select Days</Label>
                <div className="flex gap-1 sm:gap-2 flex-wrap">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={formData.customDays?.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                required
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.title} className="w-full sm:w-auto">
              {isSubmitting ? 'Creating...' : 'Create Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
