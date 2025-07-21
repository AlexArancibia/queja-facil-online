import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, RotateCcw } from 'lucide-react';
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateRangeFilterAdvancedProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  className?: string;
}

interface DatePreset {
  label: string;
  range: () => { start: Date; end: Date };
  description: string;
}

const DateRangeFilterAdvanced: React.FC<DateRangeFilterAdvancedProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const presets: DatePreset[] = [
    {
      label: "Últimos 7 días",
      range: () => ({ start: subDays(new Date(), 6), end: new Date() }),
      description: "Desde hace una semana"
    },
    {
      label: "Últimos 30 días",
      range: () => ({ start: subDays(new Date(), 29), end: new Date() }),
      description: "Último mes completo"
    },
    {
      label: "Esta semana",
      range: () => ({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) }),
      description: "Lunes a domingo actual"
    },
    {
      label: "Este mes",
      range: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }),
      description: "Mes calendario actual"
    },
    {
      label: "Mes pasado",
      range: () => {
        const lastMonth = subMonths(new Date(), 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      },
      description: "Mes calendario anterior"
    }
  ];

  const handlePresetClick = (preset: DatePreset) => {
    const { start, end } = preset.range();
    onStartDateChange(start);
    onEndDateChange(end);
    setActivePreset(preset.label);
    setIsOpen(false);
  };

  const handleClear = () => {
    onStartDateChange(undefined);
    onEndDateChange(undefined);
    setActivePreset(null);
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return "Seleccionar rango";
    if (startDate && !endDate) return `Desde ${format(startDate, "dd/MM/yy", { locale: es })}`;
    if (!startDate && endDate) return `Hasta ${format(endDate, "dd/MM/yy", { locale: es })}`;
    if (startDate && endDate) {
      return `${format(startDate, "dd/MM/yy", { locale: es })} - ${format(endDate, "dd/MM/yy", { locale: es })}`;
    }
    return "Seleccionar rango";
  };

  const getDaysCount = () => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1; // Include both start and end date
    }
    return 0;
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 min-w-0 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto p-0 border-0 bg-transparent shadow-none hover:bg-transparent text-sm font-normal text-gray-700 hover:text-gray-900 transition-colors min-w-0 flex items-center gap-1"
          >
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">
              {formatDateRange()}
            </span>
            {(startDate || endDate) && (
              <Badge variant="outline" className="text-xs ml-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                {getDaysCount()} días
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Presets sidebar */}
            <div className="w-48 bg-gray-50 p-3 border-r">
              <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Rangos rápidos
              </h4>
              <div className="space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className={`w-full text-left p-2 rounded-md text-xs transition-colors ${
                      activePreset === preset.label
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{preset.label}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{preset.description}</div>
                  </button>
                ))}
              </div>
              
              {(startDate || endDate) && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Limpiar filtro
                  </Button>
                </div>
              )}
            </div>

            {/* Calendar section */}
            <div className="p-3">
              <div className="mb-3">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Selección personalizada</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-gray-600 block mb-1">Fecha inicio</label>
                    <div className="text-gray-900 font-medium">
                      {startDate ? format(startDate, "dd MMM yyyy", { locale: es }) : "No seleccionada"}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-1">Fecha fin</label>
                    <div className="text-gray-900 font-medium">
                      {endDate ? format(endDate, "dd MMM yyyy", { locale: es }) : "No seleccionada"}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Desde</label>
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      onStartDateChange(date);
                      setActivePreset(null);
                    }}
                    className="rounded-lg border shadow-sm"
                    disabled={(date) => date > new Date() || (endDate && date > endDate)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Hasta</label>
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      onEndDateChange(date);
                      setActivePreset(null);
                    }}
                    className="rounded-lg border shadow-sm"
                    disabled={(date) => date > new Date() || (startDate && date < startDate)}
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="mt-3 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-xs text-emerald-800">
                    <strong>Rango seleccionado:</strong> {getDaysCount()} días
                    <br />
                    <span className="text-emerald-600">
                      {format(startDate, "dd 'de' MMMM", { locale: es })} al {format(endDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeFilterAdvanced; 