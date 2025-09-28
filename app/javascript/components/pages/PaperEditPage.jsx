import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const extractErrorMessage = (payload) => {
  if (!payload) {
    return '';
  }
  if (Array.isArray(payload)) {
    return payload.join(', ');
  }
  if (typeof payload === 'object') {
    const source = payload.errors && typeof payload.errors === 'object' ? payload.errors : payload;
    return Object.values(source)
      .flatMap((value) => {
        if (Array.isArray(value)) {
          return value;
        }
        if (value && typeof value === 'object') {
          return Object.values(value);
        }
        return [String(value)];
      })
      .filter(Boolean)
      .join(', ');
  }
  return String(payload);
};

function PaperEditPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editPaper, setEditPaper] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [pdfError, setPdfError] = useState(null);
  const [removeExistingPdf, setRemoveExistingPdf] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const response = await fetch(`/api/papers/${paperId}`);
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        setPaper(data);
        setEditPaper({
          ...data,
          authors: data.authors ? data.authors.map(author => author?.name || '').filter(Boolean).join(', ') : '',
          tags: data.tags ? data.tags.map(tag => tag?.name || '').filter(Boolean).join(', ') : ''
        });
        setPdfFile(null);
        setPdfName(data.pdf?.filename || '');
        setPdfError(null);
        setRemoveExistingPdf(false);
      } catch (err) {
        console.error('fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [paperId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditPaper({
      ...editPaper,
      [name]: value
    });
  };

  const handleFileSelection = (file) => {
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setPdfError('PDFファイルのみアップロードできます');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setPdfError('ファイルは100MB以下にしてください');
      return;
    }

    setPdfError(null);
    setPdfFile(file);
    setPdfName(file.name);
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files && event.target.files[0];
    handleFileSelection(file);
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemovePdf = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPdfError(null);

    if (pdfFile) {
      setPdfFile(null);
      setPdfName(removeExistingPdf ? '' : (paper?.pdf?.filename || ''));
      return;
    }

    if (paper?.pdf && !removeExistingPdf) {
      setPdfFile(null);
      setPdfName('');
      setRemoveExistingPdf(true);
      return;
    }

    setPdfFile(null);
    setPdfName('');
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);

    const file = event.dataTransfer?.files && event.dataTransfer.files[0];
    handleFileSelection(file);
  };

  const handleSave = async () => {
    if (!editPaper) return;
    if (pdfError) {
      setError(pdfError);
      return;
    }

    setError(null);

    const authorsArray = editPaper.authors
      ? editPaper.authors.split(/[,、]\s*/).map(name => name.trim()).filter(Boolean)
      : [];
    const tagsArray = editPaper.tags
      ? editPaper.tags.split(/[,、]\s*/).map(name => name.trim()).filter(Boolean)
      : [];

    const formData = new FormData();
    formData.append('paper[title]', editPaper.title || '');
    formData.append('paper[url]', editPaper.url || '');
    formData.append('paper[memo]', editPaper.memo || '');

    authorsArray.forEach((name, index) => {
      formData.append(`authors[${index}][name]`, name);
    });
    tagsArray.forEach((name, index) => {
      formData.append(`tags[${index}][name]`, name);
    });

    if (pdfFile) {
      formData.append('pdf_file', pdfFile);
    }

    if (removeExistingPdf) {
      formData.append('remove_pdf', '1');
    }

    try {
      const response = await fetch(`/api/papers/${paperId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = extractErrorMessage(errorData) || '更新に失敗しました';
        throw new Error(message);
      }

      navigate(`/papers/${paperId}`);
    } catch (err) {
      console.error('update error:', err);
      setError(err.message);
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>エラー: {error}</div>;
  if (!paper || !editPaper) return <div>データがありません</div>;

  return (
    <div className='container my-4'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <input
          name="title"
          value={editPaper.title}
          onChange={handleChange}
          className='form-control form-control-lg w-75'
          placeholder='論文タイトル'
        />
        <div>
          <button onClick={handleSave} className='btn btn-primary mx-1'>保存</button>
          <button onClick={() => navigate(`/papers/${paperId}`)} className='btn btn-secondary'>キャンセル</button>
        </div>
      </div>

      <hr />

      <div className='mb-3'>
        <div className='mb-3'>
          <label className='form-label'><strong>著者:</strong></label>
          <input
            name="authors"
            value={editPaper.authors}
            onChange={handleChange}
            className='form-control'
            placeholder='著者名をカンマ区切りで入力'
          />
        </div>
        <div className='mb-3'>
          <label className='form-label'><strong>URL:</strong></label>
          <input
            name="url"
            value={editPaper.url}
            onChange={handleChange}
            className='form-control'
            placeholder='論文のURL'
            type="url"
          />
        </div>
        <div className='mb-3'>
          <label className='form-label'><strong>タグ:</strong></label>
          <input
            name="tags"
            value={editPaper.tags}
            onChange={handleChange}
            className='form-control'
            placeholder='タグをカンマ区切りで入力'
          />
        </div>
        <div className='mb-3'>
          <label className='form-label d-block'><strong>PDF:</strong></label>
          {pdfName && (
            <div className='mb-2 text-muted small d-flex align-items-center'>
              <span>
                {pdfFile ? '選択中のファイル: ' : '保存済みのファイル: '}
                {pdfName}
              </span>
              <button
                type='button'
                className='btn btn-link btn-sm text-danger p-0 ms-2'
                onClick={handleRemovePdf}
                aria-label='PDFを削除'
              >
                &times;
              </button>
            </div>
          )}
          <div
            className={`border rounded p-4 text-center ${isDragActive ? 'bg-light border-primary' : 'bg-white'}`}
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role='button'
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (fileInputRef.current) fileInputRef.current.click();
              }
            }}
          >
            <p className='mb-3'>ここにPDFファイルをドラッグ&ドロップ</p>
            <button
              type='button'
              className='btn btn-outline-primary'
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              ファイルを選択
            </button>
            <input
              type='file'
              accept='application/pdf'
              ref={fileInputRef}
              className='d-none'
              onChange={handleFileInputChange}
            />
          </div>
          {pdfError && <div className='text-danger small mt-2'>{pdfError}</div>}
        </div>
      </div>

      <div className='row mt-4'>
        <div className='col-md-6 mb-3'>
          <h5 className='card-title'>メモ（Markdown）</h5>
          <textarea
            name="memo"
            value={editPaper.memo}
            onChange={handleChange}
            className='form-control h-100'
            placeholder='Markdown形式でメモを入力'
            style={{ minHeight: '180px' }}
          />
        </div>
        <div className='col-md-6 mb-3'>
          <h5 className='card-title'>プレビュー</h5>
          <div className='card card-body h-100' style={{ minHeight: '180px', background: '#f8f9fa' }}>
            <ReactMarkdown>{editPaper.memo || ''}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaperEditPage;
