import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';

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
  
  @ViewChild('userMenuContainer') userMenuContainer!: ElementRef;

  constructor(private router: Router) {}

  onSearchClick() {
    // TODO: Search Logic
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
  }
}
