import {Injectable} from '@angular/core';

export interface ParsedResult {
  key: string;
  context: string[];
  value: {log: string[], status: 'PASSED' | 'SKIPPED' | 'FAILED'};
}

@Injectable({
  providedIn: 'root'
})
export class ResultsParser {
  /**
   * Parse the karma results nested JSON into a flattened results list.
   */
  flattenResults(json: JSON): ParsedResult[] {
    const results = [];
    this.iterateResults(results, [], json);
    return results;
  }

  private iterateResults(results: any[], context: string[], obj: JSON) {
    Object.keys(obj).forEach(key => {
      // Skip any browser error messages
      if (key === '__BROWSER_ERRORS__') {
        return;
      }

      const currentContext = [...context, key];
      if (obj[key]['log']) {
        results.push({
          key: currentContext.join(' '),
          context: currentContext,
          value: obj[key]
        });
      } else {
        this.iterateResults(results, currentContext, obj[key]);
      }
    });
  }
}
