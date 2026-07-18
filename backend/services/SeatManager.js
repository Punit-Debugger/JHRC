const Student = require("../models/Student");

class SeatManager {
    constructor() {
        this.occupancyMap = new Map();
    }

    async loadFromDatabase() {
        const approvedStudents = await Student.find({
            status: "Approved",
            seatNumber: { $ne: null },
        })
            .select("seatNumber shifts")
            .lean();

        const nextMap = new Map();

        approvedStudents.forEach((student) => {
            const seatNumber = Number(student.seatNumber);
            if (!Number.isInteger(seatNumber)) {
                return;
            }

            const shifts = Array.isArray(student.shifts)
                ? student.shifts
                : student.shifts
                ? [student.shifts]
                : [];

            const existingShifts = nextMap.get(seatNumber) || [];
            const mergedShifts = [...new Set([...existingShifts, ...shifts])];

            nextMap.set(seatNumber, mergedShifts);
        });

        this.occupancyMap = nextMap;
        return this.occupancyMap;
    }

    getOccupancyMap() {
        return this.occupancyMap;
    }
}

module.exports = new SeatManager();
