import { supabase } from '@/integrations/supabase/client';

/**
 * API Proxy - Gateway Pattern Implementation
 * 
 * Implementa o padrão API Gateway para centralizar todas as operações
 * de banco de dados através da Edge Function 'gateway'.
 * 
 * Vantagens:
 * - Autenticação e autorização centralizadas
 * - Logs de auditoria automáticos
 * - Validação de permissões antes de executar queries
 * - Controle de acesso baseado em roles (RBAC)
 */
export class ApiProxy {
  private static readonly GATEWAY_FUNCTION = 'gateway';

  /**
   * Método principal que roteia queries através do gateway
   * Todas as operações passam por aqui para garantir segurança
   */
  static async query<T = any>(
    table: string,
    operation: 'select' | 'insert' | 'update' | 'delete',
    options: {
      filters?: Record<string, any>;
      data?: any;
      order?: { column: string; ascending?: boolean };
      select?: string;
    } = {}
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      // Verifica se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return {
          data: null,
          error: { message: 'Sem sessão ativa' }
        };
      }

      // Envia requisição através do gateway para validação
      const { data, error } = await supabase.functions.invoke(this.GATEWAY_FUNCTION, {
        body: {
          path: `/api/${table}`,
          operation,
          ...options
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Erro no gateway proxy:', error);
        return { data: null, error };
      }

      // Após validação do gateway, executa a operação no banco
      // Em produção, o gateway rotearia para o microserviço apropriado
      return this.executeDatabaseOperation(table, operation, options);
    } catch (error) {
      console.error('Erro no API Proxy:', error);
      return {
        data: null,
        error: error instanceof Error ? error : { message: 'Erro desconhecido' }
      };
    }
  }

  /**
   * Executa a operação real no banco de dados
   * Só é chamado após autorização do gateway
   * Em uma arquitetura completa de microserviços, isso seria tratado pelo próprio gateway
   */
  private static async executeDatabaseOperation<T = any>(
    table: string,
    operation: 'select' | 'insert' | 'update' | 'delete',
    options: {
      filters?: Record<string, any>;
      data?: any;
      order?: { column: string; ascending?: boolean };
      select?: string;
    }
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      let query: any;

      switch (operation) {
        case 'select':
          query = (supabase as any).from(table).select(options.select || '*');
          break;
        case 'insert':
          query = (supabase as any).from(table).insert(options.data);
          break;
        case 'update':
          query = (supabase as any).from(table).update(options.data);
          break;
        case 'delete':
          query = (supabase as any).from(table).delete();
          break;
      }

      // Aplica filtros na query
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Aplica ordenação
      if (options.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending ?? false 
        });
      }

      return await query;
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : { message: 'Erro desconhecido' }
      };
    }
  }

  /**
   * Métodos simplificados para operações comuns
   * Facilitam o uso do proxy sem precisar especificar o tipo de operação
   */
  static async select<T = any>(
    table: string,
    options: {
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      select?: string;
    } = {}
  ): Promise<{ data: T[] | null; error: any }> {
    return this.query<T>(table, 'select', options);
  }

  static async insert<T = any>(
    table: string,
    data: any
  ): Promise<{ data: T[] | null; error: any }> {
    return this.query<T>(table, 'insert', { data });
  }

  static async update<T = any>(
    table: string,
    data: any,
    filters: Record<string, any>
  ): Promise<{ data: T[] | null; error: any }> {
    return this.query<T>(table, 'update', { data, filters });
  }

  static async delete<T = any>(
    table: string,
    filters: Record<string, any>
  ): Promise<{ data: T[] | null; error: any }> {
    return this.query<T>(table, 'delete', { filters });
  }
}
