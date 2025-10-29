import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  FileText, 
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState([
    {
      title: 'Reservas Hoje',
      value: '0',
      icon: Calendar,
      color: 'text-primary',
      trend: 'Carregando...'
    },
    {
      title: 'Moradores Ativos',
      value: '0',
      icon: Users,
      color: 'text-green-600',
      trend: 'Carregando...'
    },
    {
      title: 'Avisos Pendentes',
      value: '0',
      icon: Bell,
      color: 'text-orange-600',
      trend: 'Carregando...'
    },
    {
      title: 'Documentos',
      value: '0',
      icon: FileText,
      color: 'text-blue-600',
      trend: 'Carregando...'
    }
  ]);
  
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's reservations
      const { data: todayReservations } = await supabase
        .from('reservations')
        .select('*')
        .eq('date', today);

      // Fetch all profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      // Fetch active notices
      const { data: activeNotices } = await supabase
        .from('notices')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Fetch documents
      const { data: documents } = await supabase
        .from('documents')
        .select('*');

      // Fetch recent reservations
      const { data: recentRes } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      // Update stats
      setStats([
        {
          title: 'Reservas Hoje',
          value: (todayReservations?.length || 0).toString(),
          icon: Calendar,
          color: 'text-primary',
          trend: 'Para hoje'
        },
        {
          title: 'Moradores Ativos',
          value: (profiles?.length || 0).toString(),
          icon: Users,
          color: 'text-green-600',
          trend: 'Total cadastrados'
        },
        {
          title: 'Avisos Ativos',
          value: (activeNotices?.length || 0).toString(),
          icon: Bell,
          color: 'text-orange-600',
          trend: 'Publicados'
        },
        {
          title: 'Documentos',
          value: (documents?.length || 0).toString(),
          icon: FileText,
          color: 'text-blue-600',
          trend: 'Disponíveis'
        }
      ]);

      setRecentReservations(recentRes || []);
      setNotices(activeNotices?.slice(0, 2) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Painel de Controle</h2>
        <p className="text-muted-foreground">Bem-vindo ao sistema de gestão do condomínio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Reservas Recentes</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('reservations')}
            >
              Ver Todas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReservations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhuma reserva recente</p>
              ) : (
                recentReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{reservation.resident_name}</p>
                        <span className="text-sm text-muted-foreground">• {reservation.apartment_number}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(reservation.date).toLocaleDateString('pt-BR')} • {reservation.time_slot}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{reservation.event}</p>
                    </div>
                    <Badge 
                      variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {reservation.status === 'confirmed' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Confirmada</>
                      ) : reservation.status === 'pending' ? (
                        <><Clock className="h-3 w-3 mr-1" /> Pendente</>
                      ) : (
                        <><AlertCircle className="h-3 w-3 mr-1" /> {reservation.status}</>
                      )}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Avisos Recentes</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('notices')}
            >
              Ver Todos
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notices.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum aviso ativo</p>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="p-3 bg-accent/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{notice.title}</h4>
                          {notice.priority === 'high' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notice.content.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notice.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onNavigate('reservations')}
            >
              <Calendar className="h-6 w-6" />
              <span>Nova Reserva</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onNavigate('notices')}
            >
              <Bell className="h-6 w-6" />
              <span>Publicar Aviso</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onNavigate('documents')}
            >
              <FileText className="h-6 w-6" />
              <span>Adicionar Documento</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;