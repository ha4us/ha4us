import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorButtonsComponent } from './visor-buttons.component';

describe('VisorButtonsComponent', () => {
  let component: VisorButtonsComponent;
  let fixture: ComponentFixture<VisorButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
