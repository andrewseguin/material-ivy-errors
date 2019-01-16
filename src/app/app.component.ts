import { Component } from '@angular/core';
import * as ERRORS_JSON from './errors.json';
import {TestError} from './test-error.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'errors';
  errors: TestError[] = [];

  errorCount = new Map<string, number>();

  constructor() {
    this.cacheErrors([], ERRORS_JSON['default']);
    console.log(this.errors[0]);
  }

  /**
   * Iterate through the nested JSON of errors to cache the error name and status.
   */
  cacheErrors(context: string[], obj: any) {
    Object.keys(obj).forEach(key => {
      const currentContext = [...context, key];
      if (obj[key]['log']) {
        if (obj[key]['status'] === 'FAILED' ) {
          this.errors.push({
            key: currentContext.join(' '),
            context: currentContext,
            result: obj[key]
          });
        }
      } else {
        this.cacheErrors(currentContext, obj[key]);
      }
    });
  }
}
