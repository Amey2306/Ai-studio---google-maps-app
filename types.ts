export interface Comment {
  text: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
}

export interface Project {
  projectName: string;
  address: string;
  rating: number;
  comments: Comment[];
  reviewCount: number;
}

export interface GroundingChunk {
  maps: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets: {
        uri: string;
        title: string;
        text: string;
      }[];
    }[];
  };
}

export interface GroundingMetadata {
    groundingChunks: GroundingChunk[];
}

export interface NotificationMessage {
  id: number;
  message: string;
}