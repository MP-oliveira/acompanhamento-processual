import React, { useState, useEffect } from 'react';
import {
  Upload,
  File,
  FileText,
  Image as ImageIcon,
  Trash2,
  Download,
  Eye,
  X,
  AlertCircle,
  Check
} from 'lucide-react';
import { documentoService } from '../../services/api';
import { supabase } from '../../config/supabase';
import './UploadDocumentos.css';

const UploadDocumentos = ({ processoId }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (processoId) {
      carregarDocumentos();
    }
  }, [processoId]);

  const carregarDocumentos = async () => {
    try {
      setLoading(true);
      const data = await documentoService.getAll(processoId);
      // A API pode retornar array direto ou objeto com propriedade documentos
      const docs = Array.isArray(data) ? data : (data.documentos || []);
      setDocumentos(docs);
    } catch (err) {
      console.error('Erro ao carregar documentos:', err);
      setError('Erro ao carregar documentos');
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleUpload(files);
    }
  };

  const handleFileInput = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleUpload(files);
    }
  };

  const handleUpload = async (files) => {
    try {
      setUploading(true);
      setError(null);

      for (const file of files) {
        // Validação de tamanho (10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`Arquivo ${file.name} é muito grande (máx 10MB)`);
          continue;
        }

        // Validação de tipo
        const tiposPermitidos = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!tiposPermitidos.includes(file.type)) {
          setError(`Tipo de arquivo não permitido: ${file.name}`);
          continue;
        }

        // Upload para Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `processos/${processoId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          setError(`Erro ao fazer upload de ${file.name}`);
          continue;
        }

        // Obter URL pública
        const { data: urlData } = supabase.storage
          .from('documentos')
          .getPublicUrl(filePath);

        // Salvar no banco via API
        await documentoService.create(processoId, {
          nome: file.name,
          url: urlData.publicUrl,
          tipo: file.type,
          tamanho: file.size
        });
      }

      // Recarregar lista de documentos
      await carregarDocumentos();
    } catch (err) {
      console.error('Erro no upload:', err);
      setError('Erro ao fazer upload dos documentos');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documento) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${documento.nome}?`)) {
      return;
    }

    try {
      // Extrair caminho do arquivo da URL
      const url = new URL(documento.url);
      const filePath = url.pathname.split('/documentos/')[1];

      // Deletar do Supabase Storage
      await supabase.storage
        .from('documentos')
        .remove([filePath]);

      // Deletar do banco via API
      await documentoService.delete(documento.id);

      // Atualizar lista
      await carregarDocumentos();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      setError('Erro ao excluir documento');
    }
  };

  const handleDownload = (documento) => {
    window.open(documento.url, '_blank');
  };

  const handlePreview = (documento) => {
    setPreviewDoc(documento);
  };

  const getFileIcon = (tipo) => {
    if (tipo?.includes('pdf')) return <FileText size={20} className="file-icon-pdf" />;
    if (tipo?.includes('image')) return <ImageIcon size={20} className="file-icon-image" />;
    return <File size={20} className="file-icon-default" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="upload-documentos">
      <div className="upload-header">
        <h3>
          <FileText size={20} />
          Documentos do Processo
        </h3>
        <span className="documentos-count">{documentos.length}</span>
      </div>

      {/* Área de Upload */}
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileInput}
          className="upload-input"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        <label htmlFor="file-upload" className="upload-label">
          {uploading ? (
            <>
              <div className="upload-spinner" />
              <span>Fazendo upload...</span>
            </>
          ) : (
            <>
              <Upload size={32} />
              <span className="upload-text-primary">
                Arraste arquivos aqui ou clique para selecionar
              </span>
              <span className="upload-text-secondary">
                PDF, JPG, PNG, DOC (máx 10MB)
              </span>
            </>
          )}
        </label>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="upload-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Lista de documentos */}
      {loading ? (
        <div className="upload-loading">Carregando documentos...</div>
      ) : documentos.length === 0 ? (
        <div className="upload-empty">
          <FileText size={32} />
          <p>Nenhum documento anexado</p>
        </div>
      ) : (
        <div className="documentos-list">
          {documentos.map((doc) => (
            <div key={doc.id} className="documento-item">
              <div className="documento-icon">
                {getFileIcon(doc.tipo)}
              </div>
              <div className="documento-info">
                <div className="documento-nome">{doc.nome}</div>
                <div className="documento-meta">
                  <span>{formatFileSize(doc.tamanho)}</span>
                  <span>•</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <div className="documento-actions">
                {doc.tipo?.includes('pdf') || doc.tipo?.includes('image') ? (
                  <button
                    className="btn-icon-sm"
                    onClick={() => handlePreview(doc)}
                    title="Visualizar"
                  >
                    <Eye size={16} />
                  </button>
                ) : null}
                <button
                  className="btn-icon-sm"
                  onClick={() => handleDownload(doc)}
                  title="Baixar"
                >
                  <Download size={16} />
                </button>
                <button
                  className="btn-icon-sm btn-danger"
                  onClick={() => handleDelete(doc)}
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Preview */}
      {previewDoc && (
        <div className="preview-modal" onClick={() => setPreviewDoc(null)}>
          <div className="preview-container" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>{previewDoc.nome}</h3>
              <button
                className="preview-close"
                onClick={() => setPreviewDoc(null)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="preview-content">
              {previewDoc.tipo?.includes('image') ? (
                <img src={previewDoc.url} alt={previewDoc.nome} />
              ) : previewDoc.tipo?.includes('pdf') ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.nome}
                  width="100%"
                  height="100%"
                />
              ) : (
                <div className="preview-unsupported">
                  <FileText size={64} />
                  <p>Preview não disponível para este tipo de arquivo</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDownload(previewDoc)}
                  >
                    <Download size={20} />
                    Baixar Arquivo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocumentos;

