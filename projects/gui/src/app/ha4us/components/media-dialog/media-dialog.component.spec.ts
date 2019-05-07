import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { Ha4usMediaDialogComponent } from './ha4us-media-dialog.component'

describe('Ha4usMediaDialogComponent', () => {
  let component: Ha4usMediaDialogComponent
  let fixture: ComponentFixture<Ha4usMediaDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ha4usMediaDialogComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(Ha4usMediaDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
