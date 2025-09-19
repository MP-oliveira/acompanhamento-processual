import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle">
      <label className="theme-toggle-label">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleTheme}
          className="theme-toggle-input"
        />
        <div className="theme-toggle-slider">
          <div className="theme-toggle-icon">
            {isDarkMode ? (
              <Moon size={16} />
            ) : (
              <Sun size={16} />
            )}
          </div>
        </div>
        <span className="theme-toggle-text">
          {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle;
