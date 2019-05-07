import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ObjectEditComponent } from './object-edit.component'

describe('ObjectEditComponent', () => {
  let component: ObjectEditComponent
  let fixture: ComponentFixture<ObjectEditComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectEditComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectEditComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
