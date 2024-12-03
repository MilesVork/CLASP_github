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

    const yieldMean = getYieldMean();
    const yieldSD = getYieldSD();
    const yieldLowSD = yieldMean - yieldSD;

    const allocationCapacity = [];

    for (let i = 0; i < newBaData.length; i++) {

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