import {DatePipe} from '@angular/common';
import {Component, Inject} from '@angular/core';
import {AngularFireStorage} from '@angular/fire/storage';
import {FormControl, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Observable} from 'rxjs';

@Component({
  selector: 'context-list',
  templateUrl: 'context-list.html',
  styleUrls: ['context-list.scss']
})
export class ContextList {
  list: string[];

  constructor(private dialogRef: MatDialogRef<ContextList>,
              @Inject(MAT_DIALOG_DATA) public data: {list: string[]},
              private storage: AngularFireStorage) {
    this.list = data.list;
  }
}
