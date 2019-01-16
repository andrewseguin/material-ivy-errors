import {Component, Input, ViewChild} from "@angular/core";
import {TestError} from '../test-error';
import {MatTableDataSource, MatSort, MatPaginator} from '@angular/material';

export interface CountedError {
  error: string;
  count: number;
}

@Component({
  selector: 'error-count',
  templateUrl: 'error-count.html',
  styleUrls: ['error-count.scss'],
})
export class ErrorCount {
  displayedColumns = ['error', 'count'];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: MatTableDataSource<any>;

  @Input() errors: TestError[];

  ngOnInit() {
    const errorCountMap = new Map<string, number>();
    this.errors.forEach(e => {
      const firstErrorLine = e.result.log[0];
      errorCountMap.set(firstErrorLine, (errorCountMap.get(firstErrorLine) || 0) + 1);
    });

    const errorCounts: CountedError[] = [];
    errorCountMap.forEach((v, k) => {
      errorCounts.push({error: k, count: v});
    });
    this.dataSource = new MatTableDataSource(errorCounts);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

  }
}
