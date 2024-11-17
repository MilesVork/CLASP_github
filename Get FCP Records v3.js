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

/* function getRecords() {

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
  const stockTakeData = filterStockTakeData(stockTakeSheet);
  console.log("stockTakeData length: " + stockTakeData.length);
  const tubPackingData = filterTubPackingData(tubPackingSheet);
  console.log("tubPackingData length: " + tubPackingData.length);

  //Final data
  const finalData = goodsInData.concat(stockTakeData).concat(tubPackingData);

  //Destination/consolidation spreadsheet
  const cSpreadsheet = SpreadsheetApp.openById("1zJkkANYRM0MhL-ZzaWFMugYWTNqFODqgbHiIsO0847o");
  const cSheet = cSpreadsheet.getSheetByName("All Transactions");
  const cRange = cSheet.getRange(2, 1, finalData.length, finalData[0].length);

  //Write in destination sheet
  cSheet.getRange("A2:E").clear();
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

  //Get the number of rows in each sheet
  const numRows = tubPackingSheet.getLastRow() - 1;

  //Retrieve data from each column and store it in an array
  const columnData = columns.map(col => tubPackingSheet.getRange(2, col, numRows, 1).getValues());

  //Filter out empty rows
  const filterEmptyRows = [];
  for (let i = 0; i < numRows; i++) {
    const row = columnData.map(col => col[i][0]);
    //console.log("row: " + row)

    // Filter out rows with empty values in any of the specified columns and where column O has the value "Food Contact Packaging"
    if (row.every(value => value === "" || value === null)) {
      console.log("Every value is '' or null ")
      return  //Skip this row since all values are empty or null
    } else {
      //console.log("This row can pass: " + row);
      filterEmptyRows.push(row); //Include the row if at least one value is non-empty
    }
  }

  const newRows = filterEmptyRows[0].length;
  console.log("newRows: " + newRows);

  // Add an empty column to columnData at index 3 (4th position)
  filterEmptyRows.splice(3, 0, Array(newRows).fill([""]));

  console.log("filterEmptyRows rows: " + filterEmptyRows.length);
  console.log("filterEmptyRows cols: " + filterEmptyRows[0].length);
  console.log("filterEmptyRows: " + filterEmptyRows[3][4000]);

  // Initialize an empty array to store the combined date-time values
  let dateTimeArray = [];
  for (let i = 0; i < newRows; i++) {

    // Parse the date and time
    let date = filterEmptyRows[2][i][0]; // Column I (Date)
    //console.log("tubs date: " + date);
    let time = filterEmptyRows[3][i][0]; // Column J (Time)
    //console.log("tubs time: " + time);

    // If both date and time are present, combine them into a single Date object
    if (date && time) {
      // Combine the date and time into a full Date string
      let dateTimeString = Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), 'yyyy-MM-dd') + ' ' +
        Utilities.formatDate(new Date(time), Session.getScriptTimeZone(), 'HH:mm:ss');
      dateTime = new Date(dateTimeString);
    } else if (date) {
      // Only the date is available, ignore the time
      dateTime = new Date(date);
    } else {
      // Date is missing
      dateTime = "Missing Date";
    }

    // Push the Date object into the array
    dateTimeArray.push(dateTime);

  }

  // Combine data into a single array where each inner array represents a row with data from the selected columns
  const combinedData = [];
  for (let i = 0; i < newRows; i++) {
    const row = filterEmptyRows.map(col => col[i][0]);

    // Insert the DateTime at the 4th index (position 5)
    row.splice(4, 0, dateTimeArray[i]);  // Adds DateTime at index 4 (5th position)

    console.log("combined data filterEmptyRows rows: " + filterEmptyRows.length);
    console.log("combined data filterEmptyRows cols: " + filterEmptyRows[0].length);
    console.log("combined data filterEmptyRows: " + filterEmptyRows[4][4000]);

    combinedData.push(row); //Include the row if at least one value is non-empty

  }

  return combinedData;

}

function filterGoodsInData(goodsInSheet) {

  // Define an array with the column numbers you want to retrieve
  const columns = [3, 40, 9, 10, 19, 23, 29]; // C, AN, I, J, S, W, AC
  const filterConditionColumn = 15;

  // Get the number of rows in the sheet
  const numRows = goodsInSheet.getLastRow() - 1; // Adjusts for header row if you start from row 2

  // Retrieve data from each column and store it in an array
  const columnData = columns.map(col => goodsInSheet.getRange(2, col, numRows, 1).getValues());
  const filterColumnData = goodsInSheet.getRange(2, filterConditionColumn, numRows, 1).getValues();

  // Initialize an empty array to store the combined date-time values
  let dateTimeArray = [];

  // Loop through the data to create Date objects
  for (let i = 0; i < numRows; i++) {
    // Parse the date and time
    let date = columnData[2][i][0]; // Column I (Date)
    //console.log("goodsIn date: " + date);
    let time = columnData[3][i][0]; // Column J (Time)
    //console.log("goodsIn time: " + time);

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

} */



