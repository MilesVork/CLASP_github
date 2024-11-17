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

  //Goods in data
  const goodsInData = filterGoodsInData(goodsInSheet);
  console.log("goodsInData lenght: " + goodsInData.length);
  const stockTakeData = filterStockTakeData(stockTakeSheet);
  console.log("stockTakeData lenght: " + stockTakeData.length);

  //Final data
  const finalData = goodsInData.concat(stockTakeData);

  //Destination/consolidation spreadsheet
  const cSpreadsheet = SpreadsheetApp.openById("1zJkkANYRM0MhL-ZzaWFMugYWTNqFODqgbHiIsO0847o");
  const cSheet = cSpreadsheet.getSheetByName("All Transactions");
  const cRange = cSheet.getRange(2, 1, finalData.length, finalData[0].length);

  //Write in destination sheet
  cSheet.getRange("A2:E").clear();
  cRange.setValues(finalData);


}

function filterGoodsInData(goodsInSheet) {

  // Define an array with the column numbers you want to retrieve
  const columns = [3, 40, 9, 10, 23, 29]; // C, AN, I, J, W, AC
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
    console.log("goodsIn date: " + date);
    let time = columnData[3][i][0]; // Column J (Time)
    console.log("goodsIn time: " + time);

    // Ensure both date and time are valid before proceeding
    if (date && time) {
      // Check if the date is in the proper format
      let dateObject = new Date(date);
      if (isNaN(dateObject)) {
        // If the date is invalid, skip to the next iteration
        dateTimeArray.push(null);
        continue;
      }
      
      // Parse the time value and convert it to a Date object using a base date
      let timeParts = time.split(":");
      if (timeParts.length === 2) {
        // If time is in HH:MM format, create a Date object for that time
        let timeObject = new Date(0, 0, 0, timeParts[0], timeParts[1]);
        // Combine the date and time by setting the time on the date object
        dateObject.setHours(timeObject.getHours(), timeObject.getMinutes());
        dateTimeArray.push(dateObject);
      } else {
        // If time format is invalid, skip this entry
        dateTimeArray.push(null);
      }
    } else {
      // If no date or time, push null to keep the array's length consistent
      dateTimeArray.push(null);
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
  const columns = [1, 21, 2, 19, 22, 18]; // A, U, B, S, V, R
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
    let date = columnData[1][i][0]; // Column I (Date)
    let time = columnData[2][i][0]; // Column J (Time)

    // Ensure both date and time are valid before proceeding
    if (date && time) {
      // Check if the date is in the proper format
      let dateObject = new Date(date);
      if (isNaN(dateObject)) {
        // If the date is invalid, skip to the next iteration
        dateTimeArray.push(null);
        continue;
      }
      
      // Parse the time value and convert it to a Date object using a base date
      let timeParts = time.split(":");
      if (timeParts.length === 2) {
        // If time is in HH:MM format, create a Date object for that time
        let timeObject = new Date(0, 0, 0, timeParts[0], timeParts[1]);
        // Combine the date and time by setting the time on the date object
        dateObject.setHours(timeObject.getHours(), timeObject.getMinutes());
        dateTimeArray.push(dateObject);
      } else {
        // If time format is invalid, skip this entry
        dateTimeArray.push(null);
      }
    } else {
      // If no date or time, push null to keep the array's length consistent
      dateTimeArray.push(null);
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



