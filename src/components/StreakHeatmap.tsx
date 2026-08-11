'use client';

import { Habit } from '@/types/habit';

interface StreakHeatmapProps {
  habit: Habit;
  days?: number; // Number of days to show (default: 90 days)
}

export default function StreakHeatmap({ habit, days = 90 }: StreakHeatmapProps) {
  const getIntensity = (completed: boolean) => {
    if (!completed) return 'bg-neutral-200 hover:border hover:border-neutral-500';
    return 'bg-orange-500 hover:border hover:border-neutral-500';
  };

  // Generate full 90-day grid going backwards from today
  const today = new Date();
  
  // Create a set of completed date strings for quick lookup
  const completedDatesSet = new Set(
    habit.completedDates.map(date => new Date(date).toDateString())
  );

  // Generate all days going backwards from today
  const allDays: Array<{ date: Date; completed: boolean }> = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const isCompleted = completedDatesSet.has(date.toDateString());
    allDays.push({ date, completed: isCompleted });
  }

  // Reverse so recent days are at the end
  allDays.reverse();

  // Find the first Sunday in our data to start the grid properly
  const firstDate = allDays[0].date;
  const firstDayOfWeek = firstDate.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate how many days to add to reach the previous Sunday
  const daysToSunday = firstDayOfWeek;
  
  // Create the full grid starting from Sunday
  const fullGrid: Array<{ date: Date; completed: boolean } | null> = [];
  
  // Add empty cells for days before our data starts (to align to Sunday)
  for (let i = 0; i < daysToSunday; i++) {
    fullGrid.push(null);
  }
  
  // Add our actual data
  fullGrid.push(...allDays);
  
  // Group by weeks (7 days each, Sunday-Saturday)
  const weeks: Array<Array<{ date: Date; completed: boolean } | null>> = [];
  const numWeeks = Math.ceil(fullGrid.length / 7);
  
  for (let weekIndex = 0; weekIndex < numWeeks; weekIndex++) {
    const week: Array<{ date: Date; completed: boolean } | null> = [];
    
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dataIndex = weekIndex * 7 + dayIndex;
      if (dataIndex < fullGrid.length) {
        week.push(fullGrid[dataIndex]);
      } else {
        week.push(null);
      }
    }
    
    weeks.push(week);
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {/* Weeks */}
        <div className="flex gap-1 p-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return <div key={dayIndex} className="w-3 h-3 rounded-sm bg-neutral-100" />;
                }

                const isCompleted = day.completed;
                const isToday = day.date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={dayIndex}
                    className={`
                      w-3 h-3 rounded-sm ${getIntensity(isCompleted)}
                      ${isToday ? 'ring-1 ring-neutral-600' : ''}
                    `}
                    title={`${day.date.toLocaleDateString()}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-neutral-200" />
        <div className="w-3 h-3 rounded-sm bg-orange-500" />
        <span>More</span>
      </div>
    </div>
  );
}
