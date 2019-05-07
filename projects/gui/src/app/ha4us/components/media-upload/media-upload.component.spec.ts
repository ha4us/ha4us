import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { Ha4usMediaUploadComponent } from './ha4us-media-upload.component'

describe('Ha4usMediaUploadComponent', () => {
  let component: Ha4usMediaUploadComponent
  let fixture: ComponentFixture<Ha4usMediaUploadComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ha4usMediaUploadComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(Ha4usMediaUploadComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
