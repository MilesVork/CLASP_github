function yieldCalculations() {

    // Get goods in and packing transactions from FCP transactions sheet
    const ss = SpreadsheetApp.openById("1zJkkANYRM0MhL-ZzaWFMugYWTNqFODqgbHiIsO0847o");
    const transactionsSheet = ss.getSheetByName("FCP Transactions");
    const transactionsRange = transactionsSheet.getRange(2, 1, transactionsSheet.getLastRow() - 1, 8);
    let transactionsData = transactionsRange.getValues();

    // Remove empty rows
    transactionsData = transactionsData.filter(row => row.some(cell => cell !== "" && cell !== null));

    // Remove transactions from stock take and empty rows
    transactionsData = transactionsData.filter(row => row[1] !== "Stock Take");

    console.log("transactionData row before reduce method: " + transactionsData);

    // Use a map to group transactionsData by FCP trace code (index 6) and amount (index 7)
    // map represents the accumulator object (Map()) and row represents the current row being processed
    const itemMap = transactionsData.reduce((map, row) => {
        const itemSKU = row[5];
        const itemId = row[6]; // The unique identifier (fcp trace code)
        const amount = row[7];     // The amount in the relevant column
        const transactionType = row[1]; // Type of transaction ("Goods In" or "Packing")

        // Initialize the accumulator for this itemId if not already present
        if (!map.has(itemId)) {
            map.set(itemId, {
                itemSKU,
                amountReceived: 0,
                amountUsed: 0,
                amountLost: 0,
            });
        }

        // Update the accumulators based on the transaction type
        const current = map.get(itemId);

        if (transactionType === "Goods In") {
            current.amountReceived += amount; // Accumulate for amountReceived
            current.amountLost += amount;   // Accumulate for amountLost   (since it's Goods In or Packing)
        } else if (transactionType === "Packing") {
            current.amountUsed += amount;   // Accumulate for amountUsed
            current.amountLost += amount;   // Accumulate for amountLost   (since it's Goods In or Packing)
        }

        return map; // Return the updated accumulator

    }, new Map());

    // Convert the map back to an array of arrays
    const yieldCalculationsResults = Array.from(itemMap, ([itemId, data]) => {
        // Calculate the percentage based on the formula (amountUsed - amountReceived) / amountReceived * 100
        const percentage = data.amountReceived !== 0 // Prevent division by zero
            ? (Math.abs(data.amountUsed) / data.amountReceived) * 100
            : 0;

        // Return the array with the additional percentage
        return [
            data.itemSKU,
            itemId,
            data.amountReceived,
            data.amountUsed,
            data.amountLost,
            percentage
        ];
    });

    const yieldAnalysisResults = yieldAnalysis(yieldCalculationsResults);

    // Get yield calculations sheet
    const yieldSheet = ss.getSheetByName("Yield Calculations");
    yieldSheet.getRange("A2:N").clear()

    // Write the yield calculations results
    if (yieldCalculationsResults.length > 0) {
        yieldSheet.getRange(2, 1, yieldCalculationsResults.length, 6).setValues(yieldCalculationsResults);
    }

    // Write the yield analysis results
    if (yieldAnalysisResults.length > 0) {
        yieldSheet.getRange(2, 10, yieldAnalysisResults.length, 4).setValues(yieldAnalysisResults);
    }

    return yieldCalculationsResults; // Return the calculated results

}

// This function performs a yield analysis per bulk sky: mean, variance and standard variation
function yieldAnalysis(yieldCalculationsResults) {
    // Step 1: Filter out invalid rows
    const validData = yieldCalculationsResults.filter(row => {
        const yieldValue = row[5]; // Extract Yield
        return !isNaN(yieldValue); // Skip negative, zero, null, or NaN
    });
    
    // Step 2: Group by BulkSKU
    const skuMap = validData.reduce((map, row) => {
        const [itemSKU, , , , , yieldValue] = row; // Extract BulkSKU and Yield
        if (!map.has(itemSKU)) {
            map.set(itemSKU, { yields: [] }); // Initialize group with empty array
        }
        const group = map.get(itemSKU);
        group.yields.push(yieldValue); // Collect Yield values
        return map;
    }, new Map());

    // Step 3: Calculate mean, variance, and standard deviation for each BulkSKU
    const yieldAnalysisResults = Array.from(skuMap, ([itemSKU, { yields }]) => {
        const n = yields.length;
        const mean = yields.reduce((sum, value) => sum + value, 0) / n; // Mean
        const variance = yields.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / n; // Variance
        const stdDev = Math.sqrt(variance); // Standard Deviation

        return [itemSKU, mean, variance, stdDev];
    });

    return yieldAnalysisResults;

}
