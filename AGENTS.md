# JHRC Library Admission System - Agent Documentation

## Project Overview

The JHRC Library Admission System is a full-stack web application for managing library memberships and seat allocations. It enables students to submit admission forms, upload documents, select seats and shifts, and allows administrators to review and approve applications. The system generates PDF receipts and tracks student status throughout the admission lifecycle.

**Core Purpose:** Manage 65 library seats across 4 time shifts with intelligent conflict detection and booking management.

---

## Technology Stack

### Frontend
- **HTML5, CSS3, JavaScript (Vanilla)**
- **Font Awesome Icons** - UI elements
- **Google Fonts (Poppins)** - Typography
- **No framework** - Direct DOM manipulation and fetch API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js (v5.2.1) - REST API server
- **Database:** MongoDB with Mongoose ODM (v9.6.2)
- **File Storage:** Cloudinary - Cloud storage for document uploads
- **File Upload:** Multer (v2.1.1) + Multer-Storage-Cloudinary (v4.0.0)
- **PDF Generation:** PDFKit (v0.18.0)
- **OCR:** Tesseract.js (v7.0.0) - Optical character recognition for documents
- **CORS:** Cross-Origin Resource Sharing support
- **Environment:** Dotenv for configuration management
- **Dev Tool:** Nodemon for development auto-restart

---

## Architecture

### Layered Structure

```
Client (Frontend HTML/CSS/JS)
        ↓
    Express API
        ↓
    MongoDB (Student Collection)
    Cloudinary (File Storage)
    PDFKit (PDF Generation)
```

### Directory Structure
```
LibraryAdmission/
├── index.html              # Landing page
├── admission.html          # Student admission form
├── status.html             # Student status lookup
├── login.html              # Admin login page
├── admin.html              # Admin dashboard
├── seat-status.html        # Public seat occupancy view
├── package.json            # Frontend dependencies (if any)
└── backend/
    ├── server.js           # Main Express server & API endpoints
    ├── cloudinary.js       # Cloudinary configuration
    ├── generatePDF.js      # PDF receipt generation
    ├── testPDF.js          # PDF generation tests
    ├── package.json        # Backend dependencies
    ├── assets/             # Logo, fonts, receipt templates
    │   ├── logo.png
    │   ├── Poppins-Regular.ttf
    │   └── receipt-bg.jpg
    ├── models/
    │   └── Student.js      # MongoDB Student schema
    ├── pdfs/               # Generated PDF receipts
    └── uploads/            # Temporary file storage
```

---

## Database Schema (Student Model)

### Student Collection Fields

```javascript
{
  // Personal Information
  fullName: String,
  phoneNumber: String,
  email: String,
  dob: String,
  gender: String,
  address: String,
  
  // Seat & Shift Allocation
  seatNumber: {
    type: Number,
    default: null,
    range: 1-65
  },
  shifts: {
    type: [String],
    default: [],
    values: ["S1", "S2", "S3", "S4", "FULL"]
  },
  
  // Membership
  membershipType: String,
  membershipStartDate: String,
  course: String,
  
  // Contact Information
  guardianName: String,
  emergencyContact: String,
  fatherName: String,
  mobileNumber: String,
  
  // Address Details
  city: String,
  state: String,
  pincode: String,
  
  // Documents
  selfiePhoto: String,           // Cloudinary URL
  aadhaarFront: String,          // Cloudinary URL
  aadhaarBack: String,           // Cloudinary URL
  
  // Application Status
  status: {
    type: String,
    default: "Pending",
    values: ["Pending", "Approved", "Rejected"]
  },
  pdfUrl: String,                # Generated receipt URL
  receiptId: String,             # Unique format: JHRC-[timestamp]
  admissionDate: String
}
```

---

## Seat Allocation System

### Core Model: 65-Seat Library

The library has exactly **65 seats** available for allocation.

### Shift System

The library operates on **4 distinct time shifts**:

| Shift | Description |
|-------|-------------|
| **S1** | First time slot (typically morning) |
| **S2** | Second time slot (typically late morning) |
| **S3** | Third time slot (typically afternoon) |
| **S4** | Fourth time slot (typically evening) |
| **FULL** | All 4 shifts combined (S1 + S2 + S3 + S4) |

### Seat-Shift Multiplexing

**Key Rule:** Multiple students can occupy the **same seat** if their shifts **do not conflict**.

**Examples:**
- ✅ Student A (Seat 5, S1) + Student B (Seat 5, S2) = Valid
- ✅ Student A (Seat 10, S1) + Student B (Seat 10, S3) = Valid
- ❌ Student A (Seat 5, S1) + Student B (Seat 5, S1) = Conflict
- ❌ Student A (Seat 5, FULL) + Student B (Seat 5, S2) = Conflict (FULL overlaps S2)

### FULL Shift Handling

When a student books the **FULL** shift:
- Internally converted to: `["S1", "S2", "S3", "S4"]`
- Blocks the seat for all 4 time slots
- No other student can use that seat (regardless of shift)
- Query parameter `?shifts=FULL` expands to all 4 shifts

### Available Seats Calculation

**Algorithm (GET /available-seats):**
1. Retrieve all students from database
2. For each student, normalize their shifts (convert FULL → [S1, S2, S3, S4])
3. Check if student's shifts overlap with requested shifts
4. Mark seat as occupied if overlap detected
5. Return array of unoccupied seat numbers (1-65)

---

## Existing Admission Flow

### Complete Student Journey

```
1. Student Visits admission.html
   ↓
2. Fills Form (personal info, course, documents)
   ↓
3. Selects Seat & Shifts
   ↓
4. POST /admission
   - Uploads Aadhaar & selfie to Cloudinary
   - Validates seat-shift availability
   - Detects conflicts with existing students
   ↓
5. If Valid: Save to MongoDB with status="Pending"
   - Receipt ID generated: JHRC-[6-digit timestamp]
   - Return receiptId to student
   ↓
6. If Invalid: Return conflict error
   ↓
7. Student Gets Receipt ID
   ↓
8. Check Status via status.html
   - Enter Receipt ID
   - Fetch GET /status/:receiptId
   ↓
9. Admin Reviews via admin.html
   - View all pending applications
   - View student details & documents
   ↓
10. Admin Action
    - PUT /approve/:id → status="Approved"
    - DELETE /student/:id → Remove application
    ↓
11. Student Status Changes
    - status.html reflects new status
    - Can download PDF receipt if approved
```

### Admission Form Fields (admission.html)

**Required Fields:**
- Full Name
- Phone Number
- Email
- Date of Birth
- Gender
- Address (Full)
- Seat Number (1-65)
- Shift(s) Selection (S1, S2, S3, S4, or FULL)
- Course
- Membership Type & Start Date
- Guardian Name
- Emergency Contact
- Aadhaar Front (File upload)
- Aadhaar Back (File upload)

**Optional/Auto-Generated:**
- Selfie Photo (from camera or upload)
- Father Name
- Mobile Number
- City, State, Pincode

---

## Receipt Generation

### PDF Receipt System

**Technology:** PDFKit (Node.js PDF generation)

**Process:**
1. After admission approval by admin
2. `GET /download/:receiptId` triggers PDF generation
3. Uses template: `backend/assets/receipt-bg.jpg`
4. Embeds logo: `backend/assets/logo.png`
5. Uses font: `backend/assets/Poppins-Regular.ttf`
6. Fills student data onto receipt template
7. Saves to `backend/pdfs/[timestamp].pdf`
8. Streams PDF to student for download

**Receipt Contents:**
- Student Name
- Receipt ID / Admission Number
- Seat Number
- Shift Assignment(s)
- Admission Date
- Membership Details
- Contact Information
- QR Code (if implemented)
- Library logo & branding

### PDF Generation Function
- **File:** [backend/generatePDF.js](backend/generatePDF.js)
- **Helper Functions:** `drawAddressText()`, `drawParagraphText()`
- **Output:** `backend/pdfs/[timestamp].pdf`

---

## API Endpoints

### Authentication & Admin
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/login` | Admin login | None (TBD) |
| GET | `/logout` | Admin logout | Required |

### Seat Management
| Method | Endpoint | Purpose | Notes |
|--------|----------|---------|-------|
| GET | `/available-seats?shifts=S1,S2` | Get available seats for shifts | Query: shifts (optional) |
| GET | `/api/seat-status` | Get all seat occupancy | Returns all students sorted by seat |
| GET | `/seat-status` | Renders seat status HTML | Serves HTML page |

### Admissions
| Method | Endpoint | Purpose | Multipart |
|--------|----------|---------|-----------|
| POST | `/admission` | Submit admission form | ✅ (aadhaarFront, aadhaarBack) |
| GET | `/students` | Get all student records | Admin only |
| DELETE | `/student/:id` | Delete a student | Admin only |
| PUT | `/student/approve/:id` | Approve student application | Admin only |
| GET | `/status/:receiptId` | Check application status | Public |
| GET | `/download/:receiptId` | Download PDF receipt | Public |
| GET | `/export-students` | Export all students as JSON | Admin (TBD) |

### General
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Server health check |
| GET | `/test-route` | Test endpoint |

---

## Important Constraints & Preservation Rules

### ⚠️ Backward Compatibility

**Critical Requirement:** Any new features or modifications must **NOT** break existing functionality:

1. **Database Schema:** 
   - Do not remove existing fields from Student model
   - New fields must have defaults to work with existing records
   - Migration scripts required if schema changes

2. **API Endpoints:**
   - Do not change existing endpoint paths
   - Do not alter request/response formats
   - New endpoints must use new paths
   - Maintain same error response format

3. **Seat Allocation Logic:**
   - Conflict detection algorithm must remain unchanged
   - FULL shift behavior must remain as-is
   - 65-seat limit is fixed
   - 4-shift model is unchangeable

4. **File Uploads:**
   - Cloudinary configuration must persist
   - PDF generation format must be compatible with existing receipts
   - Storage paths must remain consistent

5. **Status Workflow:**
   - Status values: Pending → Approved/Rejected (immutable)
   - Receipt ID format: JHRC-[timestamp] (unchangeable)
   - Admission Date tracking (unchangeable)

### Other Important Notes

- **Port:** Default 5000, configurable via `PORT` environment variable
- **MongoDB Connection:** Required via `MONGO_URI` environment variable
- **Cloudinary Keys:** Required via `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Deployment:** Currently deployed on Render (https://jhrc.onrender.com)
- **CORS:** Enabled for cross-origin requests
- **Static Files:** `/pdfs` and `/uploads` directories exposed as static routes

---

## Development Guidelines

### Before Making Changes

1. **Review This Document** - Understand the seat/shift system
2. **Check Backward Compatibility** - Will this break existing admissions?
3. **Test Conflict Detection** - Verify seat-shift logic remains correct
4. **Update AGENTS.md** - Document any new features or changes
5. **Test with Existing Data** - Ensure old records work with changes

### Testing Seat Availability

```javascript
// Test scenario: Can Student B take Seat 5, S2?
// If Student A has Seat 5, S1 → YES (no conflict)
// If Student A has Seat 5, S2 → NO (conflict)
// If Student A has Seat 5, FULL → NO (conflict with any shift)
```

### Adding New Features

- Create new API endpoints with unique paths
- Add new database fields with defaults
- Document in this file before implementation
- Test conflict detection after changes
- Ensure PDF generation still works

---

## Quick Reference: Key Files

| File | Purpose |
|------|---------|
| [backend/server.js](backend/server.js) | All API endpoints & core logic |
| [backend/models/Student.js](backend/models/Student.js) | MongoDB schema definition |
| [backend/generatePDF.js](backend/generatePDF.js) | Receipt PDF generation |
| [backend/cloudinary.js](backend/cloudinary.js) | Cloud storage configuration |
| [admission.html](admission.html) | Student submission form |
| [admin.html](admin.html) | Admin dashboard & review panel |
| [status.html](status.html) | Student status checker |
| [seat-status.html](seat-status.html) | Public seat occupancy view |
| [index.html](index.html) | Landing page / home |

---

## Support & Troubleshooting

### Common Issues

**Seat Conflict Error:** Student trying to book occupied seat-shift combination
- **Solution:** Check existing students' shifts for that seat

**Receipt ID Not Generated:** POST /admission returns error
- **Solution:** Verify Cloudinary credentials and file upload permissions

**Status Shows "Pending" Forever:** Student application stuck
- **Solution:** Admin must explicitly approve via PUT /approve/:id

**PDF Download Fails:** GET /download/:receiptId returns 500
- **Solution:** Verify fonts and background image exist in assets/

---

**Last Updated:** 2026-07-16
**Version:** 1.0
**Maintained By:** AI Agent Documentation
