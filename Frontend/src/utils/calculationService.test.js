import CalculationService from './calculationService.js';

console.log("Running CalculationService Tests...");

let passed = 0;
let failed = 0;

const assert = (desc, actual, expected) => {
    if (actual === expected) {
        console.log(`✅ ${desc}`);
        passed++;
    } else {
        console.error(`❌ ${desc}: Expected ${expected}, got ${actual}`);
        failed++;
    }
};

const runTests = () => {
    // Format Currency
    assert("Format Currency (Number)", CalculationService.formatCurrency(1000), "$1,000");
    assert("Format Currency (String)", CalculationService.formatCurrency("1000"), "$1,000");
    assert("Format Currency (INR)", CalculationService.formatCurrency(1000, "INR"), "₹1,000");
    assert("Format Currency (Empty)", CalculationService.formatCurrency(""), "-");

    // Format Percentage
    assert("Format Percentage (Number)", CalculationService.formatPercentage(50.123), "50%");
    assert("Format Percentage (String)", CalculationService.formatPercentage("50"), "50%");
    assert("Format Percentage (Empty)", CalculationService.formatPercentage(null), "0%");

    // Days Difference
    const date1 = new Date("2023-01-01");
    const date2 = new Date("2023-01-10");
    assert("Days Difference", CalculationService.calculateDaysDifference(date1, date2), 9);
    assert("Days Difference (Single Argument - to Now)", CalculationService.calculateDaysDifference(new Date()) >= 0, true);

    // Qualifier Status
    assert("Qualifier Status (<90)", CalculationService.checkQualifierStatus(89), false);
    assert("Qualifier Status (=90)", CalculationService.checkQualifierStatus(90), true);
    assert("Qualifier Status (>90)", CalculationService.checkQualifierStatus(91), true);

    // Target Achievement
    assert("Target Achievement", CalculationService.calculateTargetAchievement(500, 1000), 50);
    assert("Target Achievement (Zero Target)", CalculationService.calculateTargetAchievement(500, 0), 0);

    // Achieved Value
    assert("Achieved Value", CalculationService.calculateAchievedValue(1000, 50), 500);

    // Safe Parse Number
    assert("Safe Parse Number (String with comma)", CalculationService.safeParseNumber("1,000"), 1000);
    assert("Safe Parse Number (Invalid)", CalculationService.safeParseNumber("abc"), 0);

    console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed.`);
};

// Only run if executed directly (simple check)
if (process.argv[1] === import.meta.url || process.argv[1].endsWith('calculationService.test.js')) {
    runTests();
}

export default runTests;
