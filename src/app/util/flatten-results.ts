export interface ParsedResult {
  relevantExceptionKey: string;
  relevantException: string;
  context: string[];
  value: {log: string[], status: 'PASSED' | 'SKIPPED' | 'FAILED'};
}

export function flattenResults(json: JSON, parentContext: string[] = []): ParsedResult[] {
  const results = [];

  Object.keys(json).map(key => {
    // Skip any browser error messages
    if (key === '__BROWSER_ERRORS__') {
      return;
    }

    const context = [...parentContext, key];
    const log = json[key]['log'];
    if (log) {
      const relevantException = getRelevantException(log);
      results.push({
        relevantExceptionKey: generateKey(relevantException),
        relevantException: relevantException,
        context: context,
        value: json[key]
      });
    } else {
      results.push(...flattenResults(json[key], context));
    }
  });

  return results;
}

  /**
   * Currently the most relevant error name is one that does not include "configurable", so if
   * another error exists, use that. Otherwise default to the first line.
   */
function getRelevantException(log: string[]) {
  for (let i = 0; i < log.length; i++) {
    if (log[i].indexOf('Error:') !== -1 && log[i].indexOf('configurable') === -1) {
      return log[i];
    }
  }

  return log[0];
}

/** Generates a fairly unique number for the provided string. */
function generateKey(name: string = '') {
  let key = 0;

  for (let i = 0; i < name.length; i++) {
    key += (name.charCodeAt(i) * i);
  }

  return `${key}`;
}
