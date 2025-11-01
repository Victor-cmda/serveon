import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromYear?: number;
  toYear?: number;
  showClear?: boolean;
  disabledDate?: (date: Date) => boolean;
}

// Função para converter data para string no formato YYYY-MM-DD sem problemas de fuso horário
function dateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Função para converter string no formato YYYY-MM-DD para Date
function stringToDate(dateString: string): Date {
  if (!dateString || dateString.length !== 10) {
    return new Date();
  }
  
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Validação básica
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return new Date();
  }
  
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return new Date();
  }
  
  return new Date(year, month - 1, day);
}

export function DatePicker({
  date,
  onSelect,
  placeholder = 'Selecione uma data',
  disabled = false,
  className,
  fromYear = 1900,
  toYear = 2030,
  showClear = true,
  disabledDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(date || new Date());

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onSelect?.(selectedDate);
      setOpen(false);
    } else {
      onSelect?.(undefined);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.(undefined);
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setOpen(!open);
      if (!open) {
        setCurrentMonth(date || new Date());
      }
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handlePreviousYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth()));
  };

  const handleNextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth()));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={handleTriggerClick}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'transition-colors duration-200',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !date && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
          <span className="flex-1 text-left truncate">
            {date ? (
              format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
            ) : (
              placeholder
            )}
          </span>
          {date && showClear && !disabled && (
            <X 
              className="ml-2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0" 
              onClick={handleClear}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 shadow-lg border-0 bg-background" 
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
          {/* Controles customizados de navegação */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePreviousYear}
                className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md transition-opacity"
              >
                <span className="text-sm">«</span>
              </button>
              <button
                type="button"
                onClick={handlePreviousMonth}
                className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md transition-opacity"
              >
                <span className="text-sm">‹</span>
              </button>
            </div>
            
            <div className="text-sm font-medium capitalize">
              {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNextMonth}
                className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md transition-opacity"
              >
                <span className="text-sm">›</span>
              </button>
              <button
                type="button"
                onClick={handleNextYear}
                className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md transition-opacity"
              >
                <span className="text-sm">»</span>
              </button>
            </div>
          </div>

          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            disabled={disabledDate ? disabledDate : disabled}
            locale={ptBR}
            fixedWeeks
            showOutsideDays={false}
            fromYear={fromYear}
            toYear={toYear}
            className="p-3"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "hidden",
              nav: "hidden",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              ),
              day: cn(
                "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                "rounded-md transition-colors duration-200"
              ),
              day_range_end: "day-range-end",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground font-semibold",
              day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
              dropdowns: "flex items-center gap-2 mb-4",
              dropdown_root: "relative",
              dropdown: "absolute bg-popover border rounded-md shadow-md z-50 min-w-[120px]"
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { dateToString, stringToDate };

// Variante compacta para espaços menores
export function DatePickerCompact({
  date,
  onSelect,
  placeholder = 'Data',
  disabled = false,
  className,
  fromYear = 1900,
  toYear = 2030,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onSelect?.(selectedDate);
      setOpen(false);
    } else {
      onSelect?.(undefined);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 px-2 justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-1 h-3 w-3" />
          {date ? (
            <span className="text-xs">
              {format(date, 'dd/MM/yy', { locale: ptBR })}
            </span>
          ) : (
            <span className="text-xs">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={disabled}
          initialFocus
          locale={ptBR}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}

export function CustomDatePicker({
  date,
  onSelect,
  placeholder = 'Selecione uma data',
  disabled = false,
  className,
  fromYear = 1900,
  toYear = 2030,
  showClear = true,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onSelect?.(selectedDate);
      setOpen(false);
    } else {
      onSelect?.(undefined);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(undefined);
  };

  const formatDisplayDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn(
          "flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
          "hover:border-ring focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}>
          <div className="flex items-center gap-2 flex-1">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className={cn(
              "text-left",
              !date && "text-muted-foreground"
            )}>
              {date ? formatDisplayDate(date) : placeholder}
            </span>
          </div>
          {date && showClear && !disabled && (
            <X 
              className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" 
              onClick={handleClear}
            />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 shadow-xl border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80" 
        align="start"
        sideOffset={8}
      >
        <div className="rounded-lg border bg-card/95 backdrop-blur text-card-foreground shadow-xl">
          <div className="p-4 border-b bg-muted/50">
            <h4 className="font-medium text-sm text-center">Selecionar Data</h4>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={disabled}
            initialFocus
            locale={ptBR}
            fixedWeeks
            showOutsideDays={false}
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            formatters={{
              formatMonthDropdown: (date) =>
                date.toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + 
                date.toLocaleString('pt-BR', { month: 'long' }).slice(1),
            }}
            className="p-4"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
