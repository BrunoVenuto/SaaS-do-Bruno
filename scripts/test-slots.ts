
import { generateSlots } from "../src/lib/slots";

const date = new Date("2026-02-15T12:00:00Z"); // User is browsing for this date
const durationMin = 30;
const availability = [{
    dayOfWeek: "SUNDAY",
    startTime: "09:00",
    endTime: "19:00",
    breakStart: "12:00",
    breakEnd: "13:00"
}];

// Mock an appointment that should BLOCK 10:00 - 10:30
// If we are in Sao Paulo (UTC-3), 10:00 AM is 13:00 UTC.
// So let's create an appointment at 13:00 UTC.
const existingAppointments = [{
    startAt: new Date("2026-02-15T13:00:00Z"), // 10:00 AM Local
    endAt: new Date("2026-02-15T13:30:00Z")    // 10:30 AM Local
}];

console.log("Testing generateSlots with:");
console.log("Date (UTC):", date.toISOString());
console.log("Appt (UTC):", existingAppointments[0].startAt.toISOString(), "to", existingAppointments[0].endAt.toISOString());

const slots = generateSlots(date, durationMin, availability, existingAppointments, "America/Sao_Paulo");

console.log("Generated Slots:", slots);

const isBooked = !slots.includes("10:00");
console.log("Is 10:00 blocked?", isBooked ? "YES (Correct)" : "NO (FAIL)");

// Test 2: Appointment from 09:30 to 10:30 (Overlap with 10:00 slot)
const appt2 = [{
    startAt: new Date("2026-02-15T12:30:00Z"), // 09:30 AM Local
    endAt: new Date("2026-02-15T13:30:00Z")    // 10:30 AM Local
}];
const slots2 = generateSlots(date, durationMin, availability, appt2, "America/Sao_Paulo");
console.log("Is 10:00 blocked by overlapping appt?", !slots2.includes("10:00") ? "YES" : "NO (FAIL)");
