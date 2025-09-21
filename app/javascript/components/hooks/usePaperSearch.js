import { useMemo, useState } from 'react';

export function usePaperSearch(papers) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPapers = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return papers;
    }

    const tokens = trimmedQuery.split(/\s+/).filter(Boolean);
    const tagFilters = [];
    const textTokens = [];

    tokens.forEach((token) => {
      if (token.startsWith('#') && token.length > 1) {
        const tagName = token.slice(1);
        if (!tagFilters.includes(tagName)) {
          tagFilters.push(tagName);
        }
      } else {
        textTokens.push(token);
      }
    });

    const textQuery = textTokens.join(' ').trim();

    return papers.filter((paper) => {
      if (tagFilters.length > 0) {
        const tagList = Array.isArray(paper.tags) ? paper.tags : [];
        const tagNames = tagList
          .map((tag) => (tag ? tag.name : null))
          .filter((name) => typeof name === 'string');
        const hasAllTags = tagFilters.every((tagFilter) => tagNames.includes(tagFilter));
        if (!hasAllTags) {
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
