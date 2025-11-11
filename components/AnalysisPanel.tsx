import React from 'react';
// A simple markdown-to-html converter. For a real app, a library like 'marked' would be better.
const basicMarkdownToHtml = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n/g, '<br />'); // Newlines
};

interface AnalysisPanelProps {
  analysis: string;
  loading: boolean;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">AI-Powered Analysis</h2>
      {loading ? (
        <div className="text-center text-gray-500">
            <p>Analyzing data...</p>
        </div>
      ) : (
        <div 
          className="text-gray-700 space-y-3 prose" 
          dangerouslySetInnerHTML={{ __html: basicMarkdownToHtml(analysis) }} 
        />
      )}
    </div>
  );
};

export default AnalysisPanel;
