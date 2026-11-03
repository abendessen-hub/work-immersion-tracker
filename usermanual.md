# Work Immersion Monitoring System (WIMS) — Official User Manual

**Partner Institutions:** Luis Y. Ferrer Jr. Senior High School • JDVP • Nexus • XDO  
**System Timezone:** Philippine Standard Time (`Asia/Manila`)  
**Platform Architecture:** React (Vite) + TypeScript • Modern Clean & Minimalist Interface

---

### Table of Contents

1. [System Overview & Core Objectives](#1-system-overview--core-objectives)
2. [User Roles & Access Matrix](#2-user-roles--access-matrix)
3. [Quick-Start Workflows by Role](#3-quick-start-workflows-by-role)
4. [Authentication & Account Security](#4-authentication--account-security)
5. [Step-by-Step Card Guides](#5-step-by-step-card-guides)
   - [5.1 Dashboard Navigation & Interface Overview](#51-dashboard-navigation--interface-overview)
   - [5.2 Scan QR (Student Attendance Logging)](#52-scan-qr-student-attendance-logging)
   - [5.3 Attendance Monitoring & Excel Reports](#53-attendance-monitoring--excel-reports)
   - [5.4 Create Student Accounts (Bulk Excel Import)](#54-create-student-accounts-bulk-excel-import)
   - [5.5 Manage References (Location & System Data)](#55-manage-references-location--system-data)
   - [5.6 Generate QR (Partner Company Setup)](#56-generate-qr-partner-company-setup)
   - [5.7 Create Account (General User Provisioning)](#57-create-account-general-user-provisioning)
   - [5.8 Manage Accounts (User Administration & Directory)](#58-manage-accounts-user-administration--directory)
6. [Design Standards & UI Features](#6-design-standards--ui-features)
7. [Troubleshooting & System Messages](#7-troubleshooting--system-messages)

---

## 1. System Overview & Core Objectives

The **Work Immersion Monitoring System (WIMS)** is a centralized web platform designed for Senior High School Work Immersion programs (specifically partnered with **Luis Y. Ferrer Jr. Senior High School**). WIMS streamlines the logging, monitoring, and validation of trainee attendance across partner deployment sites.

By substituting manual paper logbooks with secure, location-verified QR scanning, automated spreadsheet management, and paginated data tables, WIMS guarantees high operational efficiency and data fidelity from student deployment to program completion.

- **Verifiable Attendance Tracking:** Records daily **Time In** and **Time Out** with company-specific QR validation calibrated to Philippine Standard Time (`Asia/Manila`).
- **GPS Location Verification:** Compares each device's current location against a partner company's saved coordinates (`latitude` and `longitude`) before the check-in is accepted.
- **Role-Based Data Privacy:** Students access solely their personal attendance history. Immersion teachers, deployers, and administrators are equipped with live statistics, multi-parameter filters (Date, Section, Company), and one-click Excel (`.xlsx`) report exports.
- **Streamlined Bulk Onboarding:** Enables rapid provisioning of up to 500 student accounts in a single batch using standardized Excel templates.
- **Enforced Account Security:** Mandates password updates upon initial sign-in for newly generated accounts.

---

## 2. User Roles & Access Matrix

WIMS implements role-based access control (RBAC) across four standard access levels:

| System Capability / Card                                               | Student (Level 1) | Teacher (Level 2) | Admin (Level 3) | Deployer (Level 4) |
| :--------------------------------------------------------------------- | :---------------: | :---------------: | :-------------: | :----------------: |
| **Sign In & Session Management**                                       |        Yes        |        Yes        |       Yes       |        Yes         |
| **Mandatory First-Time Password Reset**                                |        Yes        |        No         |       No        |         No         |
| **Scan QR** (Log Daily Time In / Time Out)                             |        Yes        |        Yes        |       Yes       |        Yes         |
| **Attendance** (Personal History & Personal Export)                    |        Yes        |        No         |       No        |         No         |
| **Attendance** (Class / School-wide Filters & Excel Export)            |        No         |        Yes        |       Yes       |        Yes         |
| **Create Student Accounts** (Bulk `.xlsx` Import)                      |        No         |        Yes        |       Yes       |         No         |
| **Manage References — Companies & Sections**                           |        No         |        No         |       Yes       |        Yes         |
| **Manage References — Access References**                              |        No         |        No         |       Yes       |         No         |
| **Generate QR** (Temporary Student Attendance / Company Check-in PNGs) |        Yes        |        No         |       Yes       |        Yes         |
| **Create Account** (Single Account Creation)                           |        No         |        No         |       Yes       |         No         |
| **Manage Accounts** (User Administration & Directory)                  |        No         |        No         |       Yes       |         No         |

---

## 3. Quick-Start Workflows by Role

### For Administrators (Level 3) & Deployers (Level 4)

1. **Configure Reference Locations:** Navigate to **Manage References** to establish partner companies and geographic coordinates (latitude and longitude). Use the built-in search and pagination to browse active companies and sections.
2. **Generate Company QR Codes:** In **Generate QR**, generate and download high-resolution PNG QR codes for each partner company and deliver them to designated immersion sites.
3. **Provision Supervising Staff & Accounts:** In **Create Account**, register accounts for teachers, deployers, or administrators.
4. **Oversee System Accounts:** Use **Manage Accounts** to review user statuses, filter across paginated records, update profile assignments, or reset passwords.
5. **Monitor School-wide Immersion:** Access **Attendance** to audit real-time immersion progress across all sections and companies.

### For Immersion Teachers (Level 2)

1. **Prepare Class Lists:** Open **Create Student Accounts**, download the standardized Excel template (`student-account-template.xlsx`), and input student information. Verify that Section and Company names precisely match active system references.
2. **Bulk Provision Students:** Upload the filled workbook. Download the generated `student-accounts.xlsx` file and securely distribute usernames and temporary passwords to your students.
3. **Daily Attendance Supervision:** Open **Attendance** and filter by **Date**, **Section**, and **Company** to include students with no attendance record for that date. Attendance status appears in the table and downloaded report.
4. **Export Grading Sheets:** Click **Download Attendance Report.xlsx** to produce official reports for academic grading and DepEd compliance records.

### For Students / Trainees (Level 1)

1. **First-Time Sign In:** Log in using your assigned username (`[last 4 LRN digits][lastname]`) and temporary password.
2. **Mandatory Password Reset:** Immediately enter and confirm a personal password with at least 6 characters.
3. **Morning Time In:** Upon arriving at your partner immersion company, open **Scan QR**, tap **Start Camera**, and scan the company's official WIMS QR poster.
4. **Afternoon Time Out:** At the conclusion of your shift, scan the same QR code to record your departure timestamp.
5. **Record a Missed Day:** In **Generate QR**, choose the missed date, generate and download the temporary attendance PNG, then send it to your teacher. A teacher in your section, admin, or deployer can scan the QR from the image or upload the PNG to record it.
6. **Verify Your Hours:** Check the **Attendance** card anytime to track your total logged immersion hours and view your attendance records.

---

## 4. Authentication & Account Security

### 4.1 Signing In to WIMS

1. Open the **WIMS Portal** on any modern desktop or mobile browser.
2. Provide your assigned **Username**:
   - **Student Format:** The last 4 digits of your LRN concatenated with your lowercase legal last name without spaces (e.g., LRN `109876543210` + surname `Dela Cruz` = `3210delacruz`).
   - **Staff Format:** Standard personalized handle (e.g., `henrich_123` or `0401admin`).
3. Enter your **Password**. Click the toggle icon to display the typed characters if needed.
4. Click **Sign In**.

### 4.2 Mandatory First-Time Password Reset (Students & Reset Accounts)

To safeguard student privacy and account integrity:

1. Upon the first successful authentication with a temporary or reset password, the **Change Password** security dialog opens automatically.
2. Enter your **New Password** (minimum 6 characters).
3. Re-enter the exact password in **Confirm New Password**.
4. Click **Change Password** to commit. The system updates your credentials immediately and opens your **Dashboard**.

---

## 5. Step-by-Step Card Guides

### 5.1 Dashboard Navigation & Interface Overview

The WIMS dashboard adopts a clean, professional, and minimalist aesthetic:

- **Header Indicators:** Displays the system title, user greeting, and an identity badge indicating your active portal role (**Student Portal**, **Teacher Portal**, **Admin Portal**, or **Deployer Portal**).
- **Action Cards:** Interactive tiles displaying an intuitive icon, card title, operational description, role badge, and navigation arrow.
- **Return Navigation:** Every sub-card includes a clean ghost **Back** button at the upper right to quickly return to the dashboard.
- **Session Termination:** Click the **Log Out** button at any time to invalidate your active session.

### 5.2 Scan QR (Student Attendance Logging)

- **Access Level:** Students (Level 1), Teachers (Level 2), Admins (Level 3), Deployers (Level 4)
- **Objective:** Students record normal company check-ins; staff record missed student attendance from a temporary QR.

**Operational Steps:**

1. From the dashboard, select **Scan QR**.
2. Students tap **Start Camera**, grant browser camera permission, and scan their assigned company's official WIMS QR code.
3. Staff may scan a temporary student attendance QR with **Start Camera**, or upload the PNG the student sent.
4. A temporary attendance record is saved for the date in the QR with **11:00 AM** time in and **1:00 PM** time out.

**Validation Protocols:**

- **Company Locking:** Each student is registered to a specific immersion company. Scanning a QR code belonging to a different company is blocked with a validation alert.
- **Two-Scan Daily Limit:** Each student is restricted to one arrival and one departure timestamp per calendar day (`Asia/Manila`).
- **GPS Coordinate Check:** If GPS verification is active for the company, the app compares the device's location against the saved company coordinates before allowing the attendance scan.
- **Section Access:** Teachers can record temporary attendance only for students in their assigned section. Admins and deployers may record for any student.
- **Temporary QR safeguards:** The QR is signed by WIMS, cannot be edited to change its student/date, and cannot create a duplicate record for the same student and date.

### 5.3 Attendance Monitoring & Excel Reports

- **Access Level:** All Roles (Interface adapts automatically to role permissions)
- **Objective:** Live attendance metrics, record verification, and spreadsheet export.

#### Student View

- Summarizes personal attendance counters: **Your records**, **Time in recorded**, and **Time out recorded**.
- Displays an interactive list of all immersion dates with verified check-in and check-out timestamps.
- Allows personal spreadsheet export for portfolio documentation.

#### Teacher, Admin, & Deployer View

- Displays aggregate metrics: **Student records**, total **Students**, **Time in recorded**, and **Time out recorded**.
- **Filter Panel Controls:**
  - **Date:** Filter records starting on or matching the selected date. When **Date**, **Section**, and **Company** are all selected, the page matches that exact date and also includes students with no record on it.
  - **Section:** Filter by class section (Teachers are pre-filtered to their assigned section).
  - **Company:** Filter by immersion partner company.
- **Paginated Records:** Browse large attendance lists with status, search input, and pagination buttons (showing 20 records per page). Absent students appear only when all three filters are selected.
- **Exporting to Excel:** When the required filter parameters (**Date**, **Section**, and **Company**) are selected, click **Download Attendance Report.xlsx** to generate the styled spreadsheet with attendance statuses.

**Status Code Definitions:**

- `Attended`: Trainee logged both an arrival scan and a departure scan for the day.
- `No Time Out`: Trainee recorded arrival, but had not recorded departure at report generation time.
- `Absent`: Trainee has no attendance log for the target date.

### 5.4 Create Student Accounts (Bulk Excel Import)

- **Access Level:** Teachers (Level 2) and Admins (Level 3)
- **Objective:** Rapidly provision student accounts in batches of 1 to 500 records.

**Execution Guide:**

1. Open **Create Student Accounts**.
2. Examine the **Company** and **Section** reference tables displayed on-screen. Each table features search and pagination (20 items per page) to easily verify active reference names.
3. Click **Download Template** to obtain `student-account-template.xlsx`.
4. Populate the workbook columns:
   - `LRN` (Text format, minimum 4 digits)
   - `Last Name` (Required)
   - `First Name` (Required)
   - `Middle Name` (Optional, leave blank if none)
   - `Section` (Must match active system Section)
   - `Company` (Must match active system Company)
   - `ContactNumber` (Text format, e.g. `09171234567`)
5. Click **Choose Spreadsheet**, select your filled `.xlsx` file, and verify the record count.
6. Click **Create Accounts & Download XLSX**.
7. The browser automatically downloads `student-accounts.xlsx` containing the newly minted credentials (usernames and temporary passwords) ready for distribution.

### 5.5 Manage References (Location & System Data)

- **Access Level:** Admins (Level 3) can manage companies, sections, and access references. Deployers (Level 4) can manage companies and sections.
- **Objective:** Configure partner companies, saved coordinates, sections, and access reference definitions.

#### Company References

- **Company Name:** Legal/official trade name of the immersion partner.
- **Latitude & Longitude:** Exact GPS coordinates. Click **Use Current Location** to automatically capture device coordinates with high accuracy.
- **Search & List:** Paginated reference cards (20 per page) with search bar, displaying coordinates and **Edit** and **Delete** actions.

#### Section References

- Defines class sections. Sections exist independently so students can be mapped to any company regardless of section.
- Create, search, paginate, edit, and delete section records with instant synchronization across student account creation templates.

#### Access References (Admin Only)

- Displays built-in platform access roles (IDs 1–3 reserved for standard Student, Teacher, Admin, and ID 4 for Deployer).
- Allows creation of custom system role labels when expanding integration scopes.

### 5.6 Generate QR (Partner Company Setup)

- **Access Level:** Students (Level 1), Admins (Level 3), and Deployers (Level 4)
- **Objective:** Students generate temporary attendance QR PNGs; admins and deployers generate company check-in QR codes.

#### Student temporary attendance QR

1. Select **Generate QR** from the dashboard.
2. Choose the missed attendance date. Dates in the future and dates with an existing attendance record are rejected.
3. Click **Generate Temporary QR**, then **Download PNG**.
4. Send the downloaded image to your teacher using a communication app. Your teacher can upload that image in **Scan QR**. Admins and deployers can also record it.

#### Company check-in QR for admins and deployers

1. Select **Generate QR** from the dashboard.
2. Choose the partner company from the dropdown menu.
3. Click **Generate QR Code** to view the preview.
4. Click **Download PNG** to save the graphic.
5. Print or frame the QR code image for display at the partner company's reception or check-in desk.

### 5.7 Create Account (General User Provisioning)

- **Access Level:** Admins (Level 3)
- **Objective:** Create individual user accounts for students, teachers, deployers, or administrators.

1. Select **Create Account** from the dashboard.
2. Complete all required form fields:
   - **Full name:** Complete legal name (e.g., `Juan Dela Cruz`).
   - **Username:** Unique login identifier (lowercase recommended, no spaces).
   - **Section:** Assigned section (or none).
   - **Company:** Assigned company (or none). Section and company are configured independently.
   - **Access reference:** Role to assign to this account (Student, Teacher, Admin, Deployer).
   - **Password:** Initial login password (minimum **6 characters**).
   - **Contact number:** Active mobile number (e.g., `09XX XXX XXXX`).
3. Click **Create Account**. Newly created accounts are prompted to change their password on first sign-in.

### 5.8 Manage Accounts (User Administration & Directory)

- **Access Level:** Admins (Level 3)
- **Objective:** Search, inspect, edit, and remove registered user accounts.
- **Account Registry Table:** Displays Name, Username, Access Role, Section, Company, Contact Number, Password Status (`active` or `temporary`), and Action buttons.
- **Search & Pagination:** Instant search bar filters accounts by name, username, access role, section, company, or contact number, displaying 20 records per page with Previous and Next controls.
- **Account Editing:** Click **Edit** to modify account details or reset passwords. Entering a new password flags the account to prompt for a password change at next login.
- **Account Deletion:** Click **Delete** and confirm to permanently remove an account and its associated attendance history. Self-deletion of the active admin account is prevented.

---

## 6. Design Standards & UI Features

WIMS features an interface centered around minimalism, clarity, and professionalism:

- **High-Contrast Data Presentation:** Table headers feature a distinct, cool background (`#f5f7fb`) with bold, dark slate text (`#3d5278`) and a crisp separating border, preventing color bleeding into content rows.
- **Zebra-Striped Rows with Interactive Hover:** Data rows subtly alternate with `#fafbfd` and elevate on hover (`#f0f4fa`) for scanning ease across dense logs.
- **Pill-Styled Pagination & Toolbar:** Clean, bordered navigation controls (`RecordSearchPagination`) provide search inputs with count indicators and secondary button pills for "Previous" and "Next".
- **Clean Input Elements:** Form inputs, date pickers, select dropdowns, and search bars render with clean white surfaces, subtle blue-gray borders (`#d0ddf0`), and distinct focus rings.
- **Clear Button Hierarchy:**
  - **Primary Buttons:** Bold brand blue (`#1456ce`) with white text and subtle elevation.
  - **Secondary Buttons:** Crisp white surface with subtle blue border (`#c9ddff`) and blue text.
  - **Disabled Buttons:** Distinct muted slate gray (`#e9eff8` background, `#8fa0ba` text) to eliminate confusion between active and inactive states.
- **Responsive Architecture:** Fully responsive grid systems adjust smoothly from wide multi-monitor desktop setups down to mobile smartphone screens used during field monitoring.

---

## 7. Troubleshooting & System Messages

| Notification / Issue                                   | Root Cause                                                                                                      | Resolution Steps                                                                                                                                                          |
| :----------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Invalid username or password`                         | Typographical error in credentials, uppercase letters in student username, or extra spaces.                     | Re-verify that the student username follows the lowercase convention (`[last 4 digits LRN][lastname]`). Use the eye toggle to inspect typed characters before submission. |
| `This company QR does not match your assigned company` | The scanned QR belongs to a different immersion partner than the student's profile assignment.                  | Verify the physical QR code poster. If the student has changed deployment companies, an administrator must update the student's company assignment.                       |
| `Your attendance is already complete for today`        | Both Time In and Time Out scans have already been recorded for the current calendar date (`Asia/Manila`).       | No further action required. The daily shift is logged and verifiable in the **Attendance** card.                                                                          |
| `Missing template columns: ...`                        | One or more column headers in the uploaded Excel file were modified, reordered, or deleted.                     | Click **Download Template** on the **Create Student Accounts** screen to fetch a fresh file and copy student data under the pre-existing header titles.                   |
| `Row X: Section / Company was not found.`              | The company or section name in row `X` does not match active system references.                                 | Check the on-screen reference lists in **Create Student Accounts** or **Manage References** and correct the spelling in the spreadsheet.                                  |
| `Download Attendance Report.xlsx` button disabled      | Required filters (Date, Section, and Company) are incomplete, or the selected filter combination has 0 records. | Ensure a **Date**, **Section**, and **Company** are selected in the filter toolbar and at least one matching record exists in the table.                                  |
| Camera fails to activate in **Scan QR**                | Camera access permission was blocked by the browser, or another software is locking the camera hardware.        | Click the site security/permissions icon in the browser address bar, set **Camera** to **Allow**, refresh the page, and click **Start Camera** again.                     |
| Location error during company setup                    | Browser denied geolocation permission or device GPS is toggled off.                                             | Enable device GPS / Location services and allow browser location access when prompted. Coordinates can also be entered manually into the Latitude and Longitude fields.   |

---

_Work Immersion Monitoring System (WIMS) — Luis Y. Ferrer Jr. Senior High School_
