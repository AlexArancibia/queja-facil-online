
import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateRangeFilterProps {
  startDate?: Date
  endDate?: Date
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
  className?: string
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className
}: DateRangeFilterProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-siclo-dark font-medium">Fecha Inicial</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal border-siclo-light focus:border-siclo-green bg-white/80",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                captionLayout="dropdown"
                className="rounded-lg border shadow-sm pointer-events-auto"
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-siclo-dark font-medium">Fecha Final</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal border-siclo-light focus:border-siclo-green bg-white/80",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={onEndDateChange}
                captionLayout="dropdown"
                className="rounded-lg border shadow-sm pointer-events-auto"
                disabled={(date) => date > new Date() || (startDate && date < startDate)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const today = new Date();
            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            onStartDateChange(lastWeek);
            onEndDateChange(today);
          }}
          className="border-siclo-green/30 text-siclo-green hover:bg-siclo-green hover:text-white text-xs"
        >
          Última semana
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const today = new Date();
            const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            onStartDateChange(lastMonth);
            onEndDateChange(today);
          }}
          className="border-siclo-green/30 text-siclo-green hover:bg-siclo-green hover:text-white text-xs"
        >
          Último mes
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            onStartDateChange(undefined);
            onEndDateChange(undefined);
          }}
          className="border-red-300 text-red-600 hover:bg-red-500 hover:text-white text-xs"
        >
          Limpiar
        </Button>
      </div>
    </div>
  )
}
