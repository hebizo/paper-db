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
    const textFilters = [];

    tokens.forEach((token) => {
      if (token.startsWith('#') && token.length > 1) {
        const tagName = token.slice(1);
        if (!tagFilters.includes(tagName)) {
          tagFilters.push(tagName);
        }
      } else {
        textFilters.push(token);
      }
    });

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

      if (textFilters.length > 0) {
        const title = paper.title ?? '';
        const memo = paper.memo ?? '';
        const matchesText = textFilters.some((textFilter) => {
          const matchesTitle = typeof title === 'string' && title.includes(textFilter);
          const matchesMemo = typeof memo === 'string' && memo.includes(textFilter);
          return matchesTitle || matchesMemo;
        });

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
