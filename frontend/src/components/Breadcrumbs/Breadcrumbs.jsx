import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, FileText, Plus, Edit, AlertTriangle, Calendar, Search, BarChart3, Users, Settings, User, Activity } from 'lucide-react';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import './Breadcrumbs.css';

// Mapeamento de ícones
const iconMap = {
  Home,
  FileText,
  Plus,
  Edit,
  AlertTriangle,
  Calendar,
  Search,
  BarChart3,
  Users,
  Settings,
  User,
  Activity
};

const Breadcrumbs = ({ className = '' }) => {
  const breadcrumbs = useBreadcrumbs();

  // Não mostrar breadcrumbs se estivermos apenas no dashboard
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className={`breadcrumbs ${className}`} aria-label="Navegação estrutural">
      <ol className="breadcrumbs-list">
        {breadcrumbs.map((breadcrumb, index) => {
          const IconComponent = iconMap[breadcrumb.icon];
          const isLast = index === breadcrumbs.length - 1;
          const isId = breadcrumb.isId;

          return (
            <li key={`${breadcrumb.path}-${index}`} className="breadcrumbs-item">
              {!isLast ? (
                <Link 
                  to={breadcrumb.path}
                  className={`breadcrumbs-link ${isId ? 'breadcrumbs-link-id' : ''}`}
                  aria-label={`Ir para ${breadcrumb.label}`}
                >
                  {IconComponent && (
                    <IconComponent 
                      size={16} 
                      className="breadcrumbs-icon" 
                      aria-hidden="true"
                    />
                  )}
                  <span className="breadcrumbs-text">
                    {isId ? breadcrumb.label : breadcrumb.label}
                  </span>
                </Link>
              ) : (
                <span 
                  className={`breadcrumbs-current ${isId ? 'breadcrumbs-current-id' : ''}`}
                  aria-current="page"
                >
                  {IconComponent && (
                    <IconComponent 
                      size={16} 
                      className="breadcrumbs-icon" 
                      aria-hidden="true"
                    />
                  )}
                  <span className="breadcrumbs-text">
                    {breadcrumb.label}
                  </span>
                </span>
              )}
              
              {!isLast && (
                <ChevronRight 
                  size={16} 
                  className="breadcrumbs-separator" 
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
