import { useState } from 'react';
import { SearchResponse, SearchResult } from '@llm-search/shared';
import SearchBox from './components/SearchBox';
import ResultCard from './components/ResultCard';
import './App.css';

function App() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(searchQuery: string) {
    setQuery(searchQuery);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>LLM Search</h1>
        <p className="subtitle">Semantic search over SEC quarterly filings</p>
      </header>

      <main className="main">
        <SearchBox onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && query && (
          <div className="no-results">
            No results found for "{query}"
          </div>
        )}

        {!loading && !error && results.length === 0 && !query && (
          <div className="examples">
            <p className="examples-title">Try searching for:</p>
            <ul>
              <li>"Apple revenue 2024"</li>
              <li>"Tech company profits"</li>
              <li>"Microsoft MSFT"</li>
              <li>"Tesla liabilities"</li>
            </ul>
          </div>
        )}

        {results.length > 0 && (
          <div className="results">
            <div className="results-header">
              <span className="results-count">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </span>
            </div>
            <div className="results-list">
              {results.map((result, index) => (
                <ResultCard key={index} result={result} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
