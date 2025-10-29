import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Calendar, BarChart3, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Reservation } from '@/types/supabase';
import CancelReservationDialog from './CancelReservationDialog';

interface AdminPanelProps {
  reservations: Reservation[];
  onStatusChange: (id: string, status: Reservation['status'], reason?: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  reservations,
  onStatusChange
}) => {
  const [cancelDialog, setCancelDialog] = useState<{
    isOpen: boolean;
    reservation: Reservation | null;
  }>({ isOpen: false, reservation: null });

  const handleCancelClick = (reservation: Reservation) => {
    setCancelDialog({ isOpen: true, reservation });
  };

  const handleCancelConfirm = (reason: string) => {
    if (cancelDialog.reservation) {
      onStatusChange(cancelDialog.reservation.id, 'cancelled', reason);
    }
  };
  const getStats = () => {
    const total = reservations.length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const cancelled = reservations.filter(r => r.status === 'cancelled').length;
    
    // Próximas reservas (próximos 30 dias)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcoming = reservations.filter(r => {
      const reservationDate = new Date(r.date + 'T00:00:00');
      return reservationDate >= new Date() && reservationDate <= thirtyDaysFromNow && r.status === 'confirmed';
    }).length;

    return { total, pending, confirmed, cancelled, upcoming };
  };

  const stats = getStats();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const upcomingReservations = reservations
    .filter(r => {
      const reservationDate = new Date(r.date + 'T00:00:00');
      const today = new Date();
      return reservationDate >= today && r.status === 'confirmed';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Reservas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximas</p>
                <p className="text-2xl font-bold text-primary">{stats.upcoming}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Próximas ({stats.upcoming})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Reservas Pendentes de Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingReservations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Não há reservas pendentes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReservations.map((reservation) => (
                    <Card key={reservation.id} className="p-4 border-l-4 border-l-warning">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-warning border-warning">
                              Aguardando Aprovação
                            </Badge>
                             <span className="text-sm text-muted-foreground">
                               {formatDate(reservation.date)} • {reservation.time_slot}
                             </span>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                             <div><strong>Morador:</strong> {reservation.resident_name}</div>
                             <div><strong>Apartamento:</strong> {reservation.apartment_number}</div>
                            <div><strong>Evento:</strong> {reservation.event}</div>
                            <div><strong>Contato:</strong> {reservation.contact}</div>
                          </div>
                          
                          <div className="mt-2 text-xs text-muted-foreground">
                            Solicitado em: {new Date(reservation.requested_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => onStatusChange(reservation.id, 'confirmed')}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelClick(reservation)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Recusar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Próximas Reservas Confirmadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReservations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Não há reservas confirmadas para os próximos dias</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingReservations.map((reservation) => (
                    <Card key={reservation.id} className="p-4 border-l-4 border-l-success">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-success text-success-foreground">
                              Confirmada
                            </Badge>
                             <span className="text-sm text-muted-foreground">
                               {formatDate(reservation.date)} • {reservation.time_slot}
                             </span>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                             <div><strong>Morador:</strong> {reservation.resident_name}</div>
                             <div><strong>Apartamento:</strong> {reservation.apartment_number}</div>
                            <div><strong>Evento:</strong> {reservation.event}</div>
                            <div><strong>Contato:</strong> {reservation.contact}</div>
                          </div>
                          
                          <div className="mt-2 text-xs text-muted-foreground">
                            Solicitado em: {new Date(reservation.requested_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelClick(reservation)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CancelReservationDialog
        isOpen={cancelDialog.isOpen}
        onClose={() => setCancelDialog({ isOpen: false, reservation: null })}
        onConfirm={handleCancelConfirm}
         reservationDetails={cancelDialog.reservation ? {
           residentName: cancelDialog.reservation.resident_name,
           date: cancelDialog.reservation.date,
           timeSlot: cancelDialog.reservation.time_slot,
           event: cancelDialog.reservation.event
         } : {
          residentName: '',
          date: '',
          timeSlot: '',
          event: ''
        }}
      />
    </div>
  );
};

export default AdminPanel;