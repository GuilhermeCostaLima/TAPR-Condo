import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Reservation } from '@/types/supabase';

interface ReservationCalendarProps {
  reservations: Reservation[];
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  reservations,
  onDateSelect,
  selectedDate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());

  const days = [];
  const current = new Date(startOfCalendar);
  
  while (current <= endOfMonth || current.getDay() !== 0) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const getDateReservations = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(r => r.date === dateStr && r.status !== 'cancelled');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Calendário de Reservas
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const dateStr = day.toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            const dayReservations = getDateReservations(day);
            const isPast = day < new Date(new Date().toDateString());

            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "ghost"}
                className={`
                  h-12 p-1 flex flex-col items-center justify-center relative
                  ${!isCurrentMonth ? 'text-muted-foreground opacity-50' : ''}
                  ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                  ${isPast ? 'opacity-60' : ''}
                `}
                onClick={() => onDateSelect(dateStr)}
                disabled={isPast}
              >
                <span className="text-sm">{day.getDate()}</span>
                {dayReservations.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {dayReservations.slice(0, 2).map((reservation, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          reservation.status === 'confirmed' 
                            ? 'bg-green-500' 
                            : reservation.status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      />
                    ))}
                    {dayReservations.length > 2 && (
                      <span className="text-xs">+</span>
                    )}
                  </div>
                )}
              </Button>
            );
          })}
        </div>
        
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Legenda:</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Confirmada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Cancelada</span>
            </div>
          </div>
        </div>

        {selectedDate && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">
              Reservas para {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}:
            </h4>
            {getDateReservations(new Date(selectedDate + 'T00:00:00')).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma reserva para este dia</p>
            ) : (
              <div className="space-y-2">
                {getDateReservations(new Date(selectedDate + 'T00:00:00')).map(reservation => (
                  <div key={reservation.id} className="flex items-center justify-between p-2 bg-background rounded">
                    <div>
                      <span className="text-sm font-medium">{reservation.time_slot}</span>
                      <span className="text-sm text-muted-foreground ml-2">{reservation.event}</span>
                    </div>
                    <Badge 
                      variant={
                        reservation.status === 'confirmed' ? 'default' :
                        reservation.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {reservation.status === 'confirmed' ? 'Confirmada' :
                       reservation.status === 'pending' ? 'Pendente' : 'Cancelada'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReservationCalendar;