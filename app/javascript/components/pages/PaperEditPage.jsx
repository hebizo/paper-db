import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

function PaperEditPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editPaper, setEditPaper] = useState(null);

  // 論文データの取得
  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const response = await fetch(`/api/papers/${paperId}`);
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        setPaper(data);
        // 編集用のデータを初期化
        setEditPaper({
          ...data,
          authors: data.authors ? data.authors.map(author => author.name).join(', ') : '',
          tags: data.tags ? data.tags.map(tag => tag.name).join(', ') : ''
        });
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

  const handleSave = async () => {
    const updatedData = {
      paper: {
        title: editPaper.title,
        url: editPaper.url,
        memo: editPaper.memo,
      },
      authors: editPaper.authors.split(/[,、]\s*/).map(name => ({ name: name.trim() })).filter(Boolean),
      tags: editPaper.tags.split(/[,、]\s*/).map(name => ({ name: name.trim() })).filter(Boolean),
    };

    try {
      const response = await fetch(`/api/papers/${paperId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('更新に失敗しました');
      }
      
      // 保存成功後、詳細画面に戻る
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

      {/* --- 論文のメタデータ編集 --- */}
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
      </div>

      {/* --- 論文のメモ編集（Markdown対応） --- */}
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