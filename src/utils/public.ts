export function formatZero(num: number, len: number) {
  if (String(num).length > len) {
      return num;
  }
  return (Array(len).join('0') + num).slice(-len)
}

export function sleep(millisecond: number) {
  return new Promise((resolve, reject) => setTimeout(resolve, millisecond));
}

export function deepClone(obj: object) {
 return JSON.parse(JSON.stringify(obj));
}

export function localStorageSpace() {
  let allStrings = '';
  for (var key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      allStrings += localStorage[key];
    }
  }
  console.log(allStrings ? "localStorage: " + (3 + ((allStrings.length * 16) / (8 * 1024))) + ' KB' : 'Empty (0 KB)');
}

export function sessionStorageSpace() {
  let allStrings = '';
  for (var key in sessionStorage) {
    if (sessionStorage.hasOwnProperty(key)) {
      allStrings += sessionStorage[key];
    }
  }
  console.log(allStrings ? "sessionStorage: " + (3 + ((allStrings.length * 16) / (8 * 1024))) + ' KB' : 'Empty (0 KB)');
};


