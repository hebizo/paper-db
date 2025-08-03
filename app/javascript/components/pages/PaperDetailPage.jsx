import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function PaperDetailPage() {
  const { paperId } = useParams();
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

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>エラー: {error}</div>;
  if (!paper) return <div>データがありません</div>;

  return (
    <div>
      <h2>{paper.title}</h2>
      <div>
        <strong>著者:</strong> {paper.authors && paper.authors.length > 0 
          ? paper.authors.map(author => author.name).join(', ') 
          : 'なし'}
      </div>
      <div>
        <strong>URL:</strong> {paper.url ? (
          <a href={paper.url} target="_blank" rel="noopener noreferrer">{paper.url}</a>
        ) : 'なし'}
      </div>
      <div>
        <strong>タグ:</strong> {paper.tags && paper.tags.length > 0 
          ? paper.tags.map(tag => tag.name).join(', ') 
          : 'なし'}
      </div>
      <div>
        <strong>メモ:</strong>
        <div style={{ whiteSpace: 'pre-wrap' }}>{paper.memo || 'なし'}</div>
      </div>
    </div>
  );
}

export default PaperDetailPage;