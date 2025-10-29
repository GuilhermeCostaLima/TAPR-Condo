import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Search, Filter, Plus, Download, Eye, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

const DocumentsManagement: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: 'general'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
      regulamento: { label: 'Regulamento', variant: 'default' },
      ata: { label: 'Ata', variant: 'secondary' },
      comunicado: { label: 'Comunicado', variant: 'outline' },
      financeiro: { label: 'Financeiro', variant: 'destructive' },
      general: { label: 'Geral', variant: 'outline' },
      outros: { label: 'Outros', variant: 'secondary' }
    };

    const config = categoryConfig[category] || categoryConfig.general;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleViewDocument = async (document: Document) => {
    if (document.file_url && document.file_url !== '#') {
      try {
        // Get signed URL for viewing
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(document.file_url.replace('documents/', ''), 60 * 60); // 1 hour expiry

        if (error) throw error;
        
        window.open(data.signedUrl, '_blank');
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível visualizar o documento.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Aviso",
        description: "Arquivo não disponível para visualização.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    if (doc.file_url && doc.file_url !== '#') {
      try {
        // Get signed URL for download
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(doc.file_url.replace('documents/', ''), 60 * 60); // 1 hour expiry

        if (error) throw error;

        // Create download link
        const response = await fetch(data.signedUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = doc.file_name;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
        
        toast({
          title: "Sucesso",
          description: "Download iniciado!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível fazer o download do arquivo.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Aviso",
        description: "Arquivo não disponível para download.",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAddDocument = async () => {
    if (!newDocument.title.trim() || !newDocument.description?.trim()) {
      toast({
        title: "Erro",
        description: "Título e descrição são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para upload.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userData.user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Create document record
      const documentData = {
        title: newDocument.title,
        description: newDocument.description,
        category: newDocument.category,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        file_url: `documents/${fileName}`,
        file_size: selectedFile.size,
        uploaded_by: userData.user.id,
        is_public: true
      };

      const { error } = await supabase
        .from('documents')
        .insert([documentData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Documento adicionado com sucesso!",
      });

      setIsAddDialogOpen(false);
      setNewDocument({ title: '', description: '', category: 'general' });
      setSelectedFile(null);
      fetchDocuments();
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o documento.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Gerenciamento de Documentos
              <Badge variant="secondary" className="ml-2">
                {filteredDocuments.length} de {documents.length}
              </Badge>
            </CardTitle>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Documento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Documento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newDocument.title}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Digite o título do documento"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newDocument.description}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Digite uma breve descrição"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={newDocument.category} onValueChange={(value: Document['category']) => setNewDocument(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Geral</SelectItem>
                        <SelectItem value="regulamento">Regulamento</SelectItem>
                        <SelectItem value="ata">Ata</SelectItem>
                        <SelectItem value="comunicado">Comunicado</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="file">Arquivo</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Arquivo selecionado: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddDocument} disabled={uploading}>
                      {uploading ? "Enviando..." : "Adicionar"}
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
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="regulamento">Regulamento</SelectItem>
                <SelectItem value="ata">Ata</SelectItem>
                <SelectItem value="comunicado">Comunicado</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Carregando documentos...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum documento encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(document.category)}
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(document.created_at)}
                        </span>
                      </div>
                      
                      <div className="text-lg font-medium">
                        {document.title}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {document.description}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Arquivo: {document.file_name} • {formatFileSize(document.file_size)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDocument(document)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
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

export default DocumentsManagement;