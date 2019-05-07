import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { Ha4usMediaGalleryComponent } from './ha4us-media-gallery.component'

describe('Ha4usMediaGalleryComponent', () => {
  let component: Ha4usMediaGalleryComponent
  let fixture: ComponentFixture<Ha4usMediaGalleryComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ha4usMediaGalleryComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(Ha4usMediaGalleryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
