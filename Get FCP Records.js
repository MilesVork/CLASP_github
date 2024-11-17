/* 
  Problem: The FCP trace codes in the Packing Record are not accurate. Some records are missing trace codes, some records have trace codes of material that had not arrived yet to the warehouse.

  Consecuences: inventory levels not accurate, batch costing analysis not accurate, traceability lost
  
  Goal: To match the most likely FCP to each packing record.

  How:

  - We need to bring the following records: Goods In, Packing Record, Stock Take
  - We need to order the transacions by date
  - We need a column with the running total of each trace code
  - We need a list of qty received vs. qty used
  - We need to see which records in the Packing Record have trace codes of materials that we had not received yet (unlikely)

*/

//This version of the script re-arranges the columns before making transformations on the data coming from the sheet

//COMMENT w

function getRecords() {

  //Warehouse spreadsheet: Goods In and Stock Take
  const warehouseSpreadsheet = SpreadsheetApp.openById("1DDKKUDuORKxne3qz_9sl5ubjlSZfPiZ74SfLS3VG5M0");
  const goodsInSheet = warehouseSpreadsheet.getSheetByName("Goods In V2");
  const stockTakeSheet = warehouseSpreadsheet.getSheetByName("Stock Take");

  //Production spreadsheet: Packing Record
  const productionSpreadsheet = SpreadsheetApp.openById("1mY5yQUJ92FQ7BLdPlvMgTvbqV6Ch5oqWTVIou2vYNys");
  const lidPackingSheet = productionSpreadsheet.getSheetByName("PR Lid Record");
  const tubPackingSheet = productionSpreadsheet.getSheetByName("PR Container Record");

  //Get records
  const goodsInData = filterGoodsInData(goodsInSheet);
  console.log("goodsInData length: " + goodsInData.length);
  //const stockTakeData = filterStockTakeData(stockTakeSheet);
  //console.log("stockTakeData length: " + stockTakeData.length);
  //const tubPackingData = filterTubPackingData(tubPackingSheet);
  //console.log("tubPackingData length: " + tubPackingData.length);

  //Final data
  //const finalData = goodsInData.concat(stockTakeData).concat(tubPackingData);
  //const finalData = tubPackingData;
  const finalData = goodsInData;

  //Destination/consolidation spreadsheet
  const cSpreadsheet = SpreadsheetApp.openById("1zJkkANYRM0MhL-ZzaWFMugYWTNqFODqgbHiIsO0847o");
  const cSheet = cSpreadsheet.getSheetByName("All Transactions");
  const cRange = cSheet.getRange(2, 1, finalData.length, finalData[0].length);

  //Write in destination sheet
  cSheet.getRange("A2:H").clear();
  cRange.setValues(finalData);


}

function filterLidPackingData(lidPackingSheet) {

  const columns = [2, 15, 3, 18, 11, 12];

  //Get the number of rows in each sheet
  const numRows = lidPackingSheet.getLastRow() - 1; // Adjusts for header row if you start from row 2

  //Retrieve data from each column and store it in an array
  const columnData = columns.map(col => lidPackingSheet.getRange(2, col, numRows, 1).getValues());

}

function check() {
  const productionSpreadsheet = SpreadsheetApp.openById("1mY5yQUJ92FQ7BLdPlvMgTvbqV6Ch5oqWTVIou2vYNys");
  const tubPackingSheet = productionSpreadsheet.getSheetByName("PR Container Record");
  const tubPackingData = filterTubPackingData(tubPackingSheet);


}

function filterTubPackingData(tubPackingSheet) {

  const columns = [2, 15, 3, 18, 11, 12];
  const numRows = tubPackingSheet.getLastRow() - 1;

  //Retrieve data from each column
  const columnData = columns.map(col => tubPackingSheet.getRange(2, col, numRows, 1).getValues());

  //Re-organize the arrays
  const arrangedData = columnData[0]
    .map((element, elementIndex) => columnData.map(row => row[elementIndex])
      .flat()
    );

  // Use .filter() to keep rows that don't consist entirely of null or empty values (filter our empty rows)
  const filteredRows = arrangedData.filter(row => row.some(element => element !== null && element !== ""));

  // Insert an empty array at index 3 for the additional column (4th position)
  filteredRows.forEach(row => row.splice(3, 0, "")); // Adds an empty value at index 3


  const dateTimeArray = filteredRows.map(row => {
    const date = row[2]; // Column I (Date)
    const time = row[3]; // Column J (Time)

    if (date && time) {

      console.log("Date and time exist. Row:");
      console.log(row);

      const dateObj = new Date(date); // Create Date object from date
      const timeObj = new Date(time); // Create Date object from time

      // Calculate the serial number for the date
      const serialDate = (dateObj - new Date(1899, 11, 30)) / (1000 * 60 * 60 * 24);

      // Calculate the fractional part (time as a fraction of the day)
      const serialTime = (timeObj.getHours() * 3600 + timeObj.getMinutes() * 60 + timeObj.getSeconds()) / 86400;

      // Add the date and time serial numbers together
      return serialDate + serialTime;

    } else if (date) {

      //console.log("Only date exist. Row:");
      //console.log(row);

      // If only date exists, create a time set to midnight
      const dateObj = new Date(date);
      const timeObj = new Date(0); // Create Date object for time and set to midnight (00:00:00)

      // Calculate the serial number for the date
      const serialDate = (dateObj - new Date(1899, 11, 30)) / (1000 * 60 * 60 * 24);

      // Calculate the fractional part (time as a fraction of the day)
      const serialTime = (timeObj.getHours() * 3600 + timeObj.getMinutes() * 60 + timeObj.getSeconds()) / 86400;

      return serialDate + serialTime;

    } else {
      console.log("Missing date. Row:");
      console.log(row);
      return "Missing Date";
    }
  });

  // Combine processed data into a final array
  const combinedData = filteredRows.map((row, index) => {
    const rowCopy = [...row];
    rowCopy.splice(4, 0, dateTimeArray[index]); // Inserts the DateTime at index 4
    return rowCopy;
  });

  return combinedData;
}

function filterGoodsInData(goodsInSheet) {

  // Define an array with the column numbers you want to retrieve
  const columns = [3, 40, 9, 10, 19, 23, 29, 15, 7]; // C, AN, I, J, S, W, AC, O, G

  // Get the number of rows in the sheet
  const numRows = goodsInSheet.getLastRow() - 1; // Adjusts for header row if you start from row 2

  //Retrieve data from each column
  const columnData = columns.map(col => goodsInSheet.getRange(2, col, numRows, 1).getValues());

  //Re-organize the arrays
  const arrangedData = columnData[0]
    .map((element, elementIndex) => columnData.map(row => row[elementIndex])
      .flat()
    );

  // Use .filter() to keep rows that don't consist entirely of null or empty values (filter our empty rows)
  const filteredRows = arrangedData.filter(row => row.some(element => element !== null && element !== "") && row[7].includes("Food Contact Packaging") && row[8].includes("Received"));

  // Remove category column
  filteredRows.forEach(row => row.splice(-2, 2));

  const dateTimeArray = filteredRows.map(row => {
    const date = row[2]; // Column I (Date)
    const time = row[3]; // Column J (Time)

    if (date && time) {

      console.log("Date and time exist. Row:");
      console.log(row);

      const dateObj = new Date(date); // Create Date object from date
      const timeObj = new Date(time); // Create Date object from time

      // Calculate the serial number for the date
      const serialDate = (dateObj - new Date(1899, 11, 30)) / (1000 * 60 * 60 * 24);

      // Calculate the fractional part (time as a fraction of the day)
      const serialTime = (timeObj.getHours() * 3600 + timeObj.getMinutes() * 60 + timeObj.getSeconds()) / 86400;

      // Add the date and time serial numbers together
      return serialDate + serialTime;

    } else if (date) {

      //console.log("Only date exist. Row:");
      //console.log(row);

      // If only date exists, create a time set to midnight
      const dateObj = new Date(date);
      const timeObj = new Date(0); // Create Date object for time and set to midnight (00:00:00)

      // Calculate the serial number for the date
      const serialDate = (dateObj - new Date(1899, 11, 30)) / (1000 * 60 * 60 * 24);

      // Calculate the fractional part (time as a fraction of the day)
      const serialTime = (timeObj.getHours() * 3600 + timeObj.getMinutes() * 60 + timeObj.getSeconds()) / 86400;

      return serialDate + serialTime;

    } else {
      console.log("Missing date. Row:");
      console.log(row);
      return "Missing Date";
    }
  });

  // Combine processed data into a final array
  const combinedData = filteredRows.map((row, index) => {
    const rowCopy = [...row];
    rowCopy.splice(4, 0, dateTimeArray[index]); // Inserts the DateTime at index 4
    return rowCopy;
  });

  return combinedData;

}

function filterStockTakeData(stockTakeSheet) {

  // Define an array with the column numbers you want to retrieve
  const columns = [1, 21, 2, 19, 6, 22, 18]; // A, U, B, S, F, V, R
  const filterConditionColumn = 3;

  // Get the number of rows in the sheet
  const numRows = stockTakeSheet.getLastRow() - 1; // Adjusts for header row if you start from row 2

  // Retrieve data from each column and store it in an array
  const columnData = columns.map(col => stockTakeSheet.getRange(2, col, numRows, 1).getValues());
  const filterColumnData = stockTakeSheet.getRange(2, filterConditionColumn, numRows, 1).getValues();

  // Initialize an empty array to store the combined date-time values
  let dateTimeArray = [];

  // Loop through the data to create Date objects
  for (let i = 0; i < numRows; i++) {
    // Parse the date and time
    let date = columnData[2][i][0]; // Column I (Date)
    let time = columnData[3][i][0]; // Column J (Time)

    // If both date and time are present, combine them into a single Date object
    if (date && time) {
      // Combine the date and time into a full Date string
      let dateTimeString = Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), 'yyyy-MM-dd') + ' ' + Utilities.formatDate(new Date(time), Session.getScriptTimeZone(), 'HH:mm:ss');

      // Create a Date object from the combined string
      let dateTime = new Date(dateTimeString);

      // Push the Date object into the array
      dateTimeArray.push(dateTime);
    }
  }

  // Combine data into a single array where each inner array represents a row with data from the selected columns
  const combinedData = [];
  for (let i = 0; i < numRows; i++) {
    const row = columnData.map(col => col[i][0]);
    const filterValue = filterColumnData[i][0];

    // Insert the DateTime at the 4th index (position 5)
    row.splice(4, 0, dateTimeArray[i]);  // Adds DateTime at index 4 (5th position)

    // Filter out rows with empty values in any of the specified columns and where column O has the value "Food Contact Packaging"
    if (row.every(value => value !== "" && value !== null) && filterValue === "Food Contact Packaging") {
      combinedData.push(row);
    }

  }

  return combinedData;

}



