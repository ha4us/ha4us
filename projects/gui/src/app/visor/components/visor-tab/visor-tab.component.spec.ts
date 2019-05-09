import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { VisorTabComponent } from './visor-tab.component'

describe('VisorTabComponent', () => {
  let component: VisorTabComponent
  let fixture: ComponentFixture<VisorTabComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorTabComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorTabComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
