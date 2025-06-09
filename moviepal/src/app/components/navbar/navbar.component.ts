import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { featuredMovie } from '../../interfaces/featured-movie.interface';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MovieService } from '../../services/movie.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NzIconModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  searchTerm: string = '';
  isUserMenuOpen: boolean = false;
  searchResults: featuredMovie[] = [];
  private searchSubject = new Subject<string>();

  isLoggedIn: boolean = false;
  currentUser: any = null;
  userInitials: string = '';
  
  @ViewChild('userMenuContainer') userMenuContainer!: ElementRef;

  constructor(private router: Router, 
    private movieService: MovieService,
    private authService: AuthService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.doSearch(term);
    })

    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      if(user) {
        this.userInitials = user.username.substring(0, 2).toUpperCase();
      } else{
        this.userInitials = '';
      }
    });
  }

  logout(){
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.router.navigate(['/home']);
  }

  onSearchInput(){
    if(this.searchTerm.length >= 2){
      this.searchSubject.next(this.searchTerm);
    }else{
      this.searchResults = [];
    }
  }

  doSearch(term: string) {
    if (!term || term.length < 2) return;

    this.movieService.getMoviesBySearchTerm(term, 0, 5).subscribe({
      next: (response) => {
        this.searchResults = response.content;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.searchResults = [];
      }
    })
  }

  selectMovie(movie: featuredMovie) {
    this.searchTerm = '';
    this.searchResults = [];
    this.router.navigate(['/movies', movie.id]);
  }

  onSearchClick() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchTerm }
      });
      this.searchTerm = '';
      this.searchResults = [];
    }
  }
  
  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
  
  // Close menu when clicking outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    if (this.isUserMenuOpen && this.userMenuContainer && !this.userMenuContainer.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
    }

    // Close search results if click is outside the search container
    const searchContainer = document.querySelector('.search-container');
    if (this.searchResults.length > 0 && searchContainer && 
        !searchContainer.contains(event.target as Node)) {
      this.searchResults = [];
    }
  }
}
