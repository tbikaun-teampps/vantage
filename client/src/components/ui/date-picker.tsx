import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  setDate?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disablePastDates?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  setDate,
  placeholder = "Pick a date",
  className,
  disabled = false,
  disablePastDates = false,
}: DatePickerProps) {
  // Normalize the date for Calendar selection (strip time component)
  // This ensures the Calendar component can properly match and display the selected date
  const normalizedDate = date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : undefined;

  // Calculate today at midnight for accurate date comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Set time to 23:59:59 (end of day)
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      // Support both prop names for backwards compatibility
      onDateChange?.(endOfDay);
      setDate?.(endOfDay);
    } else {
      onDateChange?.(undefined);
      setDate?.(undefined);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          disabled={disabled}
          className={cn(
            "data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal",
            className
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={normalizedDate}
          onSelect={handleSelect}
          disabled={disablePastDates ? { before: today } : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}