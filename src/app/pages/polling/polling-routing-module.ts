// polling-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PollingComponent } from './polling.component';

const routes: Routes = [
  {
    path: '',
    component: PollingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PollingRoutingModule { }