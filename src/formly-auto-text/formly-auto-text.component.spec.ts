import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyAutoTextComponent } from './formly-auto-text.component';

describe('FormlyAutoTextComponent', () => {
  let component: FormlyAutoTextComponent;
  let fixture: ComponentFixture<FormlyAutoTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormlyAutoTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyAutoTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
