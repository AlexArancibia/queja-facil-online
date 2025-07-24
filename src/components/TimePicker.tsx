
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimePickerProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  interval?: 15 | 30; // Intervalo en minutos
}

const TimePicker = ({ 
  value, 
  onValueChange, 
  placeholder = "Selecciona una hora",
  interval = 15 
}: TimePickerProps) => {
  const generateTimeSlots = () => {
    const slots = [];
    
    // Generar slots desde las 6:00 AM hasta las 10:00 PM
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Formatear para mostrar
        let displayHour = hour;
        let ampm = 'AM';
        
        if (hour > 12) {
          displayHour = hour - 12;
          ampm = 'PM';
        } else if (hour === 12) {
          ampm = 'PM';
        } else if (hour === 0) {
          displayHour = 12;
        }
        
        const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
        
        slots.push({
          value: timeString,
          display: displayTime
        });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="border-border focus:border-siclo-green">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60">
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
