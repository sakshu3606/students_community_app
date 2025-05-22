// main-app-compo.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from '../navigation/navigation.component';
import { NavigationService } from '../navigation/navigation.service';

@Component({
  selector: 'app-main-app-compo',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NavigationComponent
  ],
  templateUrl: './main-app-compo.component.html',
  styleUrls: ['./main-app-compo.component.css']
})
export class MainAppCompoComponent {
  constructor(
    private navService: NavigationService // Add the NavigationService
  ) {}
  
  goToProfile() {
    this.navService.navigateToProfile(); // Use the correct service
  }
}