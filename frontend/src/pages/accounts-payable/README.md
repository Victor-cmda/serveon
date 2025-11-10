# Módulo de Contas a Pagar - Frontend

## 📋 Visão Geral

Módulo completo para gerenciamento de contas a pagar no frontend da aplicação ServeOn, construído com React, TypeScript e integração com a API NestJS.

## 🗂️ Estrutura de Arquivos

```
frontend/src/pages/accounts-payable/
├── index.tsx                      # Exportações principais do módulo
├── AccountsPayableList.tsx        # Página de listagem
├── AccountsPayableForm.tsx        # Formulário criar/editar
└── AccountsPayableDetail.tsx      # Página de detalhes e pagamento

frontend/src/types/
└── account-payable.ts             # Interfaces TypeScript

frontend/src/services/
└── api.ts                         # API Client (accountsPayableApi)
```

## 📦 Componentes

### 1. AccountsPayableList
**Arquivo:** `AccountsPayableList.tsx`  
**Rota:** `/accounts-payable`

#### Funcionalidades:
- ✅ Listagem de todas as contas a pagar
- ✅ Cards de resumo com totais por status (Abertas, Pagas, Vencidas, Parciais)
- ✅ Filtros por:
  - Busca textual (documento, fornecedor)
  - Status (ABERTO, PAGO, PARCIAL, VENCIDO, CANCELADO)
- ✅ Tabela com informações principais:
  - Número do documento e tipo
  - Fornecedor (nome e CNPJ/CPF)
  - Datas (emissão e vencimento)
  - Valores (original, pago, saldo)
  - Status com badges coloridos
  - Indicador visual para contas vencidas (fundo vermelho)
- ✅ Ação para visualizar detalhes

#### Cards de Resumo:
- **Total a Pagar**: Soma de todos os saldos não pagos/cancelados
- **Abertas**: Total de contas com status ABERTO
- **Vencidas**: Total de contas com status VENCIDO
- **Parciais**: Total de contas com status PARCIAL
- **Pagas**: Total de valores pagos

### 2. AccountsPayableForm
**Arquivo:** `AccountsPayableForm.tsx`  
**Rotas:** 
- `/accounts-payable/new` (criar)
- `/accounts-payable/:id/edit` (editar)

#### Funcionalidades:
- ✅ Formulário completo para criar/editar contas
- ✅ Campos:
  - **Documento**: Número e tipo (FATURA, DUPLICATA, BOLETO, NOTA_FISCAL)
  - **Fornecedor**: ID do fornecedor
  - **Forma de Pagamento**: ID da forma de pagamento
  - **Datas**: Emissão e vencimento
  - **Valores**: Original, desconto, juros, multa
  - **Observações**: Campo de texto livre
- ✅ Validação de campos obrigatórios
- ✅ Carregamento automático de dados ao editar
- ✅ Navegação para listagem após salvar

### 3. AccountsPayableDetail
**Arquivo:** `AccountsPayableDetail.tsx`  
**Rota:** `/accounts-payable/:id`

#### Funcionalidades:
- ✅ Visualização completa dos dados da conta
- ✅ Cards informativos:
  - **Status**: Badge com status atual
  - **Documento**: Número, tipo e parcela (se houver)
  - **Fornecedor**: Nome e CNPJ/CPF
  - **Datas**: Emissão, vencimento e pagamento
  - **Valores**: Detalhamento completo com desconto, juros, multa, total e saldo
- ✅ Ações disponíveis:
  - **Registrar Pagamento**: Modal para pagamento total ou parcial
  - **Editar**: Navega para formulário de edição
  - **Cancelar**: Cancela a conta (altera status)
  - **Excluir**: Remove permanentemente
- ✅ Controle de permissões:
  - Pagamento: Disponível para status ABERTO, PARCIAL ou VENCIDO
  - Edição: Disponível se status não for PAGO ou CANCELADO
  - Cancelamento: Disponível se status não for PAGO ou CANCELADO

#### Modal de Pagamento:
- Exibe saldo atual
- Campos para:
  - Valor pago
  - Data de pagamento
  - Desconto adicional
  - Juros
  - Multa
- Atualiza automaticamente o status:
  - PAGO: Se valor pago >= saldo
  - PARCIAL: Se valor pago < saldo
- Recalcula o saldo automaticamente

## 🔌 API Integration

### accountsPayableApi

**Arquivo:** `src/services/api.ts`

```typescript
export const accountsPayableApi = {
  // Listagem com filtros opcionais
  getAll: (filters?: AccountPayableFilters) => Promise<AccountPayable[]>
  
  // Buscar por ID
  getById: (id: number) => Promise<AccountPayable>
  
  // Contas vencidas
  getOverdue: () => Promise<AccountPayable[]>
  
  // Contas por fornecedor
  getBySupplier: (fornecedorId: number) => Promise<AccountPayable[]>
  
  // Contas por período
  getByPeriod: (dataInicio: string, dataFim: string) => Promise<AccountPayable[]>
  
  // Criar nova conta
  create: (data: CreateAccountPayableDto) => Promise<AccountPayable>
  
  // Atualizar conta existente
  update: (id: number, data: UpdateAccountPayableDto) => Promise<AccountPayable>
  
  // Registrar pagamento
  pay: (id: number, data: PayAccountDto) => Promise<AccountPayable>
  
  // Cancelar conta
  cancel: (id: number) => Promise<AccountPayable>
  
  // Atualizar status de vencidas
  updateOverdueStatus: () => Promise<void>
  
  // Excluir conta
  delete: (id: number) => Promise<void>
}
```

### Filtros Disponíveis (AccountPayableFilters)
```typescript
{
  fornecedorId?: number;    // Filtrar por fornecedor
  status?: string;          // Filtrar por status
  dataInicio?: string;      // Data inicial (formato: YYYY-MM-DD)
  dataFim?: string;         // Data final (formato: YYYY-MM-DD)
}
```

## 📊 Tipos TypeScript

### AccountPayable
Interface principal com todos os dados de uma conta:
- Informações da compra (pedido, modelo, série)
- Dados do fornecedor (ID, nome, CNPJ/CPF)
- Documento (número, tipo)
- Datas (emissão, vencimento, pagamento)
- Valores (original, desconto, juros, multa, pago, saldo)
- Forma de pagamento
- Status e controle (pago por, ativo, timestamps)

### CreateAccountPayableDto
DTO para criação de conta:
- Dados obrigatórios: fornecedorId, numeroDocumento, dataEmissao, dataVencimento, valorOriginal
- Dados opcionais: compra, tipoDocumento, valores adicionais, formaPagamentoId, observações

### UpdateAccountPayableDto
DTO para atualização (todos campos opcionais):
- Permite atualizar qualquer campo individual
- Inclui campos de pagamento e status

### PayAccountDto
DTO específico para pagamento:
- Campos obrigatórios: dataPagamento, valorPago, formaPagamentoId
- Campos opcionais: valorDesconto, valorJuros, valorMulta, pagoPor, observações

## 🎨 UI/UX

### Componentes Shadcn/UI Utilizados:
- ✅ `Button` - Botões de ação
- ✅ `Input` - Campos de entrada
- ✅ `Select` - Seletores dropdown
- ✅ `Card` - Cards informativos
- ✅ `Table` - Tabela de listagem
- ✅ `Badge` - Status badges
- ✅ `Dialog` - Modal de pagamento e confirmações
- ✅ `Label` - Rótulos de campos

### Bibliotecas Adicionais:
- ✅ `Sonner` - Sistema de notificações toast (via `@/lib/toast`)

### Ícones Lucide React:
- `Receipt` - Menu principal
- `Plus` - Nova conta
- `FileText` - Documentos
- `AlertCircle` - Avisos
- `CheckCircle` - Confirmação
- `Clock` - Pendente
- `XCircle` - Cancelado
- `Filter` - Filtros
- `Search` - Busca
- `DollarSign` - Pagamento
- `Edit` - Editar
- `Trash2` - Excluir
- `ArrowLeft` - Voltar
- `Save` - Salvar
- `Calendar` - Datas
- `User` - Fornecedor

### Esquema de Cores (Status):
- **Aberto**: Azul (`bg-blue-500`)
- **Pago**: Verde (`bg-green-500`)
- **Parcial**: Amarelo (`bg-yellow-500`)
- **Vencido**: Vermelho (`bg-red-500`)
- **Cancelado**: Cinza (`bg-gray-500`)

## 🛣️ Rotas Configuradas

```typescript
// Listagem
{
  path: 'accounts-payable',
  element: <AccountsPayableList />,
}

// Criar nova conta
{
  path: 'accounts-payable/new',
  element: <AccountsPayableForm />,
}

// Visualizar detalhes
{
  path: 'accounts-payable/:id',
  element: <AccountsPayableDetail />,
}

// Editar conta existente
{
  path: 'accounts-payable/:id/edit',
  element: <AccountsPayableForm />,
}
```

## 🎯 Menu de Navegação

Localização: **Sidebar > Gestão Principal > Contas a Pagar**

Ícone: `Receipt` (Recibo)

## 🔄 Fluxo de Trabalho

### 1. Criar Nova Conta
1. Acessar `/accounts-payable`
2. Clicar em "Nova Conta"
3. Preencher formulário
4. Salvar → Redireciona para listagem

### 2. Visualizar Conta
1. Na listagem, clicar em "Ver Detalhes"
2. Visualizar informações completas
3. Opções:
   - Registrar pagamento (se aplicável)
   - Editar dados
   - Cancelar conta
   - Excluir conta

### 3. Registrar Pagamento
1. Na página de detalhes, clicar "Registrar Pagamento"
2. Preencher modal com:
   - Valor pago (pré-preenchido com saldo)
   - Data de pagamento
   - Desconto/juros/multa (opcional)
3. Confirmar → Status atualizado automaticamente

### 4. Editar Conta
1. Na página de detalhes, clicar "Editar"
2. Modificar dados no formulário
3. Salvar → Redireciona para listagem

## 📋 Validações

### Frontend:
- Campos obrigatórios marcados com `*`
- Validação HTML5 (required, type="number", type="date")
- Valores numéricos com step="0.01" para decimais
- Datas no formato YYYY-MM-DD

### Backend (via API):
- class-validator decorators
- Tipos de enum validados
- Valores numéricos positivos
- Datas válidas
- Relações com fornecedor e forma de pagamento

## 🚀 Próximas Melhorias Sugeridas

1. **Seletor de Fornecedores**
   - Substituir campo numérico por autocomplete
   - Busca por nome/CNPJ
   
2. **Seletor de Formas de Pagamento**
   - Dropdown com opções carregadas da API
   
3. **Histórico de Pagamentos**
   - Tabela com todos os pagamentos parciais
   - Data, valor, usuário responsável
   
4. **Relatórios**
   - Contas a vencer (próximos 7/15/30 dias)
   - Contas vencidas
   - Análise por fornecedor
   - Fluxo de caixa
   
5. **Anexos**
   - Upload de notas fiscais
   - Upload de boletos
   - Visualizador de documentos
   
6. **Notificações**
   - Alertas de vencimento próximo
   - Notificações de contas vencidas
   
7. **Integração Bancária**
   - Importação de extratos
   - Reconciliação automática
   - Geração de arquivos de remessa
   
8. **Dashboard**
   - Gráficos de evolução
   - Indicadores de performance
   - Comparativos mensais/anuais

## 📝 Notas Técnicas

- **Estado Compartilhado**: Não utiliza Redux/Context API - cada componente gerencia seu próprio estado
- **Formulários**: Controlled components com React hooks (useState)
- **Navegação**: React Router v6 (useNavigate, useParams)
- **Notificações**: Sonner (toast.success, toast.error) para feedback ao usuário
- **Confirmações**: Dialog do Shadcn/UI reutilizado para confirmações de ações destrutivas
- **Formatação**: 
  - Moeda: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
  - Data: `new Date(date).toLocaleDateString('pt-BR')`

## 🐛 Troubleshooting

### Erros de importação com alias `@`
**Solução**: Verificar configuração no `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### API retorna 404
**Solução**: Verificar se o backend está rodando e se o módulo está registrado em `app.module.ts`

### Notificações não aparecem
**Solução**: Verificar se o componente `<Toaster />` do Sonner está no layout principal da aplicação

## ✅ Checklist de Implementação

- [x] Tipos TypeScript criados
- [x] API client configurada
- [x] Componente de listagem
- [x] Componente de formulário
- [x] Componente de detalhes
- [x] Modal de pagamento
- [x] Diálogos de confirmação
- [x] Rotas configuradas
- [x] Menu de navegação
- [x] Integração com backend
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Documentação de API
- [ ] Guia do usuário

---

**Desenvolvido para:** ServeOn ERP  
**Stack:** React + TypeScript + Vite + TailwindCSS + Shadcn/UI  
**Backend:** NestJS + PostgreSQL
