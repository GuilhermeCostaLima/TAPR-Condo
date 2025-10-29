import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Building, Bell, Clock, Users, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SettingsManagement: React.FC = () => {
  const { toast } = useToast();
  
  const [condominiumSettings, setCondominiumSettings] = useState({
    name: 'Residencial Costa Esmeralda',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    zipCode: '01234-567',
    totalApartments: '120',
    adminPhone: '(11) 99999-9999',
    adminEmail: 'admin@residencial.com'
  });

  const [reservationSettings, setReservationSettings] = useState({
    maxDaysAdvance: '30',
    maxReservationsPerUser: '2',
    allowWeekendReservations: true,
    requireApproval: true,
    cancellationHours: '24',
    timeSlots: [
      '08:00 - 10:00',
      '10:00 - 12:00',
      '14:00 - 16:00',
      '16:00 - 18:00',
      '19:00 - 21:00'
    ]
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    reminderHours: '2',
    adminNotifications: true,
    statusChangeNotifications: true
  });

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Configurações Salvas",
      description: `As configurações de ${section} foram atualizadas com sucesso.`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="condominium" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="condominium" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Condomínio
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reservas
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="condominium">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Informações do Condomínio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condName">Nome do Condomínio</Label>
                  <Input
                    id="condName"
                    value={condominiumSettings.name}
                    onChange={(e) => setCondominiumSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="totalApts">Total de Apartamentos</Label>
                  <Input
                    id="totalApts"
                    type="number"
                    value={condominiumSettings.totalApartments}
                    onChange={(e) => setCondominiumSettings(prev => ({ ...prev, totalApartments: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={condominiumSettings.address}
                    onChange={(e) => setCondominiumSettings(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={condominiumSettings.city}
                    onChange={(e) => setCondominiumSettings(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={condominiumSettings.zipCode}
                    onChange={(e) => setCondominiumSettings(prev => ({ ...prev, zipCode: e.target.value }))}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contato da Administração</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adminPhone">Telefone</Label>
                    <Input
                      id="adminPhone"
                      value={condominiumSettings.adminPhone}
                      onChange={(e) => setCondominiumSettings(prev => ({ ...prev, adminPhone: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="adminEmail">E-mail</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={condominiumSettings.adminEmail}
                      onChange={(e) => setCondominiumSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('condomínio')}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Configurações de Reservas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxDays">Máximo de dias para agendamento</Label>
                  <Input
                    id="maxDays"
                    type="number"
                    value={reservationSettings.maxDaysAdvance}
                    onChange={(e) => setReservationSettings(prev => ({ ...prev, maxDaysAdvance: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxReservations">Máximo de reservas por usuário</Label>
                  <Input
                    id="maxReservations"
                    type="number"
                    value={reservationSettings.maxReservationsPerUser}
                    onChange={(e) => setReservationSettings(prev => ({ ...prev, maxReservationsPerUser: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cancellationHours">Horas mínimas para cancelamento</Label>
                  <Input
                    id="cancellationHours"
                    type="number"
                    value={reservationSettings.cancellationHours}
                    onChange={(e) => setReservationSettings(prev => ({ ...prev, cancellationHours: e.target.value }))}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Políticas de Reserva</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Permitir reservas em fins de semana</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que os moradores façam reservas aos sábados e domingos
                    </p>
                  </div>
                  <Switch
                    checked={reservationSettings.allowWeekendReservations}
                    onCheckedChange={(checked) => setReservationSettings(prev => ({ ...prev, allowWeekendReservations: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Exigir aprovação do administrador</Label>
                    <p className="text-sm text-muted-foreground">
                      Todas as reservas precisam ser aprovadas antes de serem confirmadas
                    </p>
                  </div>
                  <Switch
                    checked={reservationSettings.requireApproval}
                    onCheckedChange={(checked) => setReservationSettings(prev => ({ ...prev, requireApproval: checked }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('reservas')}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificações por e-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações importantes por e-mail
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações urgentes por SMS
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificar administradores</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar administradores sobre novas reservas
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.adminNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, adminNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificar mudanças de status</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar moradores quando suas reservas forem aprovadas/canceladas
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.statusChangeNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, statusChangeNotifications: checked }))}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="reminderHours">Lembrete antes da reserva (horas)</Label>
                <Input
                  id="reminderHours"
                  type="number"
                  value={notificationSettings.reminderHours}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, reminderHours: e.target.value }))}
                  className="mt-1 max-w-32"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enviar lembrete X horas antes da reserva
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('notificações')}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Configurações de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Configurações Avançadas</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Esta seção está em desenvolvimento. As configurações de usuários estarão disponíveis em breve.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 opacity-50">
                <div>
                  <Label>Período de inatividade para logout automático</Label>
                  <Select disabled>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="30 minutos" />
                    </SelectTrigger>
                  </Select>
                </div>
                
                <div>
                  <Label>Política de senhas</Label>
                  <Select disabled>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Padrão" />
                    </SelectTrigger>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Permitir auto-cadastro de moradores</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que novos moradores se cadastrem sem aprovação
                    </p>
                  </div>
                  <Switch disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManagement;