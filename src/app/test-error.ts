export interface TestError {
  key: string;
  context: string[];
  result: Result;
}

export interface Result {
  log: string[];
}
