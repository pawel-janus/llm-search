import { useState, FormEvent } from 'react';
import './SearchBox.css';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

function SearchBox({ onSearch, loading }: SearchBoxProps) {
  const [input, setInput] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (input.trim().length >= 3) {
      onSearch(input.trim());
    }
  }

  return (
    <form onSubmit={handleSubmit} className="search-box">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search filings... (e.g., 'Apple revenue 2024')"
        className="search-input"
        disabled={loading}
      />
      <button
        type="submit"
        className="search-button"
        disabled={loading || input.trim().length < 3}
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
      {input.trim().length > 0 && input.trim().length < 3 && (
        <span className="search-hint">Query must be at least 3 characters</span>
      )}
    </form>
  );
}

export default SearchBox;
