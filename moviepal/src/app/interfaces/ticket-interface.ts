export interface Ticket {
    id: string;
    userId: string;
    movieId: string;
    cinemaId: string;
    showTime: Date;
    numberOfSeats: number;
    totalPrice: number;
    bookingDate: string;
    status: string;
}