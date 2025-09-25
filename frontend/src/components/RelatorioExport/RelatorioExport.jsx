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
    // Função simples para download sem dependências externas
    
    const htmlContent = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <meta name="ProgId" content="Word.Document">
  <meta name="Generator" content="Microsoft Word 15">
  <meta name="Originator" content="Microsoft Word 15">
  <title>${relatorio.titulo}</title>
  <!--[if gte mso 9]><xml>
    <o:DocumentProperties>
      <o:Author>JurisAcompanha</o:Author>
      <o:Title>${relatorio.titulo}</o:Title>
      <o:Subject>Relatório ${getTipoText(relatorio.tipo)}</o:Subject>
      <o:Created>${new Date().toISOString()}</o:Created>
    </o:DocumentProperties>
  </xml><![endif]-->
  <style>
    @page Section1 { 
      size: 595.3pt 841.9pt; 
      margin: 72.0pt 72.0pt 72.0pt 72.0pt; 
    }
    div.Section1 { page: Section1; }
    body { 
      font-family: 'Calibri', sans-serif; 
      font-size: 11pt; 
      line-height: 1.4; 
      margin: 0; 
      padding: 0; 
    }
    h1 { 
      font-size: 18pt; 
      font-weight: bold; 
      color: #2c3e50; 
      border-bottom: 2pt solid #3498db; 
      padding-bottom: 8pt; 
      margin-bottom: 16pt; 
      text-align: center;
    }
    h2 { 
      font-size: 14pt; 
      font-weight: bold; 
      color: #34495e; 
      margin-top: 24pt; 
      margin-bottom: 12pt; 
    }
    table { 
      border-collapse: collapse; 
      width: 100%; 
      margin: 12pt 0; 
    }
    th, td { 
      border: 1pt solid #ddd; 
      padding: 6pt 8pt; 
      text-align: left; 
      vertical-align: top;
    }
    th { 
      background-color: #f8f9fa; 
      font-weight: bold; 
    }
    .growth-positive { 
      color: #27ae60; 
      font-weight: bold; 
    }
    .growth-negative { 
      color: #e74c3c; 
      font-weight: bold; 
    }
    .footer { 
      margin-top: 32pt; 
      padding-top: 16pt; 
      border-top: 1pt solid #eee; 
      font-size: 9pt; 
      color: #666; 
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <h1>RELATÓRIO ${getTipoText(relatorio.tipo).toUpperCase()}</h1>
    
    <p style="text-align: center; margin-bottom: 24pt;">
      <strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
    </p>
    
    <h2>Informações do Relatório</h2>
    <table>
      <tr><th>Título</th><td>${relatorio.titulo}</td></tr>
      <tr><th>Tipo</th><td>${getTipoText(relatorio.tipo)}</td></tr>
      <tr><th>Período</th><td>${relatorio.periodo}</td></tr>
      <tr><th>Status</th><td>${getStatusText(relatorio.status)}</td></tr>
      ${relatorio.descricao ? `<tr><th>Descrição</th><td>${relatorio.descricao}</td></tr>` : ''}
    </table>
    
    ${relatorio.dados ? `
    <h2>Principais Indicadores</h2>
    <table>
      <thead>
        <tr>
          <th>Indicador</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(relatorio.dados)
          .filter(([key]) => key !== 'crescimento')
          .map(([key, value]) => `
            <tr>
              <td>${key.charAt(0).toUpperCase() + key.slice(1)}</td>
              <td>${value}</td>
            </tr>
          `).join('')}
      </tbody>
    </table>
    
    ${relatorio.dados.crescimento !== undefined ? `
    <p><strong>Variação em relação ao período anterior:</strong> 
      <span class="${relatorio.dados.crescimento > 0 ? 'growth-positive' : 'growth-negative'}">
        ${relatorio.dados.crescimento > 0 ? '+' : ''}${relatorio.dados.crescimento}%
      </span>
    </p>
    ` : ''}
    ` : ''}
    
    <div class="footer">
      <p><strong>Sistema JurisAcompanha</strong><br>
      Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}<br>
      Este documento contém informações confidenciais e está sujeito ao sigilo profissional.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Adicionar BOM (Byte Order Mark) para UTF-8 e tipo MIME correto
    const blob = new Blob(['\ufeff', htmlContent], { 
      type: 'application/msword;charset=utf-8' 
    });
    
    const fileName = `relatorio_${relatorio.tipo}_${relatorio.periodo?.replace('-', '_') || 'atual'}_${new Date().toISOString().split('T')[0]}.doc`;
    
    try {
      saveAs(blob, fileName);
    } catch (error) {
      // Fallback manual para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'processos':
        return 'Processos';
      case 'prazos':
        return 'Prazos';
      case 'alertas':
        return 'Alertas';
      case 'consultas':
        return 'Consultas';
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
      case 'concluido':
        return 'Concluído';
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
