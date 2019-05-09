import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { VisorWidgetlibComponent } from './visor-widgetlib.component'

describe('VisorWidgetlibComponent', () => {
  let component: VisorWidgetlibComponent
  let fixture: ComponentFixture<VisorWidgetlibComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorWidgetlibComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorWidgetlibComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
