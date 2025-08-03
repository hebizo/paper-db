import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaperNewPage = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [memo, setMemo] = useState('');
  const [authorsInput, setAuthorsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // TODO: create array for authors and tags
    const authorsArray = authorsInput.split(',').map(name => name.trim()).filter(name => name !== '');
    const tagsArray = tagsInput.split(',').map(name => name.trim()).filter(name => name !== '');

    const paperData = {
      paper: { title, url, memo },
      authors: authorsArray,
      tags: tagsArray,
    };

    try {
      const response = await fetch('/api/papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paperData),
      });

      if (response.ok) {
        // case: success
        // Redirect to the detail page of the newly created paper
        console.log('Recoded new paper successfully');
        const data = await response.json();
        navigate(`/papers/${data.id}`);
      } else {
        const errorData = await response.json();
        setErrors(errorData.errors || {});
        console.error('Failed recoding new paper', errorData);
      }
    } catch (error) {
      console.error('Error in API request', error);
    }
  };

  return (
    <div>
      <h2>論文を新規登録</h2>
      {Object.keys(errors).length > 0 && (
        <div style={{ color: 'red' }}>
          <ul>
            {Object.entries(errors).map(([key, messages]) => (
              <li key={key}>
                {key}: {messages.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">タイトル (必須):</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="url">URL:</label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="authors">著者 (カンマ区切り):</label>
          <input
            type="text"
            id="authors"
            value={authorsInput}
            onChange={(e) => setAuthorsInput(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="tags">タグ (カンマ区切り):</label>
          <input
            type="text"
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="memo">メモ (MD形式):</label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          ></textarea>
        </div>
        <button type="submit">登録する</button>
      </form>
    </div>
  );
};

export default PaperNewPage;