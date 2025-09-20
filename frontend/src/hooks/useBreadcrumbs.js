import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

/**
 * Hook para gerar breadcrumbs baseado na rota atual
 */
export const useBreadcrumbs = () => {
  const location = useLocation();
  const params = useParams();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems = [];

    // Sempre começar com Dashboard
    breadcrumbItems.push({
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'Home'
    });

    // Mapear rotas para breadcrumbs
    const routeMap = {
      'dashboard': { label: 'Dashboard', icon: 'Home' },
      'processos': { label: 'Processos', icon: 'FileText' },
      'novo': { label: 'Novo Processo', icon: 'Plus' },
      'editar': { label: 'Editar Processo', icon: 'Edit' },
      'alertas': { label: 'Alertas', icon: 'AlertTriangle' },
      'calendario': { label: 'Calendário', icon: 'Calendar' },
      'consultas': { label: 'Consultas', icon: 'Search' },
      'relatorios': { label: 'Relatórios', icon: 'BarChart3' },
      'usuarios': { label: 'Usuários', icon: 'Users' },
      'configuracoes': { label: 'Configurações', icon: 'Settings' },
      'perfil': { label: 'Perfil', icon: 'User' },
      'performance': { label: 'Performance', icon: 'Activity' }
    };

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Se for um ID (número), usar o contexto anterior
      if (/^\d+$/.test(segment)) {
        const previousSegment = pathSegments[index - 1];
        if (previousSegment === 'editar') {
          breadcrumbItems.push({
            label: `Processo ${segment}`,
            path: currentPath,
            icon: 'FileText',
            isId: true
          });
        } else if (previousSegment === 'processos') {
          breadcrumbItems.push({
            label: `Processo ${segment}`,
            path: currentPath,
            icon: 'FileText',
            isId: true
          });
        }
      } else {
        // Mapear segmento para breadcrumb
        const routeInfo = routeMap[segment];
        if (routeInfo) {
          breadcrumbItems.push({
            label: routeInfo.label,
            path: currentPath,
            icon: routeInfo.icon
          });
        }
      }
    });

    // Se estivermos na rota raiz, mostrar apenas Dashboard
    if (location.pathname === '/' || location.pathname === '') {
      return [breadcrumbItems[0]];
    }

    return breadcrumbItems;
  }, [location.pathname, params]);

  return breadcrumbs;
};

/**
 * Hook para obter título da página atual
 */
export const usePageTitle = () => {
  const breadcrumbs = useBreadcrumbs();
  
  return useMemo(() => {
    if (breadcrumbs.length === 0) return 'JurisAcompanha';
    
    const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
    return lastBreadcrumb.label;
  }, [breadcrumbs]);
};

/**
 * Hook para obter descrição da página atual
 */
export const usePageDescription = () => {
  const location = useLocation();
  
  return useMemo(() => {
    const descriptions = {
      '/dashboard': 'Visão geral do sistema e estatísticas principais',
      '/processos': 'Gerenciar todos os processos judiciais',
      '/processos/novo': 'Criar um novo processo judicial',
      '/alertas': 'Visualizar alertas e notificações importantes',
      '/calendario': 'Acompanhar eventos e prazos no calendário',
      '/consultas': 'Realizar consultas em sistemas externos',
      '/relatorios': 'Gerar e visualizar relatórios do sistema',
      '/usuarios': 'Gerenciar usuários e permissões',
      '/configuracoes': 'Configurar sistema e preferências',
      '/perfil': 'Gerenciar perfil e configurações pessoais',
      '/performance': 'Monitorar performance e métricas do sistema'
    };

    return descriptions[location.pathname] || 'Sistema de Acompanhamento Processual';
  }, [location.pathname]);
};

export default useBreadcrumbs;
