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
  flattenResults(json: JSON, context: string[] = []): ParsedResult[] {
    const results = [];

    Object.keys(json).map(key => {
      // Skip any browser error messages
      if (key === '__BROWSER_ERRORS__') {
        return;
      }

      const currentContext = [...context, key];
      if (json[key]['log']) {
        results.push({
          key: currentContext.join(' '),
          context: currentContext,
          value: json[key]
        });
      } else {
        results.push(...this.flattenResults(json[key], currentContext));
      }
    });

    return results;
  }
}
