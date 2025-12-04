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
    // FIX: Updated styling to match the application's dark theme.
    <div className="bg-slate-800/50 rounded-lg shadow-lg p-6 mt-12 ring-1 ring-white/10">
      <h2 className="text-2xl font-bold text-sky-300 mb-4">AI-Powered Analysis</h2>
      {loading ? (
        <div className="text-center text-slate-400">
            <p>Analyzing data...</p>
        </div>
      ) : (
        <div 
          className="text-slate-300 space-y-3" 
          dangerouslySetInnerHTML={{ __html: basicMarkdownToHtml(analysis) }} 
        />
      )}
    </div>
  );
};

export default AnalysisPanel;