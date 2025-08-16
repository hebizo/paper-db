import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaperNewPage = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [memo, setMemo] = useState('');
  const [authorsInput, setAuthorsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // TODO: create array for authors and tags
    const authorsArray = authorsInput.split(',').map(name => name.trim()).filter(name => name !== '');
    const tagsArray = tagsInput.split(',').map(name => name.trim()).filter(name => name !== '');

    const paperData = {
      paper: { title, url, memo },
      authors: authorsArray,
      tags: tagsArray,
    };

    try {
      const response = await fetch('/api/papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paperData),
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/papers/${data.id}`);
      } else {
        const errorData = await response.json();
        setErrors(errorData.errors || {});
        console.error('Failed recording new paper', errorData);
      }
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

      {/* エラーメッセージ表示 */}
      {Object.keys(errors).length > 0 && (
        <div className="alert alert-danger">
          <ul className="mb-0">
            {Object.entries(errors).map(([key, messages]) => (
              <li key={key}>
                {key}: {messages.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* --- 論文のメタデータ入力 --- */}
        <div className='mb-3'>
          <div className='mb-3'>
            <label htmlFor="title" className='form-label'><strong>タイトル (必須):</strong></label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='form-control form-control-lg'
              placeholder='論文タイトル'
              required
            />
          </div>
          <div className='mb-3'>
            <label htmlFor="authors" className='form-label'><strong>著者:</strong></label>
            <input
              type="text"
              id="authors"
              value={authorsInput}
              onChange={(e) => setAuthorsInput(e.target.value)}
              className='form-control'
              placeholder='著者名をカンマ区切りで入力'
            />
          </div>
          <div className='mb-3'>
            <label htmlFor="url" className='form-label'><strong>URL:</strong></label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className='form-control'
              placeholder='論文のURL'
            />
          </div>
          <div className='mb-3'>
            <label htmlFor="tags" className='form-label'><strong>タグ:</strong></label>
            <input
              type="text"
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className='form-control'
              placeholder='タグをカンマ区切りで入力'
            />
          </div>
        </div>

        {/* --- 論文のメモ入力 --- */}
        <div className='card mt-4'>
          <div className='card-body'>
            <h5 className='card-title'>メモ</h5>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className='form-control'
              rows="5"
              placeholder='メモを入力（Markdown形式可）'
            />
          </div>
        </div>

        {/* --- ボタン --- */}
        <div className='mt-4 d-flex justify-content-between'>
          <button type="button" onClick={() => navigate('/papers')} className='btn btn-secondary'>
            キャンセル
          </button>
          <button type="submit" className='btn btn-primary'>
            登録する
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaperNewPage;