import React, { useState, useEffect, useCallback } from 'react';
import { fetchGodrejProjects, analyzeProjectData } from './services/geminiService';
import { Project, GroundingMetadata, NotificationMessage } from './types';
import ProjectsTable from './components/ProjectsTable';
import Spinner from './components/Spinner';
import AnalysisPanel from './components/AnalysisPanel';
import Notification from './components/Notification';

type LocationPermissionStatus = 'prompt' | 'granted' | 'denied';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [groundingMetadata, setGroundingMetadata] = useState<GroundingMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<LocationPermissionStatus>('prompt');
  const [analysis, setAnalysis] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState<string>(thirtyDaysAgo);
  const [endDate, setEndDate] = useState<string>(today);
  const [currentCoords, setCurrentCoords] = useState<{lat: number, lon: number} | null>(null);

  const getProjects = useCallback(async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);
    setProjects([]);
    setAnalysis('');
    setNotifications([]);

    try {
      const { projects: fetchedProjects, groundingMetadata: fetchedMetadata } = await fetchGodrejProjects(latitude, longitude, { startDate, endDate });
      setProjects(fetchedProjects);
      setGroundingMetadata(fetchedMetadata);

      const lowRatingProjects = fetchedProjects.filter(p => p.rating < 3.5);
      setNotifications(lowRatingProjects.map((p, i) => ({
        id: Date.now() + i,
        message: `${p.projectName} has a rating of ${p.rating.toFixed(1)}.`
      })));

      if (fetchedProjects.length > 0) {
        setLoadingAnalysis(true);
        const analysisResult = await analyzeProjectData(fetchedProjects);
        setAnalysis(analysisResult);
        setLoadingAnalysis(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setProjects([]);
      setGroundingMetadata(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const handleLocationPermission = useCallback(() => {
    if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        setLocationPermission('denied');
        setLoading(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            setLocationPermission('granted');
            setCurrentCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
            getProjects(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
            setLocationPermission('denied');
            setError(`Error getting location: ${error.message}. Please enable location services.`);
            setLoading(false);
        }
    );
  }, [getProjects]);

  useEffect(() => {
    handleLocationPermission();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    if (currentCoords) {
        getProjects(currentCoords.lat, currentCoords.lon);
    } else {
        setError("Location not available. Cannot apply filter.");
    }
  }
  
  const removeNotification = (id: number) => {
    setNotifications(current => current.filter(n => n.id !== id));
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (error) {
      return (
        <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-bold text-lg">An Error Occurred</p>
          <p>{error}</p>
          {locationPermission === 'denied' && (
             <button
                onClick={handleLocationPermission}
                className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Retry Location Access
              </button>
          )}
        </div>
      );
    }
    if (projects.length === 0) {
      return <p className="text-center text-slate-500 text-xl mt-8">No projects found for the selected criteria.</p>;
    }
    return (
      <ProjectsTable projects={projects} groundingMetadata={groundingMetadata} />
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <div className="fixed top-0 right-0 p-4 space-y-2 z-50 w-full max-w-md">
          {notifications.map(n => (
              <Notification key={n.id} message={n.message} onClose={() => removeNotification(n.id)} />
          ))}
      </div>
      
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 md:py-8 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Godrej Properties Dashboard
            </h1>
            <p className="mt-2 md:mt-4 max-w-2xl mx-auto text-md md:text-lg text-slate-300">
                AI-powered insights into Godrej projects in Mumbai, grounded with real-time Google Maps data.
            </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="w-full md:w-auto flex-1">
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Start Date</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2"/>
                </div>
                <div className="w-full md:w-auto flex-1">
                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">End Date</label>
                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2"/>
                </div>
                <button
                    onClick={handleFilter}
                    disabled={loading}
                    className="w-full md:w-auto mt-4 md:mt-0 md:self-end flex items-center justify-center gap-2 px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 transition-colors"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    <span>{loading ? 'Applying...' : 'Apply Filter'}</span>
                </button>
            </div>
        </div>

        {renderContent()}

        {projects.length > 0 && <AnalysisPanel analysis={analysis} loading={loadingAnalysis} />}

        {groundingMetadata && groundingMetadata.groundingChunks.length > 0 && (
            <footer className="mt-12 text-center text-sm text-slate-500">
                <p className="font-semibold">Data grounded by Google Maps.</p>
                <p>The information presented is based on publicly available data and may not be exhaustive.</p>
            </footer>
        )}
      </main>
    </div>
  );
};

export default App;