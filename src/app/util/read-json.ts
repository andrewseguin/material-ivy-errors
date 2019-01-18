export function readJson(file): Promise<JSON> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      resolve(JSON.parse(e.target['result']));
    };
    reader.readAsText(file);
  });
}
