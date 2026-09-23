import { SearchResult } from '@llm-search/shared';
import './ResultCard.css';

interface ResultCardProps {
  result: SearchResult;
}

function ResultCard({ result }: ResultCardProps) {
  const formatValue = (value: number): string => {
    const billion = value / 1e9;
    return `$${billion.toFixed(1)}B`;
  };

  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 0.8) return '#4caf50'; // green
    if (similarity >= 0.6) return '#ff9800'; // orange
    return '#9e9e9e'; // gray
  };

  const similarityPercent = Math.round(result.similarity * 100);

  return (
    <div className="result-card">
      <div className="result-header">
        <div className="result-company">
          <span className="result-ticker">{result.ticker}</span>
          <span className="result-name">{result.name}</span>
        </div>
        <div
          className="result-similarity"
          style={{ color: getSimilarityColor(result.similarity) }}
        >
          {similarityPercent}% match
        </div>
      </div>

      <div className="result-content">
        <div className="result-metric">
          <span className="result-tag">{result.tag}:</span>
          <span className="result-value">{formatValue(result.value)}</span>
        </div>
        <div className="result-meta">
          <span className="result-period">{result.period}</span>
          <span className="result-date">Filed: {result.filing_date}</span>
        </div>
      </div>
    </div>
  );
}

export default ResultCard;
