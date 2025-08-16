import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function PaperDetailPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editPaper, setEditPaper] = useState(null);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const response = await fetch(`/api/papers/${paperId}`);
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        console.log('data:', data); // オブジェクトのまま出力
        setPaper(data);
      } catch (err) {
        console.error('fetch error:', err); // エラーも出力
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [paperId]); 

  const handleEditClick = () => {
    setEditPaper({
      ...paper,
      authors: paper.authors ? paper.authors.map(author => author.name).join(', ') : '',
      tags: paper.tags ? paper.tags.map(tag => tag.name).join(', ') : ''
    });
    setEditMode(true);
  };

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
      const data = await response.json();
      console.log('data:', data);
      setPaper(data);
      setEditMode(false);
    } catch (err) {
      console.error('update error:', err);
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('本当に削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/papers/${paperId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      navigate('/papers');
    } catch (err) {
      console.error('delete error:', err);
      setError(err.message);
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>エラー: {error}</div>;
  if (!paper) return <div>データがありません</div>;

  if (editMode) {
    return (
      <div>
        <h2>
          <input
            name="title"
            value={editPaper.title}
            onChange={handleChange}
          />
        </h2>
        <div>
          <strong>著者:</strong>
          <input
            name="authors"
            value={editPaper.authors}
            onChange={handleChange}
          />
        </div>
        <div>
          <strong>URL:</strong>
          <input
            name="url"
            value={editPaper.url}
            onChange={handleChange}
          />
        </div>
        <div>
          <strong>タグ:</strong>
          <input
            name="tags"
            value={editPaper.tags}
            onChange={handleChange}
          />
        </div>
        <div>
          <strong>メモ:</strong>
          <textarea
            name="memo"
            value={editPaper.memo}
            onChange={handleChange}
          />
        </div>
        <button onClick={handleSave}>保存</button>
        <button onClick={() => setEditMode(false)}>キャンセル</button>
      </div>
    );
  }
  return (
    <div className='container my-4'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h2 className='mb-0'>{paper.title}</h2>
        <div>
          <button onClick={handleEditClick} className='btn btn-primary'>編集</button>
          <button onClick={handleDelete} className='btn btn-danger mx-1'>削除</button>
          <button onClick={() => navigate('/papers')} className='btn btn-secondary mx-2'>一覧へ戻る</button>
        </div>
      </div>

      <hr />

      {/* --- 論文のメタデータ --- */}
      <div className='mb-3'>
        <p>
          <strong>著者:</strong> {paper.authors && paper.authors.length > 0 
          ? paper.authors.map(author => author.name).join(', ') 
          : 'なし'}
        </p>
        <p>
          <strong>URL:</strong> {paper.url ? (
            <a href={paper.url} target="_blank" rel="noopener noreferrer">{paper.url}</a>
          ) : 'なし'}
        </p>
        <div>
          <strong>タグ:</strong> {paper.tags && paper.tags.length > 0 
          ? paper.tags.map(tag => (
            <span key={tag.name} className='badge bg-secondary me-1'>{tag.name}</span>
          )) : 'なし'}
        </div>
      </div>

      {/* --- 論文のメモ --- */}
      <div className='card mt-4'>
        <div className='card-body'>
          <h5 className='card-title'>メモ</h5>
          <div className='card-text' style={{ whiteSpace: 'pre-wrap' }}>
            {paper.memo || 'なし'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaperDetailPage;