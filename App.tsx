import React, { useState, useEffect } from 'react';
import { fetchGodrejProjects, getAnalysis } from './services/geminiService';
import { Project, GroundingMetadata, NotificationMessage } from './types';
import ProjectsTable from './components/ProjectsTable';
import Spinner from './components/Spinner';
import AnalysisPanel from './components/AnalysisPanel';
import Notification from './components/Notification';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [groundingMetadata, setGroundingMetadata] = useState<GroundingMetadata | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (geoError) => {
        console.error("Geolocation error:", geoError);
        setError("Could not get your location. Please enable location services. Using Mumbai as a default location.");
        setLocation({ latitude: 19.0760, longitude: 72.8777 }); // Mumbai
      }
    );
  }, []);

  const handleSearch = async () => {
    if (!location) {
        setError("Location is not available yet. Please wait or enable location services.");
        return;
    }

    setLoading(true);
    setError(null);
    setProjects([]);
    setAnalysis('');
    setGroundingMetadata(null);
    setNotifications([]);

    try {
      const { projects: fetchedProjects, groundingMetadata: fetchedMetadata } = await fetchGodrejProjects(location);
      setProjects(fetchedProjects);
      setGroundingMetadata(fetchedMetadata);

      const lowRatedProjects = fetchedProjects.filter(p => p.rating < 3.5);
      lowRatedProjects.forEach(p => {
        addNotification(`'${p.projectName}' has a low rating of ${p.rating.toFixed(1)}.`);
      });

      if (fetchedProjects.length > 0) {
        setAnalysis(''); 
        const analysisResult = await getAnalysis(fetchedProjects);
        setAnalysis(analysisResult);
      } else {
        setAnalysis("No projects found to analyze.");
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setAnalysis('');
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, { id: Date.now(), message }]);
  }

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <header className="bg-gradient-to-r from-sky-500 to-indigo-600 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Godrej Properties Insights
            </h1>
            <p className="mt-2 text-sky-100 max-w-2xl mx-auto">
              AI-Powered Analysis of Mumbai Projects via Google Maps
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto bg-slate-800/50 p-6 rounded-xl shadow-2xl backdrop-blur-sm">
          <button
            onClick={handleSearch}
            disabled={loading || !location}
            className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 transition duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
                <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Fetching...</span>
                </>
            ) : 'Fetch Godrej Projects'}
          </button>
          {!location && <p className="text-center text-sm text-slate-400 mt-2">Initializing location services...</p>}
        </div>

        {error && <div className="max-w-3xl mx-auto mt-4 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-center">{error}</div>}
        
        <div className="mt-12">
            {loading ? <Spinner /> : <ProjectsTable projects={projects} groundingMetadata={groundingMetadata} />}
        </div>
        
        {(!loading && projects.length > 0) && <AnalysisPanel analysis={analysis} loading={!analysis} />}

      </main>
      
      <div className="fixed top-5 right-5 z-50 space-y-4 w-full max-w-sm">
        {notifications.map(n => (
          <Notification key={n.id} message={n.message} onClose={() => removeNotification(n.id)} />
        ))}
      </div>
    </div>
  );
}

export default App;