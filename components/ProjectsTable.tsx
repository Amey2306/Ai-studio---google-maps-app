import React from 'react';
import { Project, GroundingMetadata, Comment, RatingBifurcation } from '../types';

const sentimentColor = (sentiment: 'Positive' | 'Negative' | 'Neutral') => {
  switch (sentiment) {
    case 'Positive': return 'bg-green-500/20 text-green-300 ring-green-500/30';
    case 'Negative': return 'bg-red-500/20 text-red-300 ring-red-500/30';
    default: return 'bg-slate-500/20 text-slate-300 ring-slate-500/30';
  }
};

const Star: React.FC<{ filled: boolean; half?: boolean }> = ({ filled, half }) => (
    <svg className={`w-5 h-5 ${filled || half ? 'text-yellow-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d={half ? "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 15.118V2.927z" : "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"} />
    </svg>
);

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} filled />)}
            {halfStar && <Star key="half" filled half />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} filled={false} />)}
        </div>
    );
};

const RatingBifurcationView: React.FC<{ bifurcation: RatingBifurcation, total: number }> = ({ bifurcation, total }) => {
    // FIX: Explicitly type the accumulator `acc` as a number to prevent TypeScript from inferring it as `unknown`.
    const sum = Object.values(bifurcation).reduce((acc: number, count) => acc + Number(count), 0);
    
    if (sum === 0) {
      return <p className="text-sm text-slate-400 italic">Rating breakdown not available.</p>;
    }

    const ratings: (keyof RatingBifurcation)[] = ["5-star", "4-star", "3-star", "2-star", "1-star"];
    
    return (
        <div className="space-y-1.5">
            {ratings.map(starKey => {
                const count = bifurcation[starKey] || 0;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                    <div key={starKey} className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 w-12 text-right">{starKey}</span>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-slate-300 w-8 text-right">{count}</span>
                    </div>
                );
            })}
        </div>
    );
};


const ProjectRow: React.FC<{ project: Project }> = ({ project }) => (
    <tr className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors">
        <td className="p-4 align-top">
            <div className="font-bold text-sky-400">{project.projectName}</div>
            <div className="text-sm text-slate-400">{project.address}</div>
        </td>
        <td className="p-4 align-top">
            <div className="flex items-center gap-2">
                <StarRating rating={project.rating} />
                <span className={`font-bold text-lg ${project.rating < 3.5 ? 'text-red-400' : 'text-slate-200'}`}>{project.rating.toFixed(1)}</span>
            </div>
            <div className="text-sm text-slate-400">({project.reviewCount} reviews)</div>
        </td>
        <td className="p-4 align-top max-w-xs">
            {project.ratingBifurcation && <RatingBifurcationView bifurcation={project.ratingBifurcation} total={project.reviewCount}/>}
        </td>
        <td className="p-4 align-top">
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {project.comments.map((c, i) => (
                    <div key={i} className="text-sm p-2 bg-slate-800 rounded-md">
                        <p className="text-slate-300">"{c.text}"</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${sentimentColor(c.sentiment)}`}>
                            {c.sentiment}
                        </span>
                    </div>
                ))}
            </div>
        </td>
    </tr>
);

const ProjectMobileCard: React.FC<{ project: Project }> = ({ project }) => (
    <div className="bg-slate-800 rounded-lg shadow-lg p-4 ring-1 ring-white/10">
        <div className="font-bold text-lg text-sky-400">{project.projectName}</div>
        <div className="text-sm text-slate-400 mt-1">{project.address}</div>
        <div className="flex items-center gap-2 mt-3">
            <StarRating rating={project.rating} />
            <span className={`font-bold text-lg ${project.rating < 3.5 ? 'text-red-400' : 'text-slate-200'}`}>{project.rating.toFixed(1)}</span>
            <span className="text-sm text-slate-400">({project.reviewCount} reviews)</span>
        </div>
        <div className="my-4 border-t border-slate-700"></div>
        <h4 className="font-semibold text-slate-200 mb-2">Rating Breakdown</h4>
        {project.ratingBifurcation ? <RatingBifurcationView bifurcation={project.ratingBifurcation} total={project.reviewCount}/> : <p className="text-sm text-slate-400 italic">Not available.</p>}
        <div className="my-4 border-t border-slate-700"></div>
        <h4 className="font-semibold text-slate-200 mb-2">Comments</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {project.comments.map((c, i) => (
                <div key={i} className="text-sm p-2 bg-slate-900/50 rounded-md">
                    <p className="text-slate-300">"{c.text}"</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${sentimentColor(c.sentiment)}`}>
                        {c.sentiment}
                    </span>
                </div>
            ))}
        </div>
    </div>
);


const ProjectsTable: React.FC<{ projects: Project[], groundingMetadata: GroundingMetadata | null }> = ({ projects, groundingMetadata }) => {
    if (projects.length === 0) {
        return <p className="text-center text-slate-400 mt-8">No projects found. Click the button above to fetch data.</p>;
    }
    
    const uniqueUris = new Set<string>();
    groundingMetadata?.groundingChunks?.forEach(chunk => {
        if (chunk.maps?.uri) uniqueUris.add(chunk.maps.uri);
    });

    return (
        <div>
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {projects.map((project, index) => <ProjectMobileCard key={index} project={project} />)}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block bg-slate-800/50 rounded-lg shadow-lg overflow-hidden ring-1 ring-white/10">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="bg-slate-900/70 text-xs text-sky-300 uppercase tracking-wider">
                        <tr>
                            <th scope="col" className="p-4">Project Details</th>
                            <th scope="col" className="p-4">Overall Rating</th>
                            <th scope="col" className="p-4">Rating Breakdown</th>
                            <th scope="col" className="p-4">Recent Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project, index) => <ProjectRow key={index} project={project} />)}
                    </tbody>
                </table>
            </div>

            {uniqueUris.size > 0 && (
                 <div className="mt-12 p-6 bg-slate-800/50 rounded-lg ring-1 ring-white/10">
                    <h3 className="text-lg font-semibold text-sky-300">Data Sources from Google Maps</h3>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        {Array.from(uniqueUris).map((uri, index) => (
                             <li key={index} className="text-sm truncate">
                                <a href={uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline" title={uri}>
                                    {uri}
                                </a>
                             </li>
                        ))}
                    </ul>
                 </div>
            )}
        </div>
    );
};

export default ProjectsTable;