import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainAppCompoComponent } from './main-app-compo.component';

describe('MainAppCompoComponent', () => {
  let component: MainAppCompoComponent;
  let fixture: ComponentFixture<MainAppCompoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainAppCompoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainAppCompoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
