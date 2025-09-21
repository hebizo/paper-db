import { useMemo, useState } from 'react';

function normalise(value) {
  return value?.toLowerCase() ?? '';
}

export function usePaperSearch(papers) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPapers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return papers;
    }

    return papers.filter((paper) => {
      const title = normalise(paper.title);
      const memo = normalise(paper.memo);
      return title.includes(query) || memo.includes(query);
    });
  }, [papers, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredPapers,
  };
}

export default usePaperSearch;
