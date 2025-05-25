// Base URL for API requests
const API_BASE_URL = 'http://localhost:8080/api';

// Tab functionality
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// Check if user is logged in
function updateAuthStatus() {
    const token = localStorage.getItem('jwt_token');
    const authStatus = document.getElementById('authStatus');
    
    if (token) {
        authStatus.innerText = 'Logged in ✅';
        authStatus.style.backgroundColor = '#d4edda';
    } else {
        authStatus.innerText = 'Not logged in ❌';
        authStatus.style.backgroundColor = '#f8d7da';
    }
}

// Authentication header
function getAuthHeader() {
    const token = localStorage.getItem('jwt_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// API request helper with improved error handling
async function apiRequest(endpoint, method = 'GET', data = null) {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader()
    };
    
    const options = {
        method,
        headers
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    console.log(`Making ${method} request to ${endpoint}:`, {
        headers: options.headers,
        body: options.body
    });
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        console.log(`Response from ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText
        });
        
        if (response.status === 401) {
            localStorage.removeItem('jwt_token');
            updateAuthStatus();
            throw new Error('Unauthorized: Please login again');
        }
        
        if (!response.ok) {
            // Try to get detailed error message from response
            let errorMessage = response.statusText;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else {
                    errorMessage = JSON.stringify(errorData);
                }
            } else {
                try {
                    errorMessage = await response.text();
                } catch (e) {
                    errorMessage = response.statusText;
                }
            }
            
            throw new Error(`Request failed: ${response.status} - ${errorMessage}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    } catch (error) {
        console.error(`API Request Error (${endpoint}):`, error);
        throw error;
    }
}

// Register
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const user = {
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value
        };
        
        const result = await apiRequest('/auth/register', 'POST', user);
        document.getElementById('auth-response').textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        document.getElementById('auth-response').textContent = error.message;
    }
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const credentials = {
            username: document.getElementById('login-username').value,
            password: document.getElementById('login-password').value
        };
        
        const result = await apiRequest('/auth/login', 'POST', credentials);
        document.getElementById('auth-response').textContent = JSON.stringify(result, null, 2);
        
        if (result.token) {
            localStorage.setItem('jwt_token', result.token);
            updateAuthStatus();
        }
    } catch (error) {
        document.getElementById('auth-response').textContent = error.message;
    }
});

// Refresh Token
document.getElementById('refreshToken').addEventListener('click', async () => {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            throw new Error('No token found');
        }
        
        const result = await apiRequest('/auth/refresh', 'POST', { token });
        document.getElementById('auth-response').textContent = JSON.stringify(result, null, 2);
        
        if (result.token) {
            localStorage.setItem('jwt_token', result.token);
            updateAuthStatus();
        }
    } catch (error) {
        document.getElementById('auth-response').textContent = error.message;
    }
});

// Logout
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('jwt_token');
    updateAuthStatus();
    document.getElementById('auth-response').textContent = 'Logged out successfully';
});

// Get movies
document.getElementById('getMoviesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const page = document.getElementById('movies-page').value;
        const size = document.getElementById('movies-size').value;
        const sort = document.getElementById('movies-sort').value;
        const includeCinemaDetails = document.getElementById('include-cinema-details').checked;
        
        const result = await apiRequest(`/movies?page=${page}&size=${size}&sort=${sort}&includeCinemaDetails=${includeCinemaDetails}`);
        document.getElementById('movies-response').textContent = JSON.stringify(result, null, 2);
        
        // Display movies
        displayMovies(result.content || []);
    } catch (error) {
        document.getElementById('movies-response').textContent = error.message;
    }
});

// Search movies
document.getElementById('searchMoviesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const query = document.getElementById('movies-search').value;
        
        const result = await apiRequest(`/movies/search?query=${encodeURIComponent(query)}`);
        document.getElementById('movies-response').textContent = JSON.stringify(result, null, 2);
        
        // Display movies
        displayMovies(result || []);
    } catch (error) {
        document.getElementById('movies-response').textContent = error.message;
    }
});

// Get movie by ID
document.getElementById('getMovieByIdForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const id = document.getElementById('movie-id').value;
        const withDetails = document.getElementById('get-movie-with-details').checked;
        
        const endpoint = withDetails ? `/movies/${id}/details` : `/movies/${id}`;
        const result = await apiRequest(endpoint);
        document.getElementById('movies-response').textContent = JSON.stringify(result, null, 2);
        
        // Display movie
        if (withDetails) {
            displayMovies([result.entry], result.cinema);
        } else {
            displayMovies([result]);
        }
    } catch (error) {
        document.getElementById('movies-response').textContent = error.message;
    }
});

// Add movie
document.getElementById('addMovieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const movieId = document.getElementById('movie-id-for-update').value;
        const isUpdate = !!movieId;
        
        const movie = {
            title: document.getElementById('movie-title').value,
            genre: document.getElementById('movie-genre').value,
            director: document.getElementById('movie-director').value,
            rating: parseFloat(document.getElementById('movie-rating').value),
            description: document.getElementById('movie-description').value,
            posterUrl: document.getElementById('movie-posterUrl').value,
            trailerUrl: document.getElementById('movie-trailerUrl').value,
            releaseDate: document.getElementById('movie-releaseDate').value,
            runtime: document.getElementById('movie-runtime').value,
            language: document.getElementById('movie-language').value,
            cast: document.getElementById('movie-cast').value,
            status: document.getElementById('movie-status').value,
            ticketPrice: document.getElementById('movie-ticketPrice').value,
            cinemaId: document.getElementById('movie-cinemaId').value
        };
        
        if (isUpdate) {
            movie.id = movieId;
            const result = await apiRequest(`/movies/${movieId}`, 'PUT', movie);
            document.getElementById('movies-response').textContent = JSON.stringify(result, null, 2);
            document.getElementById('addMovieBtn').textContent = 'Add Movie';
        } else {
            const result = await apiRequest('/movies', 'POST', movie);
            document.getElementById('movies-response').textContent = JSON.stringify(result, null, 2);
        }
        
        // Clear form
        document.getElementById('addMovieForm').reset();
        document.getElementById('movie-id-for-update').value = '';
    } catch (error) {
        document.getElementById('movies-response').textContent = error.message;
    }
});

// Get cinemas
document.getElementById('getCinemasForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const page = document.getElementById('cinemas-page').value;
        const size = document.getElementById('cinemas-size').value;
        const sort = document.getElementById('cinemas-sort').value;
        
        const result = await apiRequest(`/cinemas?page=${page}&size=${size}&sort=${sort}`);
        document.getElementById('cinemas-response').textContent = JSON.stringify(result, null, 2);
        
        // Display cinemas
        displayCinemas(result.content || []);
    } catch (error) {
        document.getElementById('cinemas-response').textContent = error.message;
    }
});

// Search cinemas
document.getElementById('searchCinemasForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const type = document.getElementById('search-type').value;
        const query = document.getElementById('cinemas-search').value;
        
        const result = await apiRequest(`/cinemas/search?${type}=${encodeURIComponent(query)}`);
        document.getElementById('cinemas-response').textContent = JSON.stringify(result, null, 2);
        
        // Display cinemas
        displayCinemas(result || []);
    } catch (error) {
        document.getElementById('cinemas-response').textContent = error.message;
    }
});

// Get cinema by ID
document.getElementById('getCinemaByIdForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const id = document.getElementById('cinema-id').value;
        
        const result = await apiRequest(`/cinemas/${id}`);
        document.getElementById('cinemas-response').textContent = JSON.stringify(result, null, 2);
        
        // Display cinema
        displayCinemas([result]);
    } catch (error) {
        document.getElementById('cinemas-response').textContent = error.message;
    }
});

// Add cinema
document.getElementById('addCinemaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const cinemaId = document.getElementById('cinema-id-for-update').value;
        const isUpdate = !!cinemaId;
        
        const cinema = {
            name: document.getElementById('cinema-name').value,
            location: document.getElementById('cinema-location').value,
            contactNumber: document.getElementById('cinema-contactNumber').value,
            email: document.getElementById('cinema-email').value,
            website: document.getElementById('cinema-website').value,
            openingHours: document.getElementById('cinema-openingHours').value
        };
        
        if (isUpdate) {
            cinema.id = cinemaId;
            const result = await apiRequest(`/cinemas/${cinemaId}`, 'PUT', cinema);
            document.getElementById('cinemas-response').textContent = JSON.stringify(result, null, 2);
            document.getElementById('addCinemaBtn').textContent = 'Add Cinema';
        } else {
            const result = await apiRequest('/cinemas', 'POST', cinema);
            document.getElementById('cinemas-response').textContent = JSON.stringify(result, null, 2);
        }
        
        // Clear form
        document.getElementById('addCinemaForm').reset();
        document.getElementById('cinema-id-for-update').value = '';
    } catch (error) {
        document.getElementById('cinemas-response').textContent = error.message;
    }
});

// Get user profile
document.getElementById('getUserProfile').addEventListener('click', async () => {
    try {
        const result = await apiRequest('/users/profile');
        document.getElementById('profile-response').textContent = JSON.stringify(result, null, 2);
        
        // Update form
        document.getElementById('profile-email').value = result.email || '';
    } catch (error) {
        document.getElementById('profile-response').textContent = error.message;
    }
});

// Update profile
document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const profile = {
            email: document.getElementById('profile-email').value
        };
        
        const result = await apiRequest('/users/profile', 'PUT', profile);
        document.getElementById('profile-response').textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        document.getElementById('profile-response').textContent = error.message;
    }
});

// Book a ticket
document.getElementById('bookTicketForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // First check if user is logged in
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        document.getElementById('tickets-response').textContent = 'Please log in before booking a ticket';
        document.querySelector('[data-tab="auth"]').click();
        return;
    }
    
    try {
        const ticket = {
            movieId: document.getElementById('ticket-movieId').value,
            cinemaId: document.getElementById('ticket-cinemaId').value,
            showTime: document.getElementById('ticket-showTime').value,
            numberOfSeats: parseInt(document.getElementById('ticket-numberOfSeats').value)
            // Don't set userId here, let the backend handle it
        };
        
        // Validate required fields
        if (!ticket.movieId) {
            throw new Error('Movie ID is required');
        }
        if (!ticket.cinemaId) {
            throw new Error('Cinema ID is required');
        }
        if (!ticket.showTime) {
            throw new Error('Show time is required');
        }
        if (!ticket.numberOfSeats || ticket.numberOfSeats < 1) {
            throw new Error('Number of seats must be at least 1');
        }
        
        console.log('Sending ticket data:', ticket);
        
        const result = await apiRequest('/tickets', 'POST', ticket);
        console.log('Ticket booking response:', result);
        
        document.getElementById('tickets-response').textContent = JSON.stringify(result, null, 2);
        
        // Clear form
        document.getElementById('bookTicketForm').reset();
        
        // Refresh tickets
        getTickets();
        
        alert('Ticket booked successfully!');
    } catch (error) {
        console.error('Ticket booking error:', error);
        document.getElementById('tickets-response').textContent = error.message;
    }
});

// Test ticket function
function createTestTicket() {
    // First check if user is logged in
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        document.getElementById('tickets-response').textContent = 'Please log in before booking a ticket';
        document.querySelector('[data-tab="auth"]').click();
        return;
    }
    
    try {
        // Get the first movie and cinema IDs
        Promise.all([
            apiRequest('/movies?page=0&size=1'),
            apiRequest('/cinemas?page=0&size=1')
        ]).then(async ([moviesResult, cinemasResult]) => {
            if (!moviesResult.content || moviesResult.content.length === 0) {
                document.getElementById('tickets-response').textContent = 'No movies found to create test ticket';
                return;
            }
            
            if (!cinemasResult.content || cinemasResult.content.length === 0) {
                document.getElementById('tickets-response').textContent = 'No cinemas found to create test ticket';
                return;
            }
            
            const movieId = moviesResult.content[0].id;
            const cinemaId = cinemasResult.content[0].id;
            
            const testTicket = {
                movieId: movieId,
                cinemaId: cinemaId,
                showTime: "19:30",
                numberOfSeats: 2
            };
            
            console.log('Sending test ticket data:', testTicket);
            
            try {
                const result = await apiRequest('/tickets', 'POST', testTicket);
                console.log('Test ticket response:', result);
                document.getElementById('tickets-response').textContent = 'Test ticket created: ' + JSON.stringify(result, null, 2);
                
                // Refresh tickets
                getTickets();
            } catch (error) {
                console.error('Test ticket error:', error);
                document.getElementById('tickets-response').textContent = 'Error: ' + error.message;
            }
        });
    } catch (error) {
        console.error('Error preparing test ticket:', error);
        document.getElementById('tickets-response').textContent = 'Error preparing test ticket: ' + error.message;
    }
}

// Add the event listener for the test button
document.addEventListener('DOMContentLoaded', () => {
    // Add a test ticket button to the page
    const testButton = document.createElement('button');
    testButton.textContent = 'Create Test Ticket';
    testButton.id = 'testTicketBtn';
    testButton.addEventListener('click', createTestTicket);
    
    // Add the button after the Get My Tickets button
    const getTicketsBtn = document.getElementById('getTicketsBtn');
    if (getTicketsBtn && getTicketsBtn.parentNode) {
        getTicketsBtn.parentNode.insertBefore(testButton, getTicketsBtn.nextSibling);
    }
    
    // Add click handler for get tickets button
    if (getTicketsBtn) {
        getTicketsBtn.addEventListener('click', getTickets);
        console.log('Get tickets button listener attached');
    } else {
        console.error('Get tickets button not found in DOM');
    }
    
    // Add a View Tickets button to the auth status area
    const authStatus = document.getElementById('authStatus');
    if (authStatus) {
        const viewTicketsBtn = document.createElement('button');
        viewTicketsBtn.textContent = 'View My Tickets';
        viewTicketsBtn.className = 'view-tickets-btn';
        viewTicketsBtn.addEventListener('click', () => {
            showTicketsTab();
            getTickets();
        });
        
        // Add the button after auth status
        authStatus.parentNode.insertBefore(viewTicketsBtn, authStatus.nextSibling);
        
        // Style the button
        const btnStyle = document.createElement('style');
        btnStyle.textContent = `
            .view-tickets-btn {
                margin-left: 10px;
                padding: 5px 10px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .view-tickets-btn:hover {
                background-color: #45a049;
            }
        `;
        document.head.appendChild(btnStyle);
    }
});

// Add a function to explicitly show the tickets tab
function showTicketsTab() {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector('[data-tab="tickets"]').classList.add('active');
    document.getElementById('tickets').classList.add('active');
}

// Update the getTickets function
async function getTickets() {
    try {
        // Check if user is logged in
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            document.getElementById('tickets-response').textContent = 'Please log in before viewing tickets';
            document.getElementById('tickets-results').innerHTML = '<p>Please log in to view your tickets</p>';
            document.querySelector('[data-tab="auth"]').click();
            return;
        }
        
        console.log('Fetching user tickets with token...');
        document.getElementById('tickets-response').textContent = 'Loading tickets...';
        document.getElementById('tickets-results').innerHTML = '<p>Loading your tickets...</p>';
        
        const result = await apiRequest('/tickets');
        console.log('Tickets fetched:', result);
        
        document.getElementById('tickets-response').textContent = JSON.stringify(result, null, 2);
        
        // Handle empty array
        if (Array.isArray(result) && result.length === 0) {
            document.getElementById('tickets-results').innerHTML = '<p>No tickets found. Try booking a ticket first!</p>';
            return;
        }
        
        // Handle array of tickets
        if (Array.isArray(result)) {
            displayTickets(result);
        } else {
            console.error('Unexpected tickets response format:', result);
            document.getElementById('tickets-response').textContent += '\n\nWarning: Unexpected response format. Expected an array.';
            document.getElementById('tickets-results').innerHTML = '<p>Error: Unexpected response format from server</p>';
        }
        
        // Show the tickets tab
        showTicketsTab();
    } catch (error) {
        console.error('Error fetching tickets:', error);
        document.getElementById('tickets-response').textContent = error.message;
        document.getElementById('tickets-results').innerHTML = '<p>Error loading tickets: ' + error.message + '</p>';
    }
}

// Make the function global
window.showTicketsTab = showTicketsTab;

// Update ticket
document.getElementById('updateTicketForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const ticketId = document.getElementById('update-ticketId').value;
        const ticket = {};
        
        const numberOfSeats = document.getElementById('update-numberOfSeats').value;
        if (numberOfSeats) {
            ticket.numberOfSeats = parseInt(numberOfSeats);
        }
        
        const status = document.getElementById('update-status').value;
        if (status) {
            ticket.status = status;
        }
        
        const result = await apiRequest(`/tickets/${ticketId}`, 'PUT', ticket);
        document.getElementById('tickets-response').textContent = JSON.stringify(result, null, 2);
        
        // Clear form
        document.getElementById('updateTicketForm').reset();
        
        // Refresh tickets
        getTickets();
    } catch (error) {
        document.getElementById('tickets-response').textContent = error.message;
    }
});

// Cancel ticket
document.getElementById('cancelTicketForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const ticketId = document.getElementById('cancel-ticketId').value;
        
        await apiRequest(`/tickets/${ticketId}`, 'DELETE');
        document.getElementById('tickets-response').textContent = 'Ticket canceled successfully';
        
        // Clear form
        document.getElementById('cancelTicketForm').reset();
        
        // Refresh tickets
        getTickets();
    } catch (error) {
        document.getElementById('tickets-response').textContent = error.message;
    }
});

// Helper function to display movies
function displayMovies(movies, cinema) {
    const container = document.getElementById('movies-results');
    container.innerHTML = '';
    
    movies.forEach(movie => {
        // Handle different structures (movie or CinemaEntryDetailsDto)
        const movieData = movie.entry || movie;
        const cinemaData = movie.cinema || cinema;
        
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        let content = `
            <h3>${movieData.title}</h3>
            <p><strong>Genre:</strong> ${movieData.genre}</p>
            <p><strong>Director:</strong> ${movieData.director}</p>
            <p><strong>Rating:</strong> ${movieData.rating}</p>
        `;
        
        if (movieData.posterUrl) {
            content = `<img src="${movieData.posterUrl}" alt="${movieData.title}" style="max-width:100%; max-height:150px; display:block; margin-bottom:10px;">` + content;
        }
        
        if (cinemaData) {
            content += `<p><strong>Cinema:</strong> ${cinemaData.name} (${cinemaData.location})</p>`;
        }
        
        content += `
            <button onclick="editMovie('${movieData.id}')">Edit</button>
            <button onclick="deleteMovie('${movieData.id}')">Delete</button>
        `;
        
        card.innerHTML = content;
        container.appendChild(card);
    });
}

// Helper function to display cinemas
function displayCinemas(cinemas) {
    const container = document.getElementById('cinemas-results');
    container.innerHTML = '';
    
    cinemas.forEach(cinema => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        card.innerHTML = `
            <h3>${cinema.name}</h3>
            <p><strong>Location:</strong> ${cinema.location}</p>
            ${cinema.contactNumber ? `<p><strong>Contact:</strong> ${cinema.contactNumber}</p>` : ''}
            ${cinema.email ? `<p><strong>Email:</strong> ${cinema.email}</p>` : ''}
            ${cinema.website ? `<p><strong>Website:</strong> <a href="${cinema.website}" target="_blank">${cinema.website}</a></p>` : ''}
            ${cinema.openingHours ? `<p><strong>Hours:</strong> ${cinema.openingHours}</p>` : ''}
            <button onclick="editCinema('${cinema.id}')">Edit</button>
            <button onclick="deleteCinema('${cinema.id}')">Delete</button>
        `;
        
        container.appendChild(card);
    });
}

// Helper function to display tickets with flexible format support
function displayTickets(tickets) {
    const container = document.getElementById('tickets-results');
    container.innerHTML = '';
    
    if (!tickets || tickets.length === 0) {
        container.innerHTML = '<p>No tickets found</p>';
        return;
    }
    
    console.log('Displaying tickets:', tickets);
    
    tickets.forEach(ticketData => {
        // Handle both formats: {ticket, movie, cinema} or direct ticket object
        const ticket = ticketData.ticket || ticketData;
        const movie = ticketData.movie || null;
        const cinema = ticketData.cinema || null;
        
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        // Safe access with fallbacks
        let content = `
            <h3>${movie ? movie.title : (ticket.movieTitle || 'Unknown Movie')}</h3>
            <p><strong>Cinema:</strong> ${cinema ? cinema.name : (ticket.cinemaName || 'Unknown Cinema')}</p>
            <p><strong>Show Time:</strong> ${ticket.showTime || 'Not specified'}</p>
            <p><strong>Seats:</strong> ${ticket.numberOfSeats || '1'}</p>
            <p><strong>Total Price:</strong> $${typeof ticket.totalPrice === 'number' ? ticket.totalPrice.toFixed(2) : '0.00'}</p>
            <p><strong>Status:</strong> ${ticket.status || 'BOOKED'}</p>
            <p><strong>Ticket ID:</strong> ${ticket.id}</p>
        `;
        
        // Add warning for incomplete data
        if ((movie && movie.title === 'Unknown Movie') || (cinema && cinema.name === 'Unknown Cinema')) {
            content += `<p class="warning">⚠️ This ticket has incomplete data. The movie or cinema may have been deleted.</p>`;
        }
        
        card.innerHTML = content;
        container.appendChild(card);
    });
}