import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataOptionDisplayComponent } from './data-option-display.component';

describe('DataOptionDisplayComponent', () => {
  let component: DataOptionDisplayComponent;
  let fixture: ComponentFixture<DataOptionDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataOptionDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataOptionDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
