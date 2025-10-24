import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePaperSearch from '../hooks/usePaperSearch';

const cardHoverStyle = `
  .paper-card {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    cursor: pointer;
  }
  .paper-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .card-link {
    text-decoration: none;
    color: inherit;
  }
  .paper-tag-container {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }
  .paper-tag {
    background-color: #6c757d;
    color: #ffffff;
    border-radius: 9999px;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    min-width: 0;
  }
  .paper-tag--single {
    max-width: 100%;
  }
  .paper-tag--double {
    max-width: calc(50% - 0.25rem);
  }
`;

function PaperListPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const { searchQuery, setSearchQuery, filteredPapers } = usePaperSearch(papers);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>エラー: {error}</div>;
  if (papers.length === 0) return <div>登録された論文はありません</div>;

  return (
    <div className='container my-4'>
      <style>{cardHoverStyle}</style>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h2 className='mb-0'>論文一覧</h2>
        <button className='btn btn-primary d-flex align-items-center gap-2' onClick={() => navigate('/papers/new')}>
          <span>+</span>
          <span>新規登録</span>
        </button>
      </div>

      <div className='mb-4'>
        <input
          type='search'
          className='form-control'
          placeholder='検索'
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      {/* --- 論文カード一覧 --- */}
      {filteredPapers.length === 0 ? (
        <div>条件に一致する論文は見つかりませんでした</div>
      ) : (
        <div className='row g-4'>
          {filteredPapers.map(paper => {
            const displayedTags = Array.isArray(paper.tags) ? paper.tags.slice(0, 2) : [];
            const hasTags = displayedTags.length > 0;
            return (
              <div key={paper.id} className='col-lg-3 col-md-4 col-sm-6'>
                <Link to={`/papers/${paper.id}`} className='card-link'>
                  <div className='card paper-card h-100'>
                    <div
                      className='card-body d-flex flex-column align-items-start'
                      style={{ minHeight: '8rem', maxHeight: '8rem' }}
                    >
                      <h5
                        className='card-title mb-0'
                        style={{
                          fontSize: '1rem',
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                        }}
                      >
                        {paper.title}
                      </h5>
                      {hasTags && (
                        <div
                          className='paper-tag-container'
                          style={{ marginTop: 'auto', paddingTop: '0.75rem' }}
                        >
                          {displayedTags.map((tag, index) => {
                            const tagLabel = typeof tag === 'string' ? tag : tag?.name || '';
                            if (!tagLabel) return null;
                            const key = typeof tag === 'object' && tag !== null && 'id' in tag
                              ? `tag-${tag.id}`
                              : `tag-${tagLabel}-${index}`;
                            return (
                              <span
                                key={key}
                                className={`paper-tag ${
                                  displayedTags.length === 1 ? 'paper-tag--single' : 'paper-tag--double'
                                }`}
                                title={tagLabel}
                              >
                                {tagLabel}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PaperListPage;
