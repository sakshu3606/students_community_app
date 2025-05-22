// polling.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { PollingComponent } from './polling.component';
import { PollFormComponent } from '../../models/poll-form/poll-form.component';
import { PollCardComponent } from '../../models/poll-card/poll-card.component';
import { ChatService } from './chat.service';
import { PollingService } from './polling.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    PollingComponent,
    PollFormComponent,
    PollCardComponent
  ],
  providers: [
    PollingService,
    ChatService
  ],
  exports: [
    PollingComponent
  ]
})
export class PollingModule { }