import { Cinema } from './cinema.interface';
import { featuredMovie } from './featured-movie.interface';

export interface MovieDetailed {
    entry: featuredMovie;
    cinema: Cinema
}