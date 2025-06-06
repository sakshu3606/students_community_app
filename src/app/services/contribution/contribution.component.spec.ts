import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributionComponent } from './contribution.component';

describe('ContributionComponent', () => {
  let component: ContributionComponent;
  let fixture: ComponentFixture<ContributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContributionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
