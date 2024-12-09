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



function shuffle() {
  // Get batch analysis records
  const ss = SpreadsheetApp.openById("1zJkkANYRM0MhL-ZzaWFMugYWTNqFODqgbHiIsO0847o");
  const newBaSheet = ss.getSheetByName("New TCA");
  const newBaRange = newBaSheet.getRange(6, 1, newBaSheet.getLastRow() - 1, 11);
  let newBaData = newBaRange.getValues();

  console.log("newBAData length at the start: " + newBaData.length);

  // Remove empty rows from newBaData
  newBaData = newBaData.filter(row => row.some(element => element !== null && element !== ""));

  console.log("newBAData length after removing empty rows " + newBaData.length);

  // Get range for writing updated newBaData values
  const updatedValuesRange = newBaSheet.getRange(6, 1, newBaData.length, 5);

  const yieldIndex = 5;
  const yieldMean = getYieldMean();
  const yieldSD = getYieldSD();
  const yieldLowSD = yieldMean - yieldSD;

  const allocationCapacity = [];

  for (let i = 0; i < newBaData.length; i++) {

      const currentYield = newBaData[i][yieldIndex];
      const previousYield = i > 0 ? newBaData[i-1][yieldIndex] : null;
      const nextYield = i < newBaData.length - 1 ? newBaData[i + 1][yieldIndex] : null;

      console.log("Allocation Capacity: " + allocationCapacity);
      console.log("Iteration: " + i);
      console.log("Bulk Trace Code: " + newBaData[i][1]);


      // BRANCH 0
      if (newBaData[i][5] < 100 && newBaData[i][5] > yieldLowSD) {
          console.log("BRANCH 0: " + newBaData[i][1] + " is <100 and >(mean-SD)");

          // BRANCH 3

          if (i !== 0) {

              if (newBaData[i - 1][5] > 100) {

                  // BRANCH 7
                  if (newBaData[i][5] < 100 && newBaData[i][5] < yieldMean) {
                      console.log("BRANCH 7: " + newBaData[i][1] + " is <100 and >(mean-SD) and before is >100");

                      // Get iteration and allocation capacity
                      const ac = newBaData[i][7];
                      const iteration = i;
                      allocationCapacity.push([iteration, ac]);

                      const prevIteration = iteration - 1;
                      const prevRa = newBaData[prevIteration][8]; // Get last rellocation amount

                      // BRANCH 13
                      if (ac > prevRa) {
                          console.log("BRANCH 13: " + newBaData[i][1] + " is <100 and <mean and before is >100 and ac > ra");
                          newBaData[prevIteration][3] += prevRa; // Add `ac` to the previous row
                          newBaData[i][3] -= prevRa // Deduct prevRa the amount transfer to the previous batch

                          console.log("newBAData length after deducting 'ra' from the previous row " + newBaData.length);

                          // Slice each inner array to the first 5 elements
                          const updatedValues = newBaData.map(row => row.slice(0, 5));

                          //console.log("updatedValues: " + updatedValues);

                          updatedValuesRange.setValues(updatedValues);
                          return shuffle();

                          // BRANCH 12
                      } else {
                          console.log("BRANCH 12: " + newBaData[i][1] + " is <100 and <mean and before is >100 and ac < ra");
                          newBaData[prevIteration][3] += ac; // Deduct full capacity if it's smaller
                          newBaData[i][3] -= ac // Add back the amount transfer to the previous batch

                          console.log("newBAData length after deducting 'prevAc' from the previous row " + newBaData.length);

                          // Slice each inner array to the first 5 elements
                          const updatedValues = newBaData.map(row => row.slice(0, 5));

                          //console.log("updatedValues: " + updatedValues);

                          updatedValuesRange.setValues(updatedValues);
                          return shuffle();

                      }


                      // BRANCH 6
                  } else {
                      console.log("BRANCH 6: " + newBaData[i][1] + " is <100 and >mean and before is >100");
                      continue
                  }


                  // BRANCH 2
              } else {
                  console.log("BRANCH 2: " + newBaData[i][1] + " is <100 and >(mean-SD) and before is <100");
                  continue

              }

          } else continue
      }

      // BRANCH 1
      if (newBaData[i][5] < 100 && newBaData[i][5] < yieldLowSD) {
          console.log("BRANCH 1: " + newBaData[i][1] + " is <100 and <(mean-SD)");
          // Get iteration and allocation capacity
          const ac = newBaData[i][7];
          const iteration = i;
          allocationCapacity.push([iteration, ac]);

          // BRANCH 5
          if (newBaData[i - 1][5] > 100) {
              console.log("BRANCH 5: " + newBaData[i][1] + " is <100 and <(mean-SD) and before >100");
              const prevIteration = iteration - 1;
              const prevRa = newBaData[prevIteration][8]; // Get last rellocation amount

              // BRANCH 17
              if (ac > prevRa) {
                  newBaData[prevIteration][3] += prevRa; // Add `ac` to the previous row
                  newBaData[i][3] -= prevRa // Deduct prevRa the amount transfer to the previous batch

                  console.log("newBAData length after deducting 'ra' from the previous row " + newBaData.length);

                  // Slice each inner array to the first 5 elements
                  const updatedValues = newBaData.map(row => row.slice(0, 5));

                  //console.log("updatedValues: " + updatedValues);

                  updatedValuesRange.setValues(updatedValues);
                  return shuffle();

                  // BRANCH 16
              } else {
                  newBaData[prevIteration][3] += ac; // Deduct full capacity if it's smaller
                  newBaData[i][3] -= ac // Add back the amount transfer to the previous batch

                  console.log("newBAData length after deducting 'prevAc' from the previous row " + newBaData.length);

                  // Slice each inner array to the first 5 elements
                  const updatedValues = newBaData.map(row => row.slice(0, 5));

                  //console.log("updatedValues: " + updatedValues);

                  updatedValuesRange.setValues(updatedValues);
                  return shuffle();

              }

              // BRANCH 11
          } else continue

          // BRANCH 4
      } else if (newBaData[i][5] > 100) {
          console.log("BRANCH 4: " + newBaData[i][1] + " is >100");
          const ra = newBaData[i][8];
          const iteration = i;

          // BRANCH 8
          if (i !== 0) {
              if (newBaData[i - 1][5] < 100 && newBaData[i - 1][5] < yieldLowSD) {
                  console.log("BRANCH 8: " + newBaData[i][1] + " is >100 and before is <100 and <(mean-SD)");
                  const [prevIteration, prevAc] = allocationCapacity[allocationCapacity.length - 1]; // Get last allocation

                  // BRANCH 15
                  if (prevAc > ra) {
                      newBaData[prevIteration][3] -= ra; // Deduct `ra` from the previous row
                      newBaData[i][3] += ra // Add back the amount transfer to the previous batch

                      console.log("newBAData length after deducting 'ra' from the previous row " + newBaData.length);

                      // Slice each inner array to the first 5 elements
                      const updatedValues = newBaData.map(row => row.slice(0, 5));

                      //console.log("updatedValues: " + updatedValues);

                      updatedValuesRange.setValues(updatedValues);
                      return shuffle();

                      // BRANCH 14
                  } else {
                      newBaData[prevIteration][3] -= prevAc; // Deduct full capacity if it's smaller
                      newBaData[i][3] += prevAc // Add back the amount transfer to the previous batch

                      console.log("newBAData length after deducting 'prevAc' from the previous row " + newBaData.length);

                      // Slice each inner array to the first 5 elements
                      const updatedValues = newBaData.map(row => row.slice(0, 5));

                      console.log("updatedValues: " + updatedValues);

                      updatedValuesRange.setValues(updatedValues);
                      return shuffle();

                  }

                  // BRANCH 9
              } else if (newBaData[i-1][5] < 100 && newBaData[i-1][5] < yieldMean) {
                  console.log("BRANCH 9: " + newBaData[i][1] + " is >100 and before is <100 and <mean");
                  const [prevIteration, prevAc] = allocationCapacity[allocationCapacity.length - 1]; // Get last allocation

                  // BRANCH 19
                  if (prevAc > ra) {
                      console.log("BRANCH 19: " + newBaData[i][1] + " is >100 and before is <100 and <mean and acm > ra");
                      newBaData[prevIteration][3] -= ra; // Deduct `ra` from the previous row
                      newBaData[i][3] += ra // Add back the amount transfer to the previous batch

                      console.log("newBAData length after deducting 'ra' from the previous row " + newBaData.length);

                      // Slice each inner array to the first 5 elements
                      const updatedValues = newBaData.map(row => row.slice(0, 5));

                      console.log("updatedValues: " + updatedValues);

                      updatedValuesRange.setValues(updatedValues);
                      return shuffle();

                      // BRANCH 20
                  } else {
                      console.log("BRANCH 19: " + newBaData[i][1] + " is >100 and before is <100 and <mean and acm < ra");
                      newBaData[prevIteration][3] -= prevAc; // Deduct full capacity if it's smaller
                      newBaData[i][3] += prevAc // Add back the amount transfer to the previous batch

                      console.log("newBAData length after deducting 'prevAc' from the previous row " + newBaData.length);

                      // Slice each inner array to the first 5 elements
                      const updatedValues = newBaData.map(row => row.slice(0, 5));

                      console.log("updatedValues: " + updatedValues);

                      updatedValuesRange.setValues(updatedValues);
                      return shuffle();

                  }

                  // BRANCH 18
              } else {
                  
                  continue
              }






          } else continue



      }

  }


}

