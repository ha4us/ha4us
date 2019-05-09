import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { VisorWidgetComponent } from './visor-widget.component'

describe('VisorWidgetComponent', () => {
  let component: VisorWidgetComponent
  let fixture: ComponentFixture<VisorWidgetComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorWidgetComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorWidgetComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
