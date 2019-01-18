import {Component, Input, ViewChild, SimpleChanges} from '@angular/core';
import {MatSort, MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';
import {AngularFirestore} from '@angular/fire/firestore';
import {Subscription} from 'rxjs';
import {ParsedResult} from '../results-parser';

export interface ErrorMetadata {
  name: string;
  count: number;
  context: Set<string>;
}
export interface RowData {
  name: string;
  count: number;
  context: string;
  note: string; // Save on data for filter to access
  noteFormControl: FormControl;
}

@Component({
  selector: 'error-count',
  templateUrl: 'error-count.html',
  styleUrls: ['error-count.scss'],
})
export class ErrorCount {
  displayedColumns = ['count', 'name', 'note', 'context'];

  filter = new FormControl();

  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource<RowData>();

  @Input() errors: ParsedResult[]; // Need to update when errors provided

  constructor(private db: AngularFirestore) {}

  /** Collection of subscriptions used for rendering - includes form and db value changes */
  renderErrorSubscriptions: Subscription;

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.filter.valueChanges.subscribe(v => this.dataSource.filter = v);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.errors) {
      this.renderErrors();
    }
  }

  renderErrors() {
    if (this.renderErrorSubscriptions) {
      this.renderErrorSubscriptions.unsubscribe();
    }

    const metadata = new Map<string, ErrorMetadata>();

    this.errors.forEach(e => {
      const name = this.getRelevantName(e.value.log);
      const errorData = metadata.get(name) || {name, count: 0, context: new Set()};

      errorData.count = errorData.count + 1;
      errorData.context.add(e.context[0]);

      metadata.set(name, errorData);
    });

    const data: RowData[] = [];
    metadata.forEach(v => {
      data.push({
        name: v.name,
        count: v.count,
        context: Array.from(v.context).join(', '),
        note: '',
        noteFormControl: new FormControl()
      });
    });
    this.dataSource.data = data;

    this.renderErrorSubscriptions = new Subscription();
    data.forEach(d => {
      const key = this.generateKey(d.name);
      const document = this.db.collection('errors').doc(key);

      const dbValueChangeSub = document.valueChanges().subscribe(value => {
        const note = (value && value['note']) || '';
        d.note = note;
        d.noteFormControl.setValue(note, {emitEvent: false});
      });
      this.renderErrorSubscriptions.add(dbValueChangeSub);

      const formValueChangeSub = d.noteFormControl.valueChanges.subscribe(value => {
        document.set({
          name: d.name,
          key,
          note: value,
        });
      });
      this.renderErrorSubscriptions.add(formValueChangeSub);
    });
  }

  /**
   * Currently the most relevant error name is one that does not include "configurable", so if
   * another error exists, use that. Otherwise default to the first line.
   */
  getRelevantName(log: string[]) {
    for (let i = 0; i < log.length; i++) {
      if (log[i].indexOf('Error:') !== -1 && log[i].indexOf('configurable') === -1) {
        return log[i];
      }
    }

    return log[0];
  }

  getArrayFromSet(s: Set<any>) {
    return Array.from(s);
  }

  generateKey(name: string) {
    let key = 0;

    for (let i = 0; i < name.length; i++) {
      key += (name.charCodeAt(i) * i);
    }

    return `${key}`;
  }
}
