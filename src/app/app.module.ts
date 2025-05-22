import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

// Import components
import { BooksComponent } from './models/books/books.component';
import { ContributeComponent } from './models/contribute/contribute.component';
import { LinksComponent } from './models/links/links.component';
import { ResourcesComponent } from './models/resources/resources.component';
import { SoftwareComponent } from './models/software/software.component';
import { VideosComponent } from './models/videos/videos.component';
import { ForgetPasswordComponent } from './password/forget-password/forget-password.component';
import { ResetPasswordComponent } from './password/reset-password/reset-password.component';
import { ProfileComponent } from './services/profile/profile.component';
import { AppRoutingModule } from './app.routes';
import { PostCreationComponent } from './services/post-creation/post-creation.component';
import { ClubsComponent } from './pages/clubs/clubs.component';
import { PollingComponent } from './pages/polling/polling.component';


@NgModule({
  declarations: [
    AppComponent,
    ResourcesComponent,
    ContributeComponent,
    BooksComponent,
    VideosComponent,
    LinksComponent,
    SoftwareComponent,
    ForgetPasswordComponent,
    ResetPasswordComponent,
    ProfileComponent,
    ClubsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,  // Use AppRoutingModule for routing instead of declaring routes here
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    PostCreationComponent,
    PollingComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
