import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleDataAccessComponent } from './role-data-access.component';

describe('RoleDataAccessComponent', () => {
  let component: RoleDataAccessComponent;
  let fixture: ComponentFixture<RoleDataAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleDataAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleDataAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
