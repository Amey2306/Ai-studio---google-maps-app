export interface Comment {
  text: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
}

export interface RatingBifurcation {
  "5-star": number;
  "4-star": number;
  "3-star": number;
  "2-star": number;
  "1-star": number;
}

export interface Project {
  projectName: string;
  address: string;
  rating: number;
  comments: Comment[];
  reviewCount: number;
  ratingBifurcation?: RatingBifurcation;
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