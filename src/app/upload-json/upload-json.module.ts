import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatRippleModule} from '@angular/material';
import {UploadJson} from './upload-json';

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatProgressBarModule,
    MatInputModule,
    MatButtonModule,
    MatRippleModule,
    ReactiveFormsModule,
  ],
  declarations: [UploadJson],
  entryComponents: [UploadJson],
  exports: [UploadJson]
})
export class UploadJsonModule { }
