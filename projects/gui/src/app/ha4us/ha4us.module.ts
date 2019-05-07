import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatTreeModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatRippleModule,
} from '@angular/material'

import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FlexLayoutModule } from '@angular/flex-layout'

import {
  UsCommonModule,
  UsFormsModule,
  UsLayoutModule,
} from '@ulfalfa/ng-util'
import { ScrollingModule } from '@angular/cdk/scrolling'

import { StoreModule } from '@ngrx/store'
import { EffectsModule } from '@ngrx/effects'
import { ObjectEffects } from './store/object/effects'
import { MediaEffects } from './store/media/effects'

import { reducer } from './store/store'

import { ngfModule } from 'angular-file'

import { MediaDialogComponent } from './components/media-dialog/media-dialog.component'
import { MediaEditComponent } from './components/media-edit/media-edit.component'
import { MediaGalleryComponent } from './components/media-gallery/media-gallery.component'
import { MediaUploadComponent } from './components/media-upload/media-upload.component'
import { MediaComponent } from './components/media/media.component'

import { Ha4usMediaFormcontrolComponent } from './components/ha4us-media-formcontrol/ha4us-media-formcontrol.component'

import { TopicInputComponent } from './components/topic-input/topic-input.component'
import { ObjectSearchComponent } from './components/object-search/object-search.component'
import { ObjectListComponent } from './components/object-list/object-list.component'
import { ObjectEditComponent } from './components/object-edit/object-edit.component'
import { NewTopicComponent } from './components/new-topic/new-topic.component'

import { Ha4usDirective } from './directives/ha4us.directive'
import { Ha4usStatePipe } from './pipes/ha4us-state.pipe'
import { Ha4usObjectPipe } from './pipes/ha4us-object.pipe'

import { TemplatePipe } from './pipes/template.pipe'
import { GroupByPipe } from './pipes/group-by.pipe'
import { GetPipe } from './pipes/get.pipe'
import { Ha4usRolePipe } from './pipes/ha4us-role.pipe'

import { AuthInterceptor } from './interceptors/auth.interceptor'
import { MediaPickerDirective } from './directives/media-picker.directive'
import { ObjectTreeComponent } from './components/object-tree/object-tree.component'
import { ObjectComponent } from './components/object/object.component'
import { TopicPartPipe } from './pipes/topic-part.pipe'
import { ObjectEditDialogComponent } from './components/object-edit-dialog/object-edit-dialog.component'
@NgModule({
  imports: [
    CommonModule,
    UsCommonModule,
    UsLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    UsFormsModule,
    ScrollingModule,
    HttpClientModule,
    ngfModule,

    StoreModule.forFeature('ha4us', reducer),
    EffectsModule.forFeature([MediaEffects, ObjectEffects]),
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSelectModule,
    MatToolbarModule,
    MatTreeModule,
  ],
  declarations: [
    GetPipe,
    GroupByPipe,
    Ha4usDirective,
    Ha4usMediaFormcontrolComponent,
    Ha4usObjectPipe,
    Ha4usStatePipe,
    MediaComponent,
    MediaDialogComponent,
    MediaEditComponent,
    MediaGalleryComponent,
    MediaUploadComponent,
    NewTopicComponent,
    ObjectEditComponent,
    ObjectListComponent,
    ObjectSearchComponent,
    TemplatePipe,
    TopicInputComponent,
    MediaPickerDirective,
    Ha4usRolePipe,
    ObjectTreeComponent,
    ObjectComponent,
    TopicPartPipe,
    ObjectEditDialogComponent,
  ],
  exports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    GetPipe,
    GroupByPipe,
    Ha4usDirective,
    Ha4usMediaFormcontrolComponent,
    Ha4usObjectPipe,
    Ha4usStatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatAutocompleteModule,
    MatTableModule,
    MatTabsModule,
    MediaComponent,
    MediaDialogComponent,
    MediaEditComponent,
    MediaGalleryComponent,
    MatCheckboxModule,
    MediaUploadComponent,
    NewTopicComponent,
    ObjectEditComponent,
    ObjectListComponent,
    ObjectSearchComponent,
    ObjectTreeComponent,
    ReactiveFormsModule,
    TemplatePipe,
    TopicInputComponent,
    UsCommonModule,
    MediaPickerDirective,
    Ha4usRolePipe,
    ObjectComponent,
    TopicPartPipe,
  ],
  entryComponents: [MediaDialogComponent, ObjectEditDialogComponent],
  /*providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],*/
})
export class Ha4usModule {}
