import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgUtilComponent } from './ng-util.component';

describe('NgUtilComponent', () => {
  let component: NgUtilComponent;
  let fixture: ComponentFixture<NgUtilComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgUtilComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgUtilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
