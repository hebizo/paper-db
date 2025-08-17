import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

function PaperDetailPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const response = await fetch(`/api/papers/${paperId}`);
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        setPaper(data);
      } catch (err) {
        console.error('fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [paperId]);

  const handleDelete = async () => {
    if (!window.confirm('この論文を削除してよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/papers/${paperId}`, {
        method: 'DELETE',
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

  return (
    <div className='container my-4'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h1>{paper.title}</h1>
        <div>
          <button onClick={() => navigate(`/papers/${paperId}/edit`)} className='btn btn-primary'>編集</button>
          <button onClick={handleDelete} className='btn btn-danger mx-1'>削除</button>
          <button onClick={() => navigate('/papers')} className='btn btn-secondary mx-1'>一覧に戻る</button>
        </div>
      </div>

      <hr />

      {/* --- 論文のメタデータ表示 --- */}
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

      {/* --- 論文のメモ表示（Markdown対応） --- */}
      <div className='card mt-4'>
        <div className='card-body'>
          <h5 className='card-title'>メモ</h5>
          <div className='markdown-body'>
            <ReactMarkdown>{paper.memo || ''}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaperDetailPage;