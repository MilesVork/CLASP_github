function transformingArrays() {

  const originalArray = [
    ['a1', 'a2', 'a3'],
    ['b1', 'b2', 'b3'],
    ['c1', 'c2', 'c3'],
    ['d1', 'd2', 'd3']
  ];

  const newArray = originalArray[0].map((element, elementIndex) =>
    originalArray.map(row => row[elementIndex])
  );

  console.log(newArray);

}

function transformingArrays2() {

  const originalArray = [
    ['a1', 'a2', 'a3'],
    ['b1', 'b2', 'b3'],
    ['c1', 'c2', 'c3'],
    ['d1', 'd2', 'd3']
  ];

  const newArray = originalArray.map((row, elementIndex) => row.map(element => element[elementIndex])
  );

  console.log(newArray);

}

function filterNullArray() {
  const numbers = [
    [1, 3, 4],
    [null, 4, 3],
    [null, null, null],
    [1, 1, 1]
  ];

  // Use .filter() to keep rows that don't consist entirely of null values
  const cleanNumbers = numbers.filter(row => row.some(element => element !== null));

  console.log(cleanNumbers);
  // Outputs: [[1, 3, 4], [null, 4, 3], [1, 1, 1]]
}

function sliceArray() {

  const originalArray = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

  const updatedArray = originalArray.map(innerArray => innerArray.slice(0, -1));

  console.log(updatedArray);
}