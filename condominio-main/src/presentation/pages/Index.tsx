import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ApiProxy } from '@/infrastructure/api/ApiProxy';
import CondominiumLayout from '@/components/CondominiumLayout';
import ReservationCalendar from '@/components/ReservationCalendar';
import ReservationForm from '@/components/ReservationForm';
import ReservationList from '@/components/ReservationList';
import AdminPanel from '@/components/AdminPanel';
import Dashboard from '@/components/Dashboard';
import ResidentsManagement from '@/components/ResidentsManagement';
import DocumentsManagement from '@/components/DocumentsManagement';
import NoticesManagement from '@/components/NoticesManagement';
import SettingsManagement from '@/components/SettingsManagement';
import PrivateRoute from '@/components/PrivateRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';
import { Reservation } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

const IndexContent = () => {
  const { profile, hasMinimumRole } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = hasMinimumRole('admin');

  useEffect(() => {
    fetchReservations();
  }, [profile]);

  const fetchReservations = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      
      // Use ApiProxy instead of direct supabase calls
      const options: any = {
        order: { column: 'created_at', ascending: false }
      };
      
      // Residents can only see their own reservations
      if (!isAdmin) {
        options.filters = { user_id: profile.user_id };
      }
      
      const { data, error } = await ApiProxy.select('reservations', options);

      if (error) {
        console.error('Error fetching reservations:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar reservas.",
        });
        return;
      }

      setReservations((data || []) as Reservation[]);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewReservation = async (newReservation: Omit<Reservation, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'requested_at'>) => {
    if (!profile) return;

    try {
      const reservationData = {
        ...newReservation,
        user_id: profile.user_id,
        apartment_number: profile.apartment_number || newReservation.apartment_number,
        resident_name: profile.display_name || newReservation.resident_name,
      };

      // Use ApiProxy instead of direct supabase calls
      const { data, error } = await ApiProxy.insert('reservations', [reservationData]);

      if (error) {
        console.error('Error creating reservation:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao criar reserva.",
        });
        return;
      }

      if (data && data[0]) {
        setReservations(prev => [data[0] as Reservation, ...prev]);
        toast({
          title: "Reserva criada!",
          description: "Sua reserva foi enviada para aprovação.",
        });
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar reserva.",
      });
    }
  };

  const handleStatusChange = async (id: string, status: Reservation['status'], reason?: string) => {
    try {
      const updateData: any = { status };
      if (reason) {
        updateData.cancellation_reason = reason;
      }

      // Use ApiProxy instead of direct supabase calls
      const { error } = await ApiProxy.update('reservations', updateData, { id });

      if (error) {
        console.error('Error updating reservation:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao atualizar reserva.",
        });
        return;
      }

      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === id 
            ? { ...reservation, status, cancellation_reason: reason }
            : reservation
        )
      );

      toast({
        title: "Reserva atualizada!",
        description: `Reserva ${status === 'confirmed' ? 'aprovada' : status === 'cancelled' ? 'cancelada' : 'atualizada'}.`,
      });
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar reserva.",
      });
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveSection} />;

      case 'reservations':
        if (isAdmin) {
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ReservationCalendar
                  reservations={reservations}
                  onDateSelect={setSelectedDate}
                  selectedDate={selectedDate}
                />
                <ReservationForm
                  selectedDate={selectedDate}
                  onReservationAdd={handleNewReservation}
                  existingReservations={reservations}
                />
              </div>
              <div>
                <AdminPanel
                  reservations={reservations}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          );
        } else {
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ReservationCalendar
                  reservations={reservations}
                  onDateSelect={setSelectedDate}
                  selectedDate={selectedDate}
                />
                <ReservationForm
                  selectedDate={selectedDate}
                  onReservationAdd={handleNewReservation}
                  existingReservations={reservations}
                />
              </div>
              <div>
                <ReservationList 
                  reservations={reservations} 
                  onStatusChange={isAdmin ? handleStatusChange : undefined}
                  isAdmin={isAdmin}
                  showUserReservationsOnly={!isAdmin}
                  loading={loading}
                />
              </div>
            </div>
          );
        }
      
      case 'residents':
        return <ResidentsManagement />;
      
      case 'documents':
        return <DocumentsManagement />;
      
      case 'notices':
        return <NoticesManagement />;
      
      case 'settings':
        return <SettingsManagement />;
      
      default:
        return <Dashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <CondominiumLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </CondominiumLayout>
  );
};

const Index = () => {
  return (
    <PrivateRoute>
      <IndexContent />
    </PrivateRoute>
  );
};

export default Index;