import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoTextFilterComponent } from './auto-text-filter.component';

describe('AutoTextFilterComponent', () => {
  let component: AutoTextFilterComponent;
  let fixture: ComponentFixture<AutoTextFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoTextFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoTextFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
