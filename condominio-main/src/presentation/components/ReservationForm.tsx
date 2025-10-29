import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarPlus, User, Building, Clock, Phone, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Reservation } from '@/types/supabase';

interface ReservationFormProps {
  selectedDate: string | null;
  onReservationAdd: (reservation: Omit<Reservation, 'id'>) => void;
  existingReservations: Reservation[];
}

const timeSlots = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
  '20:00 - 22:00',
  '22:00 - 00:00',
  'Dia Inteiro (08:00 - 00:00)'
];

const ReservationForm: React.FC<ReservationFormProps> = ({
  selectedDate,
  onReservationAdd,
  existingReservations
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    residentName: '',
    apartment: '',
    timeSlot: '',
    event: '',
    contact: '',
    observations: ''
  });

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return timeSlots;
    
    const dateReservations = existingReservations.filter(
      r => r.date === selectedDate && r.status !== 'cancelled'
    );
    
    return timeSlots.filter(slot => 
      !dateReservations.some(r => r.time_slot === slot)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast({
        title: "Erro",
        description: "Selecione uma data no calendário primeiro.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.residentName || !formData.apartment || !formData.timeSlot || !formData.event || !formData.contact) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const newReservation: Omit<Reservation, 'id'> = {
      user_id: '', // This will be set by the parent component
      date: selectedDate,
      time_slot: formData.timeSlot,
      resident_name: formData.residentName,
      apartment_number: formData.apartment,
      event: formData.event,
      contact: formData.contact,
      observations: formData.observations,
      status: 'pending',
      cancellation_reason: null,
      requested_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onReservationAdd(newReservation);
    
    setFormData({
      residentName: '',
      apartment: '',
      timeSlot: '',
      event: '',
      contact: '',
      observations: ''
    });

    toast({
      title: "Reserva Solicitada",
      description: "Sua reserva foi enviada e está aguardando aprovação.",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const availableSlots = getAvailableTimeSlots();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="h-5 w-5 text-primary" />
          Nova Reserva
        </CardTitle>
        {selectedDate && (
          <p className="text-sm text-muted-foreground">
            Data selecionada: {formatDate(selectedDate)}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {!selectedDate ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione uma data no calendário para fazer uma reserva</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="residentName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome do Morador *
                </Label>
                <Input
                  id="residentName"
                  value={formData.residentName}
                  onChange={(e) => setFormData({...formData, residentName: e.target.value})}
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartment" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Apartamento *
                </Label>
                <Input
                  id="apartment"
                  value={formData.apartment}
                  onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                  placeholder="Ex: 101, 205A, etc."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeSlot" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário *
              </Label>
              <Select
                value={formData.timeSlot}
                onValueChange={(value) => setFormData({...formData, timeSlot: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.length === 0 ? (
                    <SelectItem value="" disabled>
                      Nenhum horário disponível
                    </SelectItem>
                  ) : (
                    availableSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {availableSlots.length === 0 && (
                <p className="text-sm text-destructive">
                  Todos os horários estão ocupados para esta data.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="event" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tipo de Evento *
              </Label>
              <Input
                id="event"
                value={formData.event}
                onChange={(e) => setFormData({...formData, event: e.target.value})}
                placeholder="Ex: Aniversário, Reunião, Confraternização"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone de Contato *
              </Label>
              <Input
                id="contact"
                type="tel"
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">
                Observações Adicionais
              </Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData({...formData, observations: e.target.value})}
                placeholder="Informações adicionais sobre o evento..."
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={availableSlots.length === 0}
            >
              Solicitar Reserva
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ReservationForm;