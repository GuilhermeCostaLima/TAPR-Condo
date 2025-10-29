import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Bell, Search, Filter, Plus, Calendar, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Notice } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

const NoticesManagement: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    isActive: true,
    expiresAt: ''
  });

  const [editNotice, setEditNotice] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    isActive: true,
    expiresAt: ''
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices((data || []) as Notice[]);
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os avisos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: { [key: string]: { label: string; icon: any; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
      low: { label: 'Baixa', icon: Info, variant: 'secondary' },
      normal: { label: 'Normal', icon: Info, variant: 'outline' },
      high: { label: 'Alta', icon: AlertTriangle, variant: 'default' },
      urgent: { label: 'Urgente', icon: AlertTriangle, variant: 'destructive' }
    };

    const config = priorityConfig[priority] || priorityConfig.normal;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = 
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || notice.priority === typeFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && notice.is_active) ||
      (statusFilter === 'inactive' && !notice.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const handleAddNotice = async () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      const noticeData = {
        title: newNotice.title,
        content: newNotice.content,
        category: newNotice.category,
        priority: newNotice.priority,
        is_active: newNotice.isActive,
        created_by: userData.user.id,
        expires_at: newNotice.expiresAt ? new Date(newNotice.expiresAt).toISOString() : null
      };

      const { error } = await supabase
        .from('notices')
        .insert([noticeData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aviso publicado com sucesso!",
      });

      setIsAddDialogOpen(false);
      setNewNotice({ title: '', content: '', category: 'general', priority: 'normal', isActive: true, expiresAt: '' });
      fetchNotices();
    } catch (error) {
      console.error('Erro ao publicar aviso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível publicar o aviso.",
        variant: "destructive"
      });
    }
  };

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setEditNotice({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      priority: notice.priority as 'low' | 'normal' | 'high' | 'urgent',
      isActive: notice.is_active,
      expiresAt: notice.expires_at ? new Date(notice.expires_at).toISOString().split('T')[0] : ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateNotice = async () => {
    if (!editingNotice || !editNotice.title.trim() || !editNotice.content.trim()) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const noticeData = {
        title: editNotice.title,
        content: editNotice.content,
        category: editNotice.category,
        priority: editNotice.priority,
        is_active: editNotice.isActive,
        expires_at: editNotice.expiresAt ? new Date(editNotice.expiresAt).toISOString() : null
      };

      const { error } = await supabase
        .from('notices')
        .update(noticeData)
        .eq('id', editingNotice.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aviso atualizado com sucesso!",
      });

      setIsEditDialogOpen(false);
      setEditingNotice(null);
      setEditNotice({ title: '', content: '', category: 'general', priority: 'normal', isActive: true, expiresAt: '' });
      fetchNotices();
    } catch (error) {
      console.error('Erro ao atualizar aviso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o aviso.",
        variant: "destructive"
      });
    }
  };

  const toggleNoticeStatus = async (noticeId: string) => {
    try {
      const notice = notices.find(n => n.id === noticeId);
      if (!notice) return;

      const { error } = await supabase
        .from('notices')
        .update({ is_active: !notice.is_active })
        .eq('id', noticeId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Aviso ${!notice.is_active ? 'ativado' : 'desativado'} com sucesso!`,
      });

      fetchNotices();
    } catch (error) {
      console.error('Erro ao alterar status do aviso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do aviso.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Gerenciamento de Avisos
              <Badge variant="secondary" className="ml-2">
                {filteredNotices.length} de {notices.length}
              </Badge>
            </CardTitle>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Publicar Aviso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Publicar Novo Aviso</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newNotice.title}
                      onChange={(e) => setNewNotice(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Digite o título do aviso"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Conteúdo</Label>
                    <Textarea
                      id="content"
                      value={newNotice.content}
                      onChange={(e) => setNewNotice(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Digite o conteúdo do aviso"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={newNotice.priority} onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => setNewNotice(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="expiresAt">Data de Expiração (Opcional)</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={newNotice.expiresAt}
                      onChange={(e) => setNewNotice(prev => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={newNotice.isActive}
                      onCheckedChange={(checked) => setNewNotice(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">Publicar imediatamente</Label>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddNotice}>
                      Publicar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dialog de Edição */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Aviso</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Título</Label>
                    <Input
                      id="edit-title"
                      value={editNotice.title}
                      onChange={(e) => setEditNotice(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Digite o título do aviso"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-content">Conteúdo</Label>
                    <Textarea
                      id="edit-content"
                      value={editNotice.content}
                      onChange={(e) => setEditNotice(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Digite o conteúdo do aviso"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-priority">Prioridade</Label>
                    <Select value={editNotice.priority} onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => setEditNotice(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-expiresAt">Data de Expiração (Opcional)</Label>
                    <Input
                      id="edit-expiresAt"
                      type="date"
                      value={editNotice.expiresAt}
                      onChange={(e) => setEditNotice(prev => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-isActive"
                      checked={editNotice.isActive}
                      onCheckedChange={(checked) => setEditNotice(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="edit-isActive">Aviso ativo</Label>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateNotice}>
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar avisos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Prioridades</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Carregando avisos...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum aviso encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotices.map((notice) => (
                <Card key={notice.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getPriorityBadge(notice.priority)}
                        <Badge variant={notice.is_active ? "default" : "secondary"}>
                          {notice.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(notice.created_at)}
                        </span>
                      </div>
                      
                      <div className="text-lg font-medium">
                        {notice.title}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {notice.content}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Categoria: {notice.category}
                        {notice.expires_at && (
                          <span className="ml-4">
                            Expira em: {formatDateTime(notice.expires_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleNoticeStatus(notice.id)}
                      >
                        {notice.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditNotice(notice)}
                      >
                        Editar
                      </Button>
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

export default NoticesManagement;