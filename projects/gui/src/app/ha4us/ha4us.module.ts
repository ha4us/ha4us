import { ScrollingModule } from '@angular/cdk/scrolling'
import { TextFieldModule } from '@angular/cdk/text-field'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
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
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTreeModule,
} from '@angular/material'
import { Ha4usColorPickerModule } from '@app/color-picker'
import {
  UsCommonModule,
  UsFormsModule,
  UsLayoutModule,
} from '@ulfalfa/ng-util'
import { ngfModule } from 'angular-file'
import { Ha4usMediaFormcontrolComponent } from './components/ha4us-media-formcontrol/ha4us-media-formcontrol.component'
import { MediaDialogComponent } from './components/media-dialog/media-dialog.component'
import { MediaEditComponent } from './components/media-edit/media-edit.component'
import { MediaGalleryComponent } from './components/media-gallery/media-gallery.component'
import { MediaUploadComponent } from './components/media-upload/media-upload.component'
import { MediaComponent } from './components/media/media.component'
import { NewTopicComponent } from './components/new-topic/new-topic.component'
import { ObjectEditDialogComponent } from './components/object-edit-dialog/object-edit-dialog.component'
import { ObjectEditComponent } from './components/object-edit/object-edit.component'
import { ObjectListComponent } from './components/object-list/object-list.component'
import { ObjectSearchComponent } from './components/object-search/object-search.component'
import { ObjectTreeComponent } from './components/object-tree/object-tree.component'
import { ObjectComponent } from './components/object/object.component'
import { TopicInputComponent } from './components/topic-input/topic-input.component'
import { YamlInputComponent } from './components/yaml-input/yaml-input.component'
import { Ha4usDirective } from './directives/ha4us.directive'
import { MediaPickerDirective } from './directives/media-picker.directive'
import { TemplateInputDirective } from './directives/template-input.directive'
import { YamlInputDirective } from './directives/yaml-input.directive'
import { GetPipe } from './pipes/get.pipe'
import { GroupByPipe } from './pipes/group-by.pipe'
import { Ha4usObjectPipe } from './pipes/ha4us-object.pipe'
import { Ha4usRolePipe } from './pipes/ha4us-role.pipe'
import { Ha4usStatePipe } from './pipes/ha4us-state.pipe'
import { TemplatePipe } from './pipes/template.pipe'
import { TopicPartPipe } from './pipes/topic-part.pipe'

@NgModule({
  imports: [
    CommonModule,
    UsCommonModule,
    UsLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    UsFormsModule.forFeature([TopicInputComponent, YamlInputComponent]),
    ScrollingModule,
    HttpClientModule,
    ngfModule,
    TextFieldModule,
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
    Ha4usColorPickerModule,
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
    YamlInputComponent,
    YamlInputDirective,
    TemplateInputDirective,
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
    YamlInputComponent,
    YamlInputDirective,
    TemplateInputDirective,
  ],
  entryComponents: [
    MediaDialogComponent,
    ObjectEditDialogComponent,
    TopicInputComponent,
    YamlInputComponent,
  ],
  /*providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],*/
})
export class Ha4usModule {}
