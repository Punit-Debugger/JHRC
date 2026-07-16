/**
 * SEAT ALLOCATION UTILITY MODULE
 * 
 * This module contains all shared logic for seat and shift allocation.
 * It consolidates duplicate logic from GET /available-seats and POST /admission
 * ensuring consistent conflict detection across the application.
 * 
 * BUSINESS RULES (from AGENTS.md):
 * - 65-seat library with 4 shifts (S1, S2, S3, S4)
 * - FULL shift = all 4 shifts combined
 * - Multiple students can share a seat if shifts don't conflict
 * - FULL shift blocks a seat for all 4 time slots
 */

/**
 * NORMALIZE SHIFTS
 * 
 * Converts shift input to internal representation.
 * Expands the FULL shift to its component shifts [S1, S2, S3, S4].
 * 
 * @param {string|string[]|undefined} shifts - Input shifts (may be string, array, or undefined)
 * @returns {string[]} - Normalized array of shifts
 * 
 * EXAMPLES:
 * - normalizeShifts("FULL") → ["S1", "S2", "S3", "S4"]
 * - normalizeShifts(["S1", "FULL"]) → ["S1", "S2", "S3", "S4"]
 * - normalizeShifts(["S1", "S2"]) → ["S1", "S2"]
 * - normalizeShifts(undefined) → []
 */
function normalizeShifts(shifts) {
  // Handle undefined/null
  if (!shifts) {
    return [];
  }

  // Convert single string to array
  let shiftsArray = Array.isArray(shifts) ? shifts : [shifts];

  // Expand FULL shift to all 4 shifts
  if (shiftsArray.includes("FULL")) {
    return ["S1", "S2", "S3", "S4"];
  }

  return shiftsArray;
}

/**
 * CHECK CONFLICT
 * 
 * Detects if two shift sets have any overlap.
 * Used to determine if a requested shift assignment conflicts with existing students.
 * 
 * @param {string[]} existingShifts - Shifts already assigned (normalized)
 * @param {string[]} requestedShifts - Shifts being requested (normalized)
 * @returns {boolean} - true if conflict exists, false if no conflict
 * 
 * ALGORITHM:
 * Two shift sets conflict if they have ANY common shift.
 * 
 * EXAMPLES (all normalized):
 * - checkConflict(["S1"], ["S1"]) → true (same shift = conflict)
 * - checkConflict(["S1"], ["S2"]) → false (different shifts = no conflict)
 * - checkConflict(["S1", "S2"], ["S2", "S3"]) → true (S2 overlaps)
 * - checkConflict(["S1"], ["S2", "S3", "S4"]) → false (completely different)
 */
function checkConflict(existingShifts, requestedShifts) {
  // Check if any requested shift exists in existing shifts
  return requestedShifts.some((shift) => existingShifts.includes(shift));
}

/**
 * CALCULATE AVAILABLE SEATS
 * 
 * Main algorithm for determining which seats are available for requested shifts.
 * Implements the 5-step algorithm from AGENTS.md.
 * 
 * @param {Object[]} students - Array of student records from database
 * @param {string[]} requestedShifts - Normalized shifts being requested
 * @returns {Object} - { availableSeats: number[], occupiedSeats: number[] }
 * 
 * ALGORITHM (from AGENTS.md):
 * 1. Retrieve all students from database ✓ (passed as parameter)
 * 2. For each student, normalize their shifts (convert FULL → [S1, S2, S3, S4])
 * 3. Check if student's shifts overlap with requested shifts
 * 4. Mark seat as occupied if overlap detected
 * 5. Return array of unoccupied seat numbers (1-65)
 * 
 * SEAT ALLOCATION RULES:
 * - Seats are numbered 1-65
 * - A seat is occupied for given shifts if any existing student
 *   in that seat has overlapping shifts
 * - Multiple students can share a seat if their shifts don't overlap
 */
function calculateAvailableSeats(students, requestedShifts) {
  const occupiedSeats = new Set(); // Use Set for O(1) lookup instead of array

  // Step 2 & 3 & 4: For each student, check for conflicts
  students.forEach((student) => {
    if (!student.seatNumber) return; // Skip students without seat assignment

    // Step 2: Normalize student's shifts (convert FULL → [S1, S2, S3, S4])
    const normalizedStudentShifts = normalizeShifts(student.shifts);

    // Step 3: Check if student's shifts overlap with requested shifts
    const hasConflict = checkConflict(normalizedStudentShifts, requestedShifts);

    // Step 4: Mark seat as occupied if overlap detected
    if (hasConflict) {
      occupiedSeats.add(student.seatNumber);
    }
  });

  // Step 5: Build array of unoccupied seat numbers (1-65)
  const availableSeats = [];
  for (let i = 1; i <= 65; i++) {
    if (!occupiedSeats.has(i)) {
      availableSeats.push(i);
    }
  }

  return {
    availableSeats,
    occupiedSeats: Array.from(occupiedSeats),
  };
}

/**
 * VALIDATE SEAT NUMBER
 * 
 * Validates that a seat number is in the valid range (1-65).
 * Business rule: Library has exactly 65 seats.
 * 
 * @param {*} seat - Seat number to validate (may be any type)
 * @returns {Object} - { isValid: boolean, error: string|null }
 * 
 * VALIDATION RULES:
 * - Must be a number
 * - Must be an integer
 * - Must be >= 1
 * - Must be <= 65
 * 
 * EXAMPLES:
 * - validateSeatNumber(5) → { isValid: true, error: null }
 * - validateSeatNumber(1) → { isValid: true, error: null }
 * - validateSeatNumber(65) → { isValid: true, error: null }
 * - validateSeatNumber(0) → { isValid: false, error: "Seat number must be between 1 and 65" }
 * - validateSeatNumber(66) → { isValid: false, error: "Seat number must be between 1 and 65" }
 * - validateSeatNumber("5") → { isValid: false, error: "Seat number must be a number" }
 * - validateSeatNumber(null) → { isValid: false, error: "Seat number is required" }
 * - validateSeatNumber(undefined) → { isValid: false, error: "Seat number is required" }
 */
function validateSeatNumber(seat) {
  // Check if seat is provided
  if (seat === null || seat === undefined || seat === "") {
    return { isValid: false, error: "Seat number is required" };
  }

  // Convert to number if string
  const seatNum = typeof seat === "string" ? Number(seat) : seat;

  // Check if it's a valid number
  if (typeof seatNum !== "number" || isNaN(seatNum)) {
    return { isValid: false, error: "Seat number must be a number" };
  }

  // Check if it's an integer
  if (!Number.isInteger(seatNum)) {
    return {
      isValid: false,
      error: "Seat number must be an integer",
    };
  }

  // Check if it's in valid range (1-65)
  if (seatNum < 1 || seatNum > 65) {
    return {
      isValid: false,
      error: "Seat number must be between 1 and 65",
    };
  }

  return { isValid: true, error: null };
}

/**
 * VALIDATE SHIFTS
 * 
 * Validates that shifts array is valid and non-empty.
 * Business rules: Students must select at least one valid shift.
 * Valid shifts: S1, S2, S3, S4, FULL
 * 
 * @param {*} shifts - Shifts to validate (may be any type)
 * @returns {Object} - { isValid: boolean, error: string|null, shifts: string[] }
 * 
 * VALIDATION RULES:
 * - Must be provided (not null/undefined/empty array)
 * - Must be array or single string
 * - Each shift must be one of: S1, S2, S3, S4, FULL
 * - No duplicate shifts
 * 
 * EXAMPLES:
 * - validateShifts(["S1"]) → { isValid: true, error: null, shifts: ["S1"] }
 * - validateShifts("S1") → { isValid: true, error: null, shifts: ["S1"] }
 * - validateShifts("FULL") → { isValid: true, error: null, shifts: ["S1", "S2", "S3", "S4"] }
 * - validateShifts([]) → { isValid: false, error: "At least one shift must be selected" }
 * - validateShifts(null) → { isValid: false, error: "Shifts must be selected" }
 * - validateShifts(["S1", "INVALID"]) → { isValid: false, error: "Invalid shift: INVALID" }
 * - validateShifts(["FULL", "S1"]) → { isValid: false, error: "FULL shift cannot be combined..." }
 */
function validateShifts(shifts) {
  const validShifts = ["S1", "S2", "S3", "S4", "FULL"];

  // Check if shifts is provided
  if (!shifts || (Array.isArray(shifts) && shifts.length === 0)) {
    return {
      isValid: false,
      error: "At least one shift must be selected",
      shifts: [],
    };
  }

  // Convert single string to array
  const shiftsArray = Array.isArray(shifts) ? shifts : [shifts];

  // Check if empty after conversion
  if (shiftsArray.length === 0) {
    return {
      isValid: false,
      error: "At least one shift must be selected",
      shifts: [],
    };
  }

  // Validate each shift
  for (const shift of shiftsArray) {
    if (!validShifts.includes(shift)) {
      return {
        isValid: false,
        error: `Invalid shift: ${shift}. Valid shifts are: S1, S2, S3, S4, FULL`,
        shifts: [],
      };
    }
  }

  // Remove duplicates
  const uniqueShifts = [...new Set(shiftsArray)];

  // Reject FULL mixed with other shifts (business rule: FULL is exclusive)
  if (uniqueShifts.includes("FULL") && uniqueShifts.length > 1) {
    return {
      isValid: false,
      error: "FULL shift cannot be combined with other shifts. Choose either FULL or specific shifts (S1, S2, S3, S4).",
      shifts: [],
    };
  }

  // Normalize
  const normalizedShifts = normalizeShifts(uniqueShifts);

  return {
    isValid: true,
    error: null,
    shifts: normalizedShifts,
  };
}

/**
 * CHECK CONFLICTS
 * 
 * High-level wrapper that checks if a requested seat/shift combination
 * conflicts with existing student assignments.
 * 
 * @param {Object[]} existingStudents - Array of existing student records for the seat
 * @param {string[]} requestedShifts - Normalized shifts being requested
 * @returns {Object} - { hasConflict: boolean, conflictingStudents: Object[] }
 * 
 * USAGE:
 * Call after validating seat and shifts.
 * Pass students already in that seat to check for conflicts.
 */
function checkConflicts(existingStudents, requestedShifts) {
  const conflictingStudents = [];

  for (const student of existingStudents) {
    const normalizedStudentShifts = normalizeShifts(student.shifts);
    if (checkConflict(normalizedStudentShifts, requestedShifts)) {
      conflictingStudents.push(student);
    }
  }

  return {
    hasConflict: conflictingStudents.length > 0,
    conflictingStudents,
  };
}

// Export all functions
module.exports = {
  normalizeShifts,
  checkConflict,
  calculateAvailableSeats,
  validateSeatNumber,
  validateShifts,
  checkConflicts,
};
