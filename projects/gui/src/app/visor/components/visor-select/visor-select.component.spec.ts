import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { VisorSelectComponent } from './visor-select.component'

describe('VisorSelectComponent', () => {
  let component: VisorSelectComponent
  let fixture: ComponentFixture<VisorSelectComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorSelectComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorSelectComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
