import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { Ha4usMediaEditComponent } from './ha4us-media-edit.component'

describe('Ha4usMediaEditComponent', () => {
  let component: Ha4usMediaEditComponent
  let fixture: ComponentFixture<Ha4usMediaEditComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ha4usMediaEditComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(Ha4usMediaEditComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
