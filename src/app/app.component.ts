import {ChangeDetectorRef, Component} from '@angular/core';
import {flattenResults, ParsedResult} from './util/flatten-results.js';
import {readJson} from './util/read-json.js';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  errors: ParsedResult[];
  filteredErrors: ParsedResult[];

  filter = new FormControl();

  constructor(private cd: ChangeDetectorRef) { }

  importFile(input: HTMLInputElement) {
    readJson(input.files[0]).then(json => {
      this.errors = flattenResults(json).filter(result => result.value.status === 'FAILED');
      this.cd.detectChanges();
    });
    input.value = null;
  }
}
