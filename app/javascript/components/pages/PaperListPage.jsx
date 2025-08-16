import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function PaperListPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await fetch('/api/papers');
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        console.log('papers:', data);
        setPapers(data);
      } catch (err) {
        console.error('fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>エラー: {error}</div>;
  if (papers.length === 0) return <div>登録された論文はありません</div>;

  return (
    <div>
      <h2>論文一覧</h2>
      <ul>
        {papers.map(paper => (
          <li key={paper.id}>
            <Link to={`/papers/${paper.id}`}>{paper.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PaperListPage;