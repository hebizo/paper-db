import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'paperSearchQuery';

export function usePaperSearch(papers) {
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    try {
      return window.localStorage.getItem(STORAGE_KEY) ?? '';
    } catch (err) {
      console.warn('Failed to read stored search query', err);
      return '';
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, searchQuery);
    } catch (err) {
      console.warn('Failed to persist search query', err);
    }
  }, [searchQuery]);

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
        const matchesText = textFilters.every((textFilter) => {
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
