/**
 * Calculadora de Prazos Processuais
 * Considera dias úteis e feriados nacionais/estaduais
 */

// Feriados nacionais fixos
const feriadosFixos = [
  { mes: 1, dia: 1, nome: 'Ano Novo' },
  { mes: 4, dia: 21, nome: 'Tiradentes' },
  { mes: 5, dia: 1, nome: 'Dia do Trabalho' },
  { mes: 9, dia: 7, nome: 'Independência' },
  { mes: 10, dia: 12, nome: 'Nossa Senhora Aparecida' },
  { mes: 11, dia: 2, nome: 'Finados' },
  { mes: 11, dia: 15, nome: 'Proclamação da República' },
  { mes: 12, dia: 25, nome: 'Natal' }
];

// Calcular Páscoa (algoritmo de Meeus/Jones/Butcher)
const calcularPascoa = (ano) => {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(ano, mes - 1, dia);
};

// Obter todos os feriados de um ano
export const obterFeriados = (ano) => {
  const feriados = [];
  
  // Feriados fixos
  feriadosFixos.forEach(f => {
    feriados.push(new Date(ano, f.mes - 1, f.dia));
  });
  
  // Feriados móveis (baseados na Páscoa)
  const pascoa = calcularPascoa(ano);
  
  // Carnaval (47 dias antes da Páscoa)
  const carnaval = new Date(pascoa);
  carnaval.setDate(pascoa.getDate() - 47);
  feriados.push(carnaval);
  
  // Sexta-feira Santa (2 dias antes da Páscoa)
  const sextaFeira = new Date(pascoa);
  sextaFeira.setDate(pascoa.getDate() - 2);
  feriados.push(sextaFeira);
  
  // Corpus Christi (60 dias após a Páscoa)
  const corpusChristi = new Date(pascoa);
  corpusChristi.setDate(pascoa.getDate() + 60);
  feriados.push(corpusChristi);
  
  return feriados;
};

// Verificar se uma data é feriado
export const ehFeriado = (data) => {
  const ano = data.getFullYear();
  const feriados = obterFeriados(ano);
  
  return feriados.some(feriado => 
    feriado.toDateString() === data.toDateString()
  );
};

// Verificar se uma data é dia útil
export const ehDiaUtil = (data) => {
  const diaSemana = data.getDay();
  
  // Sábado (6) ou Domingo (0)
  if (diaSemana === 0 || diaSemana === 6) {
    return false;
  }
  
  // Feriado
  if (ehFeriado(data)) {
    return false;
  }
  
  return true;
};

// Calcular prazo (adicionar dias úteis)
export const calcularPrazo = (dataInicial, diasUteis) => {
  let data = new Date(dataInicial);
  let diasAdicionados = 0;
  
  while (diasAdicionados < diasUteis) {
    data.setDate(data.getDate() + 1);
    
    if (ehDiaUtil(data)) {
      diasAdicionados++;
    }
  }
  
  return data;
};

// Contar dias úteis entre duas datas
export const contarDiasUteis = (dataInicio, dataFim) => {
  let data = new Date(dataInicio);
  let diasUteis = 0;
  
  while (data <= dataFim) {
    if (ehDiaUtil(data)) {
      diasUteis++;
    }
    data.setDate(data.getDate() + 1);
  }
  
  return diasUteis;
};

// Calcular prazo de recurso (15 dias úteis - CPC Art. 1.003)
export const calcularPrazoRecurso = (dataPublicacao) => {
  return calcularPrazo(dataPublicacao, 15);
};

// Calcular prazo de embargos de declaração (5 dias úteis - CPC Art. 1.023)
export const calcularPrazoEmbargos = (dataPublicacao) => {
  return calcularPrazo(dataPublicacao, 5);
};

// Calcular prazo de contestação (15 dias úteis - CPC Art. 335)
export const calcularPrazoContestacao = (dataCitacao) => {
  return calcularPrazo(dataCitacao, 15);
};

// Verificar se prazo está próximo (menos de X dias úteis)
export const prazoProximo = (dataPrazo, diasAlerta = 3) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  if (dataPrazo < hoje) {
    return { status: 'vencido', diasRestantes: 0 };
  }
  
  const diasUteis = contarDiasUteis(hoje, dataPrazo);
  
  if (diasUteis === 0) {
    return { status: 'hoje', diasRestantes: 0 };
  } else if (diasUteis <= diasAlerta) {
    return { status: 'urgente', diasRestantes: diasUteis };
  } else {
    return { status: 'normal', diasRestantes: diasUteis };
  }
};

// Formatar informação de prazo
export const formatarPrazo = (dataPrazo) => {
  const info = prazoProximo(dataPrazo);
  
  switch (info.status) {
    case 'vencido':
      return {
        texto: 'Prazo vencido',
        classe: 'prazo-vencido',
        cor: '#EF4444'
      };
    case 'hoje':
      return {
        texto: 'Vence hoje!',
        classe: 'prazo-hoje',
        cor: '#F59E0B'
      };
    case 'urgente':
      return {
        texto: `${info.diasRestantes} dia${info.diasRestantes > 1 ? 's' : ''} útil${info.diasRestantes > 1 ? 'eis' : ''}`,
        classe: 'prazo-urgente',
        cor: '#F59E0B'
      };
    default:
      return {
        texto: `${info.diasRestantes} dias úteis`,
        classe: 'prazo-normal',
        cor: '#10B981'
      };
  }
};

// Obter próximos feriados
export const proximosFeriados = (quantidade = 5) => {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const anoProximo = anoAtual + 1;
  
  const feriadosAnoAtual = obterFeriados(anoAtual);
  const feriadosProximoAno = obterFeriados(anoProximo);
  
  const todosFeriados = [...feriadosAnoAtual, ...feriadosProximoAno]
    .filter(f => f >= hoje)
    .sort((a, b) => a - b)
    .slice(0, quantidade);
  
  return todosFeriados;
};

