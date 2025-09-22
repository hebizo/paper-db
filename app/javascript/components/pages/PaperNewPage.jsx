import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const PaperNewPage = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [memo, setMemo] = useState('');
  const [authorsInput, setAuthorsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState({});
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [pdfError, setPdfError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

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

  const normalizeErrors = (data) => {
    if (!data || typeof data !== 'object') {
      return { base: ['不明なエラーが発生しました'] };
    }
    if (Array.isArray(data)) {
      return { base: data };
    }
    if (data.errors && typeof data.errors === 'object') {
      return data.errors;
    }
    return data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (pdfError) {
      setErrors({ pdf: [pdfError] });
      return;
    }

    const authorsArray = authorsInput.split(/[,、]\s*/).map(name => name.trim()).filter(name => name !== '');
    const tagsArray = tagsInput.split(/[,、]\s*/).map(name => name.trim()).filter(name => name !== '');

    const formData = new FormData();
    formData.append('paper[title]', title || '');
    formData.append('paper[url]', url || '');
    formData.append('paper[memo]', memo || '');

    authorsArray.forEach((name, index) => {
      formData.append(`authors[${index}][name]`, name);
    });
    tagsArray.forEach((name, index) => {
      formData.append(`tags[${index}][name]`, name);
    });

    if (pdfFile) {
      formData.append('pdf_file', pdfFile);
    }

    try {
      const response = await fetch('/api/papers', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/papers/${data.id}`);
        return;
      }

      const errorData = await response.json().catch(() => ({}));
      setErrors(normalizeErrors(errorData));
    } catch (error) {
      console.error('Error in API request', error);
      setErrors({ base: ['通信エラーが発生しました'] });
    }
  };

  return (
    <div className='container my-4'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h2 className='mb-0'>論文を新規登録</h2>
      </div>

      <hr />

      {Object.keys(errors).length > 0 && (
        <div className='alert alert-danger'>
          <ul className='mb-0'>
            {Object.entries(errors).map(([key, messages]) => (
              <li key={key}>
                {key}: {Array.isArray(messages) ? messages.join(', ') : messages}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <div className='mb-3'>
            <label htmlFor='title' className='form-label'><strong>タイトル (必須):</strong></label>
            <input
              type='text'
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='form-control form-control-lg'
              placeholder='論文タイトル'
              required
            />
          </div>
          <div className='mb-3'>
            <label htmlFor='authors' className='form-label'><strong>著者:</strong></label>
            <input
              type='text'
              id='authors'
              value={authorsInput}
              onChange={(e) => setAuthorsInput(e.target.value)}
              className='form-control'
              placeholder='著者名をカンマ区切りで入力'
            />
          </div>
          <div className='mb-3'>
            <label htmlFor='url' className='form-label'><strong>URL:</strong></label>
            <input
              type='url'
              id='url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className='form-control'
              placeholder='論文のURL'
            />
          </div>
          <div className='mb-3'>
            <label htmlFor='tags' className='form-label'><strong>タグ:</strong></label>
            <input
              type='text'
              id='tags'
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className='form-control'
              placeholder='タグをカンマ区切りで入力'
            />
          </div>
          <div className='mb-3'>
            <label className='form-label d-block'><strong>PDF:</strong></label>
            {pdfName && (
              <div className='mb-2 text-muted small'>選択中のファイル: {pdfName}</div>
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

        <div className='card mt-4'>
          <div className='card-body'>
            <h5 className='card-title'>メモ</h5>
            <textarea
              id='memo'
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className='form-control'
              rows='5'
              placeholder='メモを入力（Markdown形式可）'
            />
          </div>
        </div>

        <div className='mt-4 d-flex justify-content-between'>
          <button type='button' onClick={() => navigate('/papers')} className='btn btn-secondary'>
            キャンセル
          </button>
          <button type='submit' className='btn btn-primary'>
            登録する
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaperNewPage;
