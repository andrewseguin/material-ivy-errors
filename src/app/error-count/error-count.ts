import {Component, Input, ViewChild} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {FormControl} from '@angular/forms';
import {MatSort, MatTableDataSource} from '@angular/material';
import {Subscription} from 'rxjs';
import {ParsedResult} from '../util/flatten-results';

export interface ErrorMetadata {
  relevantExceptionKey: string;
  relevantException: string;
  count: number;
  context: Set<string>;
}

export interface RowData {
  relevantExceptionKey: string;
  relevantException: string;
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
  displayedColumns = ['count', 'relevantException', 'note', 'context'];

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

  ngOnChanges() {
    if (this.errors) {
      this.renderErrors();
    }
  }

  renderErrors() {
    if (this.renderErrorSubscriptions) {
      this.renderErrorSubscriptions.unsubscribe();
    }

    const metadata = getErrorMetadataByRelevantException(this.errors);
    this.dataSource.data = generateDataSourceData(metadata);

    // For each RowData, observe when the notes change in the database as well as save the local
    // notes to the database when the input changes.
    this.renderErrorSubscriptions = new Subscription();
    this.dataSource.data.forEach(rowData => {
      this.renderErrorSubscriptions.add(this.observeStoredNotes(rowData));
      this.renderErrorSubscriptions.add(this.saveNoteChanges(rowData));
    });
  }

  getArrayFromSet(s: Set<any>) {
    return Array.from(s);
  }

  /** Watch for changes to the notes on this row's notes in the DB */
  observeStoredNotes(data: RowData) {
    const document = this.db.collection('errors').doc(data.relevantExceptionKey);
    return document.valueChanges().subscribe(value => {
      const note = (value && value['note']) || '';
      data.note = note;
      data.noteFormControl.setValue(note, {emitEvent: false});
    });
  }

  /** Save form value changes on the row's notes */
  saveNoteChanges(data: RowData) {
    const document = this.db.collection('errors').doc(data.relevantExceptionKey);
    return data.noteFormControl.valueChanges.subscribe(value => {
      document.set({
        relevantException: data.relevantException,
        relevantExceptionKey: data.relevantExceptionKey,
        note: value,
      });
    });
  }
}

/**
 * Gathers up all errors according to their relevant exception and coalesces them into groups with
 * set of contexts and count.
 */
function getErrorMetadataByRelevantException(errors: ParsedResult[]): Map<string, ErrorMetadata> {
  const metadata = new Map<string, ErrorMetadata>();

  errors.forEach(e => {
    const relevantException = e.relevantException;
    const errorData = metadata.get(relevantException) || {
      relevantExceptionKey: e.relevantExceptionKey,
      relevantException: relevantException,
      count: 0,
      context: new Set()
    };

    errorData.count = errorData.count + 1;
    errorData.context.add(e.context[0]);

    metadata.set(relevantException, errorData);
  });

  return metadata;
}

function generateDataSourceData(metadata: Map<string, ErrorMetadata>) {
  const data: RowData[] = [];

  metadata.forEach(v => {
    data.push({
      relevantExceptionKey: v.relevantExceptionKey,
      relevantException: v.relevantException,
      count: v.count,
      context: Array.from(v.context).join(', '),
      note: '',
      noteFormControl: new FormControl()
    });
  });

  return data;
}
