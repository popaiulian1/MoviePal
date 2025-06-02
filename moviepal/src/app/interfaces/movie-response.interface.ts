import { featuredMovie } from './featured-movie.interface';

export interface MovieResponse {
  content: featuredMovie[];
  pageable: any;
  last: boolean;
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}