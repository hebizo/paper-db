import { useMemo, useState } from 'react';

export function usePaperSearch(papers) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPapers = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return papers;
    }

    const tokens = trimmedQuery.split(/\s+/).filter(Boolean);
    let tagFilter = null;
    const textTokens = [];

    tokens.forEach((token) => {
      if (token.startsWith('#') && token.length > 1 && tagFilter === null) {
        tagFilter = token.slice(1);
      } else {
        textTokens.push(token);
      }
    });

    const textQuery = textTokens.join(' ').trim();

    return papers.filter((paper) => {
      if (tagFilter) {
        const tagList = Array.isArray(paper.tags) ? paper.tags : [];
        const hasTag = tagList.some((tag) => tag?.name === tagFilter);
        if (!hasTag) {
          return false;
        }
      }

      if (textQuery) {
        const title = paper.title ?? '';
        const memo = paper.memo ?? '';
        const matchesText = (typeof title === 'string' && title.includes(textQuery))
          || (typeof memo === 'string' && memo.includes(textQuery));

        if (!matchesText) {
          return false;
        }
      }

      return true;
    });
  }, [papers, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredPapers,
  };
}

export default usePaperSearch;
