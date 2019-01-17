import {Component, Input, ViewChild} from "@angular/core";
import {MatSort, MatTableDataSource} from '@angular/material';
import {TestError} from '../test-error';
import {FormControl} from '@angular/forms';

export interface ErrorMetadata {
  name: string;
  count: number;
  context: Set<string>;
}
export interface RowData {
  name: string;
  count: number;
  context: string;
}

@Component({
  selector: 'error-count',
  templateUrl: 'error-count.html',
  styleUrls: ['error-count.scss'],
})
export class ErrorCount {
  displayedColumns = ['name', 'context', 'count'];

  filter = new FormControl();

  @ViewChild(MatSort) sort: MatSort;

  dataSource: MatTableDataSource<RowData>;

  @Input() errors: TestError[];

  ngOnInit() {
    const metadata = new Map<string, ErrorMetadata>();

    this.errors.forEach(e => {
      const name = this.getRelevantName(e.result.log);
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
        context: Array.from(v.context).join(', ')
      })
    });
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;

    this.filter.valueChanges.subscribe(v => this.dataSource.filter = v);
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
}
