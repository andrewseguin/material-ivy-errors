import { Component, ChangeDetectorRef } from '@angular/core';
import {TestError} from './test-error.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'errors';
  errors: TestError[];

  errorCount = new Map<string, number>();

  constructor(private cd: ChangeDetectorRef) {}

  importFile(input: HTMLInputElement) {
    const file = input.files[0];
    input.value = null;

    const reader = new FileReader();
    reader.onload = e => {
      const errorsJson = JSON.parse(e.target['result']);
      this.errors = [];
      this.cacheErrors([], errorsJson);
      this.cd.detectChanges();
    };
    reader.readAsText(file);
  }

  /**
   * Iterate through the nested JSON of errors to cache the error name and status.
   */
  cacheErrors(context: string[], obj: any) {
    Object.keys(obj).forEach(key => {
      if (key.startsWith('__')) {
        return;
      }

      const currentContext = [...context, key];
      if (obj[key]['log']) {
        if (obj[key]['status'] === 'FAILED') {
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
