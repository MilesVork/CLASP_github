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
  // Warehouse spreadsheet: Goods In and Stock Take
  const warehouseSpreadsheet = SpreadsheetApp.openById("1DDKKUDuORKxne3qz_9sl5ubjlSZfPiZ74SfLS3VG5M0");
  const goodsInSheet = warehouseSpreadsheet.getSheetByName("Goods In V2");
  const stockTakeSheet = warehouseSpreadsheet.getSheetByName("Stock Take");

  // Goods in data
  const goodsInData = filterData(goodsInSheet, [3, 40, 9, 10, 23, 29], 15, "Food Contact Packaging");
  console.log("goodsInData length: " + goodsInData.length);
  
  const stockTakeData = filterData(stockTakeSheet, [1, 21, 2, 19, 22, 18], 3, "Food Contact Packaging");
  console.log("stockTakeData length: " + stockTakeData.length);

  // Final data
  const finalData = goodsInData.concat(stockTakeData);

  // Destination/consolidation spreadsheet
  const cSpreadsheet = SpreadsheetApp.openById("1zJkkANYRM0MhL-ZzaWFMugYWTNqFODqgbHiIsO0847o");
  const cSheet = cSpreadsheet.getSheetByName("All Transactions");
  
  // Write in destination sheet
  const cRange = cSheet.getRange(2, 1, finalData.length, finalData[0].length);
  cSheet.getRange(2, 1, finalData.length, finalData[0].length).clearContent();
  cRange.setValues(finalData);
}

function filterData(sheet, columns, filterConditionColumn, filterValue) {
  const numRows = sheet.getLastRow() - 1;
  const allData = sheet.getRange(2, 1, numRows, sheet.getLastColumn()).getValues();
  //console.log("filterData() -> allData: " + allData);

  // Extract the columns specified
  const columnsData = columns.map(colIndex => allData.map(row => row[colIndex - 1]));
  console.log("columnsData: " + columnsData);
  const filterColumnData = allData.map(row => row[filterConditionColumn - 1]);

  // Initialize an array to store DateTime values
  const dateTimeArray = columnsData[1].map((_, i) => {
    let date = new Date(columnsData[2][i]);
    console.log("date: " + date);
    let time = columnsData[3][i];
    console.log("time: " + time);
    if (date instanceof Date && !isNaN(date)) {
      let timeParts = time.split(":");
      if (timeParts.length === 2) {
        date.setHours(timeParts[0], timeParts[1]);
        return date;
      }
    }
    return null;  // If date or time is invalid
  });

  // Filter and combine data
  return columnsData[0].map((_, i) => {
    const row = columnsData.map(col => col[i]);
    row.splice(4, 0, dateTimeArray[i]);  // Insert DateTime at index 4 (5th position)

    // Filter out rows with empty values or invalid filter column
    return row.every(value => value !== "" && value !== null) && filterColumnData[i] === filterValue
      ? row
      : null;
  }).filter(row => row !== null);  // Remove nulls
} */