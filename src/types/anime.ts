
export interface Anime {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  rating: number;
  genres: string[];
  status?: string; 
  releaseDate?: string;
  episodes?: number;
  trending?: boolean;
  popular?: boolean;
  year?: number;
  studios?: string[];
}
