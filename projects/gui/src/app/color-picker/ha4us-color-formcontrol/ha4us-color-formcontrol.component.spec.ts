import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { Ha4usColorFormcontrolComponent } from './ha4us-color-formcontrol.component'

describe('Ha4usColorFormcontrolComponent', () => {
  let component: Ha4usColorFormcontrolComponent
  let fixture: ComponentFixture<Ha4usColorFormcontrolComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ha4usColorFormcontrolComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(Ha4usColorFormcontrolComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
