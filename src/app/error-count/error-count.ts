import {Component, Input, SimpleChanges, ViewChild} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {FormControl} from '@angular/forms';
import {MatSort, MatTableDataSource, MatDialog} from '@angular/material';
import {Subscription} from 'rxjs';
import {ParsedResult} from '../util/flatten-results';
import {ContextList} from '../context-list/context-list';

export interface ErrorMetadata {
  relevantExceptionKey: string;
  relevantException: string;
  count: number;
  context: Set<string>;
  contextList: string[];
}

export interface RowData {
  relevantExceptionKey: string;
  relevantException: string;
  count: number;
  context: string;
  contextList: string[];
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

  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource<RowData>();

  @Input() errors: ParsedResult[]; // Need to update when errors provided

  @Input() filter: string;

  constructor(private db: AngularFirestore,
              private dialog: MatDialog) {}

  /** Collection of subscriptions used for rendering - includes form and db value changes */
  renderErrorSubscriptions: Subscription;

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['errors'] && changes['errors'].currentValue !== undefined) {
      this.renderErrors();
    }

    if (changes['filter'] && changes['filter'].currentValue !== undefined) {
      this.dataSource.filter = this.filter || '';
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
    const document = this.db.collection('notes').doc(data.relevantExceptionKey);
    return document.valueChanges().subscribe(value => {
      const note = (value && value['note']) || '';
      data.note = note;
      data.noteFormControl.setValue(note, {emitEvent: false});
    });
  }

  /** Save form value changes on the row's notes */
  saveNoteChanges(data: RowData) {
    const document = this.db.collection('notes').doc(data.relevantExceptionKey);
    return data.noteFormControl.valueChanges.subscribe(value => {
      document.set({
        relevantException: data.relevantException,
        relevantExceptionKey: data.relevantExceptionKey,
        note: value,
      });
    });
  }

  openContextListDialog(list: string[]) {
    this.dialog.open(ContextList, {minWidth: '400px', maxHeight: '80vh', data: {list}});
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
      context: new Set(),
      contextList: []
    };

    errorData.count = errorData.count + 1;
    errorData.context.add(e.context[0]);
    errorData.contextList.push(e.context.join (' '));

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
      contextList: v.contextList,
      note: '',
      noteFormControl: new FormControl()
    });
  });

  return data;
}
