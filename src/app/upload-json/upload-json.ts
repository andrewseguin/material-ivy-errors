import {DatePipe} from '@angular/common';
import {Component} from '@angular/core';
import {AngularFireStorage} from '@angular/fire/storage';
import {FormControl, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material';
import {Observable} from 'rxjs';

@Component({
  selector: 'upload-json',
  templateUrl: 'upload-json.html',
  styleUrls: ['upload-json.scss']
})
export class UploadJson {
  buttonText = 'Select file';
  nameFormControl = new FormControl(getDefaultName(), Validators.required);
  file: File;

  uploadPercent: Observable<number>;

  constructor(private dialogRef: MatDialogRef<UploadJson, string>,
              private storage: AngularFireStorage) { }

  upload() {
    if (!this.file || this.nameFormControl.invalid) {
      return;
    }

    const task = this.storage.upload(this.nameFormControl.value, this.file);
    this.uploadPercent = task.percentageChanges();
    task.then(snapshot => this.dialogRef.close(snapshot.ref.name));
  }

  setFile(input: HTMLInputElement) {
    if (input.value) {
      const filenameTokens = input.value.split(`\\`);
      this.buttonText = filenameTokens[filenameTokens.length - 1];
      this.file = input.files[0];
    } else {
      this.buttonText = 'Select file';
    }
  }
}

function getDefaultName() {
  return new DatePipe('en-us').transform(new Date(), 'y-M-d h:mm:ss a');
}
