function getBatchAnalysisData() {
    // Get batch analysis records
    const ss = SpreadsheetApp.openById("1zJkkANYRM0MhL-ZzaWFMugYWTNqFODqgbHiIsO0847o");
    const batchAnalysisSheet = ss.getSheetByName("Trace Code Analysis");
    const batchAnalysisRange = batchAnalysisSheet.getRange(6, 1, batchAnalysisSheet.getLastRow() - 1, 5);
    let batchAnalysisData = batchAnalysisRange.getValues();

    // Get New BA sheet
    const newBaSheet = ss.getSheetByName("New TCA");

    // Write batch analysis data in New BA sheet
    const newBaRange = newBaSheet.getRange(6, 1, batchAnalysisData.length, batchAnalysisData[0].length);
    newBaSheet.getRange("A6:E").clear();
    newBaRange.setValues(batchAnalysisData);

}

function getYieldMean() {

    // Get yield mean
    const ss = SpreadsheetApp.openById("1zJkkANYRM0MhL-ZzaWFMugYWTNqFODqgbHiIsO0847o");
    const newBaSheet = ss.getSheetByName("New TCA");
    const yieldMean = newBaSheet.getRange("N6").getValue();
    return yieldMean
    //console.log("yield mean: " + yieldMean);

}

function getYieldSD() {
    // Get yield standard deviation
    const ss = SpreadsheetApp.openById("1zJkkANYRM0MhL-ZzaWFMugYWTNqFODqgbHiIsO0847o");
    const newBaSheet = ss.getSheetByName("New TCA");
    const yieldSD = newBaSheet.getRange("N8").getValue();
    return yieldSD
    //console.log("yield standard deviation: " + yieldSD);

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
        const previousYield = i > 0 ? newBaData[i - 1][yieldIndex] : null;
        const nextYield = i < newBaData.length - 1 ? newBaData[i + 1][yieldIndex] : null;

        console.log("Allocation Capacity: " + allocationCapacity);
        console.log("Iteration: " + i);
        console.log("Bulk Trace Code: " + newBaData[i][1]);


        if (currentYield > 100) {

            if (previousYield !== null && previousYield < yieldLowSD) {
                console.log(`Iteration ${i}: Current yield > 100, previous yield < yieldLowSD.`);
                // Handle case where previous yield is less than yieldLowSD
                handleCase1(newBaData, i, previousYield);

            }

            if (nextYield !== null && nextYield < yieldMean) {
                console.log(`Iteration ${i}: Current yield > 100, next yield < yieldMean.`);
                // Handle case where next yield is less than yieldMean
                handleCase2(newBaData, i, nextYield);

            } else continue


        }





    }


}

function handleCase1(newBaData, index, previousYield) {
    // Example: Adjust previous row's allocation
    data[index - 1][3] += data[index][3];
    data[index][3] = 0;
}

function handleCase2(newBaData, index, nextYield) {
    // Example: Adjust next row's allocation
    data[index + 1][3] += data[index][3];
    data[index][3] = 0;
}

function handleCase3(newBaData, index) {
    // Example: Reduce current row's allocation
    data[index][3] -= 10; // Deduct arbitrary value as an example
}