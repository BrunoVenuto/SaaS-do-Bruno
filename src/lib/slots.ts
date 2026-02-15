
import { addMinutes, format, isBefore, parse, startOfDay } from "date-fns";


export function generateSlots(
    date: Date,
    durationMin: number,
    availability: any[], // ProfessionalAvailability[]
    existingAppointments: any[], // Appointment[]
    timezone: string = "America/Sao_Paulo"
) {
    const dayOfWeek = format(date, "EEEE").toUpperCase(); // MONDAY, TUESDAY...
    const config = availability.find(a => a.dayOfWeek === dayOfWeek);

    if (!config) return []; // Professional doesn't work on this day

    const slots: string[] = [];

    // Helper to convert "HH:mm" to minutes from midnight
    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    const startMin = timeToMinutes(config.startTime);
    const endMin = timeToMinutes(config.endTime);
    const breakStartMin = config.breakStart ? timeToMinutes(config.breakStart) : null;
    const breakEndMin = config.breakEnd ? timeToMinutes(config.breakEnd) : null;

    let currentMin = startMin;

    // Helper to format Date to "HH:mm" in target timezone
    const getLocalTime = (d: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: timezone
        }).format(d);
    };

    while (currentMin + durationMin <= endMin) {
        const slotStart = currentMin;
        const slotEnd = currentMin + durationMin;

        // Check Break
        let inBreak = false;
        if (breakStartMin !== null && breakEndMin !== null) {
            // Overlap logic: (StartA < EndB) and (EndA > StartB)
            if (slotStart < breakEndMin && slotEnd > breakStartMin) {
                inBreak = true;
            }
        }

        // Check Appointments
        let inConflict = false;
        if (!inBreak) {
            for (const appt of existingAppointments) {
                const apptStartStr = getLocalTime(new Date(appt.startAt));
                const apptEndStr = getLocalTime(new Date(appt.endAt));

                const apptStartMin = timeToMinutes(apptStartStr);
                const apptEndMin = timeToMinutes(apptEndStr);

                // Handle crossing midnight edge case? (Assuming appointments within same day for now)
                // If apptEndMin < apptStartMin, it presumably ends next day.
                // For MVP, we assume booking is within the day or we handle strictly simply 
                // by checking if generated string matches.
                // NOTE: getLocalTime returns "24:00" as "00:00" usually, which breaks logic if we don't handle it.
                // But startOfDay/endOfDay query ensures we only get relevant appts.

                if (slotStart < apptEndMin && slotEnd > apptStartMin) {
                    inConflict = true;
                    break;
                }
            }
        }

        if (!inBreak && !inConflict) {
            // Convert back to HH:mm
            const h = Math.floor(currentMin / 60).toString().padStart(2, "0");
            const m = (currentMin % 60).toString().padStart(2, "0");
            slots.push(`${h}:${m}`);
        }

        currentMin += 30; // Interval step
    }

    return slots;
}

