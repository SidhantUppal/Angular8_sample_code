import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDataAccessComponent } from './user-data-access.component';

describe('UserDataAccessComponent', () => {
  let component: UserDataAccessComponent;
  let fixture: ComponentFixture<UserDataAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDataAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDataAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
