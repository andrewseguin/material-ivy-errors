import {ChangeDetectorRef, Component} from '@angular/core';
import {ParsedResult, ResultsParser} from './results-parser.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'errors';
  errors: ParsedResult[];

  errorCount = new Map<string, number>();

  constructor(private cd: ChangeDetectorRef,
              private resultsParser: ResultsParser) {}

  importFile(input: HTMLInputElement) {
    const file = input.files[0];
    input.value = null;

    const reader = new FileReader();
    reader.onload = e => {
      const resultsJson = JSON.parse(e.target['result']);
      this.errors = this.resultsParser.flattenResults(resultsJson).filter(result => {
        return result.value.status === 'FAILED';
      });
      this.cd.detectChanges();
    };
    reader.readAsText(file);
  }
}
