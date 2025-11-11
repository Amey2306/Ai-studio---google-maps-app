import React from 'react';
import { Project, GroundingChunk, GroundingMetadata } from '../types';

interface ProjectsTableProps {
  projects: Project[];
  groundingMetadata?: GroundingMetadata | null;
}

const sentimentColors: { [key: string]: string } = {
  Positive: 'bg-green-100 text-green-800',
  Negative: 'bg-red-100 text-red-800',
  Neutral: 'bg-yellow-100 text-yellow-800',
};

const FlagIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
    </svg>
);

const DesktopTable: React.FC<ProjectsTableProps> = ({ projects, groundingMetadata }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Address</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rating</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Comments</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Review Count</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project, index) => {
                        const isLowRating = project.rating < 3.5;
                        const groundingChunk = groundingMetadata?.groundingChunks[index];
                        return (
                            <tr key={index} className={isLowRating ? 'bg-red-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-slate-900">{project.projectName}</div>
                                    {groundingChunk?.maps.uri && (
                                        <a href={groundingChunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-600 hover:text-sky-800">
                                            View on Map
                                        </a>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-normal text-sm text-slate-600">{project.address}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {isLowRating && <FlagIcon />}
                                        <span className={`font-semibold text-lg ${isLowRating ? 'text-red-600' : 'text-slate-800'}`}>{project.rating.toFixed(1)}</span>
                                        <span className="text-slate-500 ml-1">/ 5.0</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        {project.comments.map((comment, i) => (
                                            <div key={i}>
                                                <p className="text-sm text-slate-800 italic">"{comment.text}"</p>
                                                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${sentimentColors[comment.sentiment]}`}>
                                                    {comment.sentiment}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="text-sm font-semibold text-slate-800">{project.reviewCount ?? 'N/A'}</div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
);

const MobileCard: React.FC<{project: Project, groundingChunk: GroundingChunk | undefined}> = ({ project, groundingChunk }) => {
    const isLowRating = project.rating < 3.5;
    return (
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden border-l-4 ${isLowRating ? 'border-red-500' : 'border-sky-500'}`}>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900">{project.projectName}</h3>
                     <div className="flex items-center">
                        {isLowRating && <FlagIcon />}
                        <span className={`font-semibold text-xl ${isLowRating ? 'text-red-600' : 'text-slate-800'}`}>{project.rating.toFixed(1)}</span>
                        <span className="text-slate-500 ml-1">/ 5</span>
                    </div>
                </div>
                <p className="text-sm text-slate-600 mt-1">{project.address}</p>
                 {groundingChunk?.maps.uri && (
                    <a href={groundingChunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-sky-600 hover:text-sky-800 mt-2 inline-block">
                        View on Map
                    </a>
                )}
            </div>
            <div className="px-4 pb-4">
                 <h4 className="font-semibold text-slate-700 mb-2">Comments ({project.reviewCount ?? 'N/A'} reviews)</h4>
                 <div className="space-y-3">
                    {project.comments.map((comment, i) => (
                        <div key={i} className="border-l-2 pl-3">
                            <p className="text-sm text-slate-800 italic">"{comment.text}"</p>
                            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1.5 ${sentimentColors[comment.sentiment]}`}>
                                {comment.sentiment}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects, groundingMetadata }) => {
  return (
    <>
        {/* Desktop View */}
        <div className="hidden md:block">
            <DesktopTable projects={projects} groundingMetadata={groundingMetadata} />
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
            {projects.map((project, index) => (
                <MobileCard key={index} project={project} groundingChunk={groundingMetadata?.groundingChunks[index]} />
            ))}
        </div>
    </>
  );
};

export default ProjectsTable;