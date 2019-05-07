import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorCanvasComponent } from './visor-canvas.component';

describe('VisorCanvasComponent', () => {
  let component: VisorCanvasComponent;
  let fixture: ComponentFixture<VisorCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
