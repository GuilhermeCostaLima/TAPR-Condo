import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Calendar,
  Users,
  FileText,
  Bell,
  Settings,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Shield,
  User,
  LogOut,
  Home
} from 'lucide-react';

interface CondominiumLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const CondominiumLayout: React.FC<CondominiumLayoutProps> = ({ children, activeSection, onSectionChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { profile, signOut, hasMinimumRole } = useAuth();
  
  const isAdmin = hasMinimumRole('admin');
  const currentUser = profile?.display_name || '';
  const apartmentNumber = profile?.apartment_number;

  const residentItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'reservations', label: 'Reservas', icon: Calendar },
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'notices', label: 'Avisos', icon: Bell },
  ];

  const adminItems = [
    { id: 'dashboard', label: 'Painel', icon: Home },
    { id: 'reservations', label: 'Reservas', icon: Calendar },
    { id: 'residents', label: 'Moradores', icon: Users },
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'notices', label: 'Avisos', icon: Bell },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const menuItems = isAdmin ? adminItems : residentItems;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Residencial Costa Esmeralda
                </h1>
                <p className="text-sm text-muted-foreground">Sistema de Reservas</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Rua das Palmeiras, 123</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>(11) 9999-9999</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{currentUser}</span>
                  {apartmentNumber && (
                    <Badge variant="outline">Apt {apartmentNumber}</Badge>
                  )}
                  <Badge variant={isAdmin ? 'default' : 'secondary'}>
                    {isAdmin ? 'Administrador' : 'Morador'}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <aside className={`lg:col-span-1 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navegação</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start gap-3 h-11"
                        onClick={() => {
                          onSectionChange(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Informações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de Apartamentos</span>
                  <Badge variant="secondary">16</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Reservas Pendentes</span>
                  <Badge variant="default">2</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Online
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CondominiumLayout;