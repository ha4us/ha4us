import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { Ha4usMediaFormcontrolComponent } from './ha4us-media-formcontrol.component'

describe('Ha4usMediaFormcontrolComponent', () => {
  let component: Ha4usMediaFormcontrolComponent
  let fixture: ComponentFixture<Ha4usMediaFormcontrolComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ha4usMediaFormcontrolComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(Ha4usMediaFormcontrolComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
