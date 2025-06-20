import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovieResponse } from '../interfaces/movie-response.interface';
import { featuredMovie } from '../interfaces/featured-movie.interface';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MovieCollageComponent } from "../components/movie-carousel/movie-collage.component";
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NzIconModule, MovieCollageComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  constructor (private authService: AuthService) {
    // Fixes error where user information is still displayed but the token is expired
    // Refresh token logic is not handled yet :P
    this.authService.refreshAuthStatus();
  }
  
}
