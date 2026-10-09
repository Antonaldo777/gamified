export function insertionSort(input) {
  const values = [...input];
  let comparisons = 0;
  for (let index = 1; index < values.length; index += 1) {
    const current = values[index];
    let cursor = index - 1;
    while (cursor >= 0) {
      comparisons += 1;
      if (values[cursor] <= current) break;
      values[cursor + 1] = values[cursor];
      cursor -= 1;
    }
    values[cursor + 1] = current;
  }
  return { values, comparisons };
}

export function quickSort(input) {
  const values = [...input];
  let comparisons = 0;
  const sort = (low, high) => {
    if (low >= high) return;
    const pivot = values[Math.floor((low + high) / 2)];
    let left = low;
    let right = high;
    while (left <= right) {
      while (left <= high) {
        comparisons += 1;
        if (values[left] >= pivot) break;
        left += 1;
      }
      while (right >= low) {
        comparisons += 1;
        if (values[right] <= pivot) break;
        right -= 1;
      }
      if (left <= right) {
        [values[left], values[right]] = [values[right], values[left]];
        left += 1;
        right -= 1;
      }
    }
    if (low < right) sort(low, right);
    if (left < high) sort(left, high);
  };
  sort(0, values.length - 1);
  return { values, comparisons };
}

export function linearSearch(values, target) {
  let comparisons = 0;
  for (let index = 0; index < values.length; index += 1) {
    comparisons += 1;
    if (values[index] === target) return { index, comparisons };
  }
  return { index: -1, comparisons };
}

export function binarySearch(sortedValues, target) {
  let low = 0;
  let high = sortedValues.length - 1;
  let comparisons = 0;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    comparisons += 1;
    if (sortedValues[middle] === target) return { index: middle, comparisons };
    if (sortedValues[middle] < target) low = middle + 1;
    else high = middle - 1;
  }
  return { index: -1, comparisons };
}
