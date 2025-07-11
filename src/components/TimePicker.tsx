
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimePickerProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const TimePicker = ({ value, onValueChange, placeholder = "Selecciona una hora" }: TimePickerProps) => {
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const displayTime = hour <= 12 ? 
        `${hour}:00 AM` : 
        `${hour - 12}:00 PM`;
      
      // Special case for 12 PM
      const finalDisplay = hour === 12 ? '12:00 PM' : displayTime;
      
      slots.push({
        value: timeString,
        display: finalDisplay
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="border-siclo-light/50 focus:border-siclo-green">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {timeSlots.map((slot) => (
          <SelectItem key={slot.value} value={slot.value}>
            {slot.display}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TimePicker;
