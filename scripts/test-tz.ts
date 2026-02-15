
import { fromZonedTime } from "date-fns-tz";

const timezone = "America/Sao_Paulo";
const startAtStr = "2026-02-18T10:00";

console.log(`Timezone: ${timezone}`);
console.log(`Input: ${startAtStr}`);

const utcDate = fromZonedTime(startAtStr, timezone);
console.log(`Parsed UTC: ${utcDate.toISOString()}`);

// Expectation: 2026-02-18T13:00:00.000Z
if (utcDate.toISOString() === "2026-02-18T13:00:00.000Z") {
    console.log("SUCCESS: Correctly parsed as 10:00 SP time.");
} else {
    console.log("FAIL: Incorrect parsing.");
}
