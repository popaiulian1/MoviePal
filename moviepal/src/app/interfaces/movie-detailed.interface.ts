import { featuredMovie } from './featured-movie.interface';

export interface MovieDetailed {
    entry: featuredMovie;
    cinema: {
        id: string;
        name: string;
        location: string;
        contactNumber?: string;
        email?: string;
        website?: string;
        openingHours?: string;
    }
}