import React, { useState } from 'react';
import { Download, FileText, BarChart3, Loader2 } from 'lucide-react';
import { useJSPDF, useFileSaver } from '../../hooks/useLazyLibrary';
import './RelatorioExport.css';

const RelatorioExport = ({ 
  relatorio, 
  onSuccess, 
  onError,
  className = '' 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  const { loadLibrary: loadJSPDF } = useJSPDF();
  const { loadLibrary: loadFileSaver } = useFileSaver();

  const handleExport = async (type) => {
    if (!relatorio || isExporting) return;

    setIsExporting(true);
    setExportType(type);

    try {
      if (type === 'pdf') {
        await exportToPDF();
      } else if (type === 'word') {
        await exportToWord();
      }
      
      onSuccess?.(type);
    } catch (error) {
      console.error(`Erro ao exportar ${type}:`, error);
      onError?.(error);
    } finally {
      setIsExporting(false);
      setExportType(null);
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

    // Função para adicionar linha separadora
    const addSeparator = () => {
      yPosition += 5;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
    };

    // Cabeçalho
    addText('RELATÓRIO DE PROCESSOS', 18, true, '#2c3e50');
    addText(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 12, false, '#7f8c8d');
    yPosition += 15;

    // Informações do Relatório
    addText('Informações do Relatório', 14, true, '#34495e');
    addSeparator();
    
    addText(`Título: ${relatorio.titulo}`, 12, false);
    addText(`Tipo: ${getTipoText(relatorio.tipo)}`, 12, false);
    addText(`Período: ${relatorio.periodo}`, 12, false);
    addText(`Status: ${getStatusText(relatorio.status)}`, 12, false);
    
    if (relatorio.descricao) {
      addText(`Descrição: ${relatorio.descricao}`, 12, false);
    }
    
    yPosition += 10;

    // Dados do Relatório
    if (relatorio.dados) {
      addText('Dados do Relatório', 14, true, '#34495e');
      addSeparator();
      
      Object.entries(relatorio.dados).forEach(([key, value]) => {
        addText(`${key}: ${value}`, 12, false);
      });
    }

    // Estatísticas
    if (relatorio.estatisticas) {
      yPosition += 10;
      addText('Estatísticas', 14, true, '#34495e');
      addSeparator();
      
      Object.entries(relatorio.estatisticas).forEach(([key, value]) => {
        addText(`${key}: ${value}`, 12, false);
      });
    }

    // Salvar
    const fileName = `relatorio_${relatorio.titulo}_${new Date().toISOString().split('T')[0]}.pdf`;
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
        <title>Relatório de Processos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
          h2 { color: #34495e; margin-top: 30px; }
          .info-item { margin: 10px 0; }
          .label { font-weight: bold; color: #2c3e50; }
          .value { margin-left: 10px; }
          .section { margin: 20px 0; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>RELATÓRIO DE PROCESSOS</h1>
        <p><strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        
        <div class="section">
          <h2>Informações do Relatório</h2>
          <div class="info-item">
            <span class="label">Título:</span>
            <span class="value">${relatorio.titulo}</span>
          </div>
          <div class="info-item">
            <span class="label">Tipo:</span>
            <span class="value">${getTipoText(relatorio.tipo)}</span>
          </div>
          <div class="info-item">
            <span class="label">Período:</span>
            <span class="value">${relatorio.periodo}</span>
          </div>
          <div class="info-item">
            <span class="label">Status:</span>
            <span class="value">${getStatusText(relatorio.status)}</span>
          </div>
          ${relatorio.descricao ? `
            <div class="info-item">
              <span class="label">Descrição:</span>
              <span class="value">${relatorio.descricao}</span>
            </div>
          ` : ''}
        </div>

        ${relatorio.dados ? `
          <div class="section">
            <h2>Dados do Relatório</h2>
            <table>
              <thead>
                <tr>
                  <th>Campo</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(relatorio.dados).map(([key, value]) => `
                  <tr>
                    <td>${key}</td>
                    <td>${value}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        ${relatorio.estatisticas ? `
          <div class="section">
            <h2>Estatísticas</h2>
            <table>
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(relatorio.estatisticas).map(([key, value]) => `
                  <tr>
                    <td>${key}</td>
                    <td>${value}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const fileName = `relatorio_${relatorio.titulo}_${new Date().toISOString().split('T')[0]}.doc`;
    saveAs(blob, fileName);
  };

  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'processos':
        return 'Processos';
      case 'alertas':
        return 'Alertas';
      case 'usuarios':
        return 'Usuários';
      case 'financeiro':
        return 'Financeiro';
      default:
        return 'Relatório';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'gerado':
        return 'Gerado';
      case 'processando':
        return 'Processando';
      case 'erro':
        return 'Erro';
      default:
        return 'Pendente';
    }
  };

  return (
    <div className={`relatorio-export ${className}`}>
      <button
        className="relatorio-export-btn relatorio-export-pdf"
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
      >
        {isExporting && exportType === 'pdf' ? (
          <>
            <Loader2 size={16} className="spinning" />
            Exportando PDF...
          </>
        ) : (
          <>
            <FileText size={16} />
            PDF
          </>
        )}
      </button>

      <button
        className="relatorio-export-btn relatorio-export-word"
        onClick={() => handleExport('word')}
        disabled={isExporting}
      >
        {isExporting && exportType === 'word' ? (
          <>
            <Loader2 size={16} className="spinning" />
            Exportando Word...
          </>
        ) : (
          <>
            <BarChart3 size={16} />
            Word
          </>
        )}
      </button>
    </div>
  );
};

export default RelatorioExport;
