import { 
  Scale, 
  Briefcase, 
  Users, 
  DollarSign, 
  Home,
  FileText,
  CreditCard,
  Building,
  Landmark,
  Shield
} from 'lucide-react';

/**
 * Templates pré-definidos de processos para agilizar cadastro
 */

export const PROCESSO_TEMPLATES = [
  {
    id: 'acao-indenizacao',
    nome: 'Ação de Indenização',
    descricao: 'Ação indenizatória por danos morais e/ou materiais',
    icon: Scale,
    categoria: 'Cível',
    dados: {
      classe: 'Ação de Indenização',
      assunto: 'Danos Morais e Materiais',
      tribunal: 'TJBA',
      status: 'ativo'
    }
  },
  {
    id: 'acao-trabalhista',
    nome: 'Ação Trabalhista',
    descricao: 'Reclamação trabalhista - Horas extras, verbas rescisórias',
    icon: Briefcase,
    categoria: 'Trabalhista',
    dados: {
      classe: 'Reclamação Trabalhista',
      assunto: 'Horas Extras não Pagas e Verbas Rescisórias',
      tribunal: 'TRT-BA',
      status: 'ativo'
    }
  },
  {
    id: 'divorcio',
    nome: 'Ação de Divórcio',
    descricao: 'Divórcio consensual ou litigioso',
    icon: Users,
    categoria: 'Família',
    dados: {
      classe: 'Ação de Divórcio',
      assunto: 'Divórcio com Partilha de Bens',
      tribunal: 'TJBA',
      status: 'ativo'
    }
  },
  {
    id: 'cobranca',
    nome: 'Ação de Cobrança',
    descricao: 'Cobrança de valores',
    icon: DollarSign,
    categoria: 'Cível',
    dados: {
      classe: 'Ação de Cobrança',
      assunto: 'Cobrança de Honorários Advocatícios',
      tribunal: 'TJBA',
      status: 'ativo'
    }
  },
  {
    id: 'despejo',
    nome: 'Ação de Despejo',
    descricao: 'Despejo por falta de pagamento ou término de contrato',
    icon: Home,
    categoria: 'Cível',
    dados: {
      classe: 'Ação de Despejo',
      assunto: 'Despejo por Falta de Pagamento',
      tribunal: 'TJBA',
      status: 'ativo'
    }
  },
  {
    id: 'inventario',
    nome: 'Inventário e Partilha',
    descricao: 'Inventário de bens com partilha entre herdeiros',
    icon: FileText,
    categoria: 'Família',
    dados: {
      classe: 'Inventário e Partilha',
      assunto: 'Inventário Extrajudicial',
      tribunal: 'TJBA',
      status: 'ativo'
    }
  },
  {
    id: 'consignacao',
    nome: 'Ação Consignatória',
    descricao: 'Consignação em pagamento',
    icon: CreditCard,
    categoria: 'Cível',
    dados: {
      classe: 'Ação de Consignação em Pagamento',
      assunto: 'Consignação de Aluguel',
      tribunal: 'TJBA',
      status: 'ativo'
    }
  },
  {
    id: 'usucapiao',
    nome: 'Ação de Usucapião',
    descricao: 'Usucapião de imóvel',
    icon: Building,
    categoria: 'Cível',
    dados: {
      classe: 'Ação de Usucapião',
      assunto: 'Usucapião Extraordinária de Imóvel',
      tribunal: 'TJBA',
      status: 'ativo'
    }
  },
  {
    id: 'execucao-fiscal',
    nome: 'Execução Fiscal',
    descricao: 'Execução de dívida tributária',
    icon: Landmark,
    categoria: 'Tributário',
    dados: {
      classe: 'Execução Fiscal',
      assunto: 'Cobrança de IPTU',
      tribunal: 'TJBA',
      status: 'ativo'
    }
  },
  {
    id: 'mandado-seguranca',
    nome: 'Mandado de Segurança',
    descricao: 'Proteção de direito líquido e certo',
    icon: Shield,
    categoria: 'Constitucional',
    dados: {
      classe: 'Mandado de Segurança',
      assunto: 'Direito Líquido e Certo Violado',
      tribunal: 'TJBA',
      status: 'ativo'
    }
  }
];

/**
 * Busca template por ID
 */
export const getTemplateById = (id) => {
  return PROCESSO_TEMPLATES.find(t => t.id === id);
};

/**
 * Busca templates por categoria
 */
export const getTemplatesByCategoria = (categoria) => {
  return PROCESSO_TEMPLATES.filter(t => t.categoria === categoria);
};

/**
 * Lista todas as categorias
 */
export const getCategorias = () => {
  return [...new Set(PROCESSO_TEMPLATES.map(t => t.categoria))];
};
