import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor(private http: HttpClient) {}

  private config = {
    apiUrl: 'https://api.studentcommunity.example/api/v1',
    production: false
  };

  get apiUrl(): string {
    return this.config.apiUrl;
  }

  get isProduction(): boolean {
    return this.config.production;
  }

  loadConfig(): Promise<void> {
    return this.http.get<{ apiUrl?: string; production?: boolean }>('/api/config') // Add proper type
      .toPromise()
      .then(data => {
        this.config = { ...this.config, ...data };
      })
      .catch(error => {
        console.error('Config loading failed:', error);
      });
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule],  // Import HttpClientModule for standalone component
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class AppComponent {
  constructor(private configService: ConfigService) {}

  ngOnInit() {
    // Load config when the component initializes
    this.configService.loadConfig()
      .then(() => {
        console.log('Config loaded:', this.configService.apiUrl);
      })
      .catch(error => {
        console.error('Error loading config:', error);
      });
  }
}
