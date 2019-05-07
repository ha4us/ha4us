import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorMainComponent } from './visor-main.component';

describe('VisorMainComponent', () => {
  let component: VisorMainComponent;
  let fixture: ComponentFixture<VisorMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
