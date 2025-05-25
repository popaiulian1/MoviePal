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

// API request helper
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
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (response.status === 401) {
        localStorage.removeItem('jwt_token');
        updateAuthStatus();
        throw new Error('Unauthorized: Please login again');
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }
    
    return await response.text();
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

// Edit movie
async function editMovie(id) {
    try {
        const movie = await apiRequest(`/movies/${id}`);
        
        // Fill form
        document.getElementById('movie-title').value = movie.title || '';
        document.getElementById('movie-genre').value = movie.genre || '';
        document.getElementById('movie-director').value = movie.director || '';
        document.getElementById('movie-rating').value = movie.rating || '';
        document.getElementById('movie-description').value = movie.description || '';
        document.getElementById('movie-posterUrl').value = movie.posterUrl || '';
        document.getElementById('movie-trailerUrl').value = movie.trailerUrl || '';
        document.getElementById('movie-releaseDate').value = movie.releaseDate || '';
        document.getElementById('movie-runtime').value = movie.runtime || '';
        document.getElementById('movie-language').value = movie.language || '';
        document.getElementById('movie-cast').value = movie.cast || '';
        document.getElementById('movie-status').value = movie.status || 'SHOWING';
        document.getElementById('movie-ticketPrice').value = movie.ticketPrice || '';
        document.getElementById('movie-cinemaId').value = movie.cinemaId || '';
        document.getElementById('movie-id-for-update').value = movie.id;
        
        // Change button text
        document.getElementById('addMovieBtn').textContent = 'Update Movie';
        
        // Switch to movies tab and scroll to form
        document.querySelector('[data-tab="movies"]').click();
        document.getElementById('addMovieForm').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert(`Error loading movie: ${error.message}`);
    }
}

// Delete movie
async function deleteMovie(id) {
    if (confirm('Are you sure you want to delete this movie?')) {
        try {
            await apiRequest(`/movies/${id}`, 'DELETE');
            alert('Movie deleted successfully');
            
            // Refresh movies list
            document.getElementById('getMoviesForm').dispatchEvent(new Event('submit'));
        } catch (error) {
            alert(`Error deleting movie: ${error.message}`);
        }
    }
}

// Edit cinema
async function editCinema(id) {
    try {
        const cinema = await apiRequest(`/cinemas/${id}`);
        
        // Fill form
        document.getElementById('cinema-name').value = cinema.name || '';
        document.getElementById('cinema-location').value = cinema.location || '';
        document.getElementById('cinema-contactNumber').value = cinema.contactNumber || '';
        document.getElementById('cinema-email').value = cinema.email || '';
        document.getElementById('cinema-website').value = cinema.website || '';
        document.getElementById('cinema-openingHours').value = cinema.openingHours || '';
        document.getElementById('cinema-id-for-update').value = cinema.id;
        
        // Change button text
        document.getElementById('addCinemaBtn').textContent = 'Update Cinema';
        
        // Switch to cinemas tab and scroll to form
        document.querySelector('[data-tab="cinemas"]').click();
        document.getElementById('addCinemaForm').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert(`Error loading cinema: ${error.message}`);
    }
}

// Delete cinema
async function deleteCinema(id) {
    if (confirm('Are you sure you want to delete this cinema? This will also delete all movies associated with this cinema.')) {
        try {
            await apiRequest(`/cinemas/${id}`, 'DELETE');
            alert('Cinema deleted successfully');
            
            // Refresh cinemas list
            document.getElementById('getCinemasForm').dispatchEvent(new Event('submit'));
        } catch (error) {
            alert(`Error deleting cinema: ${error.message}`);
        }
    }
}

// Make these functions global so they can be called from inline handlers
window.editMovie = editMovie;
window.deleteMovie = deleteMovie;
window.editCinema = editCinema;
window.deleteCinema = deleteCinema;

// Initialize
updateAuthStatus();