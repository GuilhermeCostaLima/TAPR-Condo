# 📋 Resumo do Projeto Implementado

Arquitetura Geral
Este é um projeto React + Supabase com arquitetura hexagonal no frontend e microserviços implementados como Supabase Edge Functions (não Spring Boot).

# 🏗️ Componentes Principais

1. Gateway Service
- Localização: supabase/functions/gateway/index.ts
- Função: Valida JWT, verifica roles e autoriza acesso às rotas
- Como funciona: Intercepta requisições, checa token e role do usuário
- Logs: Ver logs do Gateway

2. Service Discovery
- Localização: supabase/functions/service-discovery/index.ts
- Função: Registro e descoberta dinâmica de serviços (padrão Netflix Eureka)
- Features: Registro, heartbeat, listagem de serviços
- Cliente Frontend: src/infrastructure/service-discovery/ServiceRegistry.ts
- Logs: Ver logs do Service Discovery

3. Arquitetura Hexagonal (Frontend)
~~~
src/
├── domain/              # Entidades e interfaces (regras de negócio)
│   ├── entities/        # Profile, Reservation, Notice, Document
│   └── repositories/    # Interfaces dos repositórios
├── application/         # Casos de uso (lógica de aplicação)
│   └── use-cases/       # SignIn, CreateReservation, etc.
├── infrastructure/      # Implementações concretas
│   ├── repositories/    # Supabase repositories
│   ├── gateway/         # GatewayClient
│   └── service-discovery/ # ServiceRegistry
└── presentation/        # UI Components e páginas
    ├── components/
    ├── pages/
    └── hooks/
~~~

# 👥 Roles Implementadas

Hierarquia de Roles:

resident (nível 1)      → Morador comum
admin (nível 2)         → Administrador do condomínio
super_admin (nível 3)   → Super administrador

Onde estão definidas:

- Enum: Criado via migration no Postgres como app_role
- Tabela: user_roles (tabela separada por segurança)
- Funções de validação:
	- check_user_has_role()
	- user_has_minimum_role()
	- get_user_role_level()

# Implementação:

- src/domain/entities/UserRole.entity.ts -> Definição da entidade
- src/infrastructure/repositories/supabase/SupabaseUserRoleRepository.ts -> Repositório
- Gateway valida roles em: supabase/functions/gateway/index.ts

🚀 Como Iniciar o Projeto

1. Instalação:
	npm install
2. Executar localmente:
	npm run dev
3. Autenticação:
- Criar conta na página Auth
- Roles são atribuídas via tabela user_roles

# Pode ser visto em funcionamento com hospedágem no vercel
https://condominio-jade.vercel.app/auth


