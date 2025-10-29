import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Filter, UserCheck, UserX, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AppRole } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

interface ResidentWithRoles extends Profile {
  roles: AppRole[];
}

const ResidentsManagement: React.FC = () => {
  const [residents, setResidents] = useState<ResidentWithRoles[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('apartment_number');

      if (profilesError) throw profilesError;

      // Fetch roles for each user
      const residentsWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: rolesData } = await (supabase as any)
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id);

          return {
            ...profile,
            roles: rolesData?.map((r: any) => r.role as AppRole) || []
          };
        })
      );

      setResidents(residentsWithRoles);
    } catch (error) {
      console.error('Erro ao buscar moradores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de moradores.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await (supabase as any)
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;

      await fetchResidents();

      toast({
        title: "Sucesso",
        description: `Permissão de ${getRoleLabel(role)} adicionada.`
      });
    } catch (error) {
      console.error('Erro ao adicionar permissão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a permissão.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await (supabase as any)
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      await fetchResidents();

      toast({
        title: "Sucesso",
        description: `Permissão de ${getRoleLabel(role)} removida.`
      });
    } catch (error) {
      console.error('Erro ao remover permissão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a permissão.",
        variant: "destructive"
      });
    }
  };

  const getRoleLabel = (role: AppRole): string => {
    const labels: Record<AppRole, string> = {
      resident: 'Morador',
      admin: 'Administrador',
      super_admin: 'Super Admin'
    };
    return labels[role];
  };

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = 
      resident.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.apartment_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || resident.roles.includes(roleFilter as AppRole);

    return matchesSearch && matchesRole;
  });

  const getRoleBadges = (roles: AppRole[]) => {
    if (roles.includes('super_admin')) {
      return <Badge className="bg-purple-600 text-white"><Shield className="h-3 w-3 mr-1" />Super Admin</Badge>;
    }
    if (roles.includes('admin')) {
      return <Badge className="bg-primary text-primary-foreground">Administrador</Badge>;
    }
    return <Badge variant="secondary">Morador</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando moradores...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Gerenciamento de Moradores
              <Badge variant="secondary" className="ml-2">
                {filteredResidents.length} de {residents.length}
              </Badge>
            </CardTitle>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou apartamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="resident">Moradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredResidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum morador encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResidents.map((resident) => (
                <Card key={resident.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getRoleBadges(resident.roles)}
                        <span className="text-sm text-muted-foreground">
                          Apartamento {resident.apartment_number}
                        </span>
                      </div>
                      
                      <div className="text-lg font-medium">
                        {resident.display_name || 'Nome não informado'}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Cadastrado em: {new Date(resident.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {!resident.roles.includes('admin') && (
                        <Button
                          size="sm"
                          onClick={() => handleAddRole(resident.user_id, 'admin')}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Tornar Admin
                        </Button>
                      )}
                      {resident.roles.includes('admin') && !resident.roles.includes('super_admin') && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveRole(resident.user_id, 'admin')}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Remover Admin
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAddRole(resident.user_id, 'super_admin')}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Super Admin
                          </Button>
                        </>
                      )}
                      {resident.roles.includes('super_admin') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveRole(resident.user_id, 'super_admin')}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Remover Super Admin
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResidentsManagement;
