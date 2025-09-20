import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useJSPDF, useFileSaver } from '../../hooks/useLazyLibrary';
import './ExportButton.css';

const ExportButton = ({ 
  type = 'pdf', 
  data, 
  filename, 
  onSuccess, 
  onError,
  className = '',
  disabled = false,
  children 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { loadLibrary: loadJSPDF } = useJSPDF();
  const { loadLibrary: loadFileSaver } = useFileSaver();

  const handleExport = async () => {
    if (!data || isExporting) return;

    setIsExporting(true);

    try {
      if (type === 'pdf') {
        await exportToPDF();
      } else if (type === 'word') {
        await exportToWord();
      }
      
      onSuccess?.();
    } catch (error) {
      console.error(`Erro ao exportar ${type}:`, error);
      onError?.(error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    const { default: jsPDF } = await loadJSPDF();
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Função para adicionar texto
    const addText = (text, fontSize = 12, isBold = false, color = '#000000') => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setTextColor(color);
      
      const lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * (fontSize * 0.4) + 5;
    };

    // Título
    addText(data.title || 'Relatório', 18, true, '#2c3e50');
    addText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 12, false, '#7f8c8d');
    yPosition += 10;

    // Conteúdo
    if (data.content) {
      addText('Conteúdo', 14, true, '#34495e');
      yPosition += 10;
      addText(data.content, 12, false);
    }

    // Salvar
    const fileName = filename || `relatorio_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  const exportToWord = async () => {
    const { saveAs } = await loadFileSaver();
    
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <meta name="ProgId" content="Word.Document">
        <title>${data.title || 'Relatório'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
          h2 { color: #34495e; margin-top: 30px; }
          .info-item { margin: 10px 0; }
          .label { font-weight: bold; color: #2c3e50; }
        </style>
      </head>
      <body>
        <h1>${data.title || 'Relatório'}</h1>
        <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        ${data.content ? `<div>${data.content}</div>` : ''}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const fileName = filename || `relatorio_${new Date().toISOString().split('T')[0]}.doc`;
    saveAs(blob, fileName);
  };

  return (
    <button
      className={`export-button export-button-${type} ${className}`}
      onClick={handleExport}
      disabled={disabled || isExporting || !data}
    >
      {isExporting ? (
        <>
          <Loader2 size={16} className="export-button-icon spinning" />
          Exportando...
        </>
      ) : (
        <>
          <Download size={16} className="export-button-icon" />
          {children || `Exportar ${type.toUpperCase()}`}
        </>
      )}
    </button>
  );
};

export default ExportButton;
