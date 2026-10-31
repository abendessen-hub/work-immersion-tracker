# Work Immersion Monitoring System (WIMS) — Official User Manual

**Partner Institutions:** Luis Y. Ferrer Jr. Senior High School • JDVP • Nexus • XDO  
**System Timezone:** Philippine Standard Time (`Asia/Manila`)

### Table of Contents
1. [System Overview & Core Objectives](#1-system-overview--core-objectives)
2. [User Roles & Access Matrix](#2-user-roles--access-matrix)
3. [Quick-Start Workflows by Role](#3-quick-start-workflows-by-role)
4. [Authentication & Account Security](#4-authentication--account-security)
5. [Step-by-Step Module Guides](#5-step-by-step-module-guides)
   - [5.1 Dashboard Navigation](#51-dashboard-navigation)
   - [5.2 Scan QR (Student Attendance Logging)](#52-scan-qr-student-attendance-logging)
   - [5.3 Attendance Monitoring & Excel Reports](#53-attendance-monitoring--excel-reports)
   - [5.4 Create Student Accounts (Bulk Excel Import)](#54-create-student-accounts-bulk-excel-import)
   - [5.5 Generate QR (Partner Company Setup)](#55-generate-qr-partner-company-setup)
   - [5.6 Create Teacher Accounts](#56-create-teacher-accounts)
6. [Troubleshooting & System Messages](#6-troubleshooting--system-messages)

---

## 1. System Overview & Core Objectives

The **Work Immersion Monitoring System (WIMS)** is a centralized web platform built to manage, verify, and report Senior High School student attendance across partner immersion companies. By replacing manual paper logbooks with company-specific QR verification and automated spreadsheet workflows, WIMS ensures accurate real-time tracking from deployment through completion.

* **Verifiable Attendance Tracking:** Records daily **Time In** and **Time Out** using company-specific QR codes synchronized to Philippine Standard Time (`Asia/Manila`).
* **Role-Based Data Privacy:** Restricts students to viewing only their personal attendance logs while equipping teachers and administrators with multi-filter analytics and Excel (`.xlsx`) exports.
* **Automated Bulk Onboarding:** Enables teachers and administrators to provision up to 500 student accounts simultaneously via standardized Excel templates.
* **Enforced Account Security:** Requires all newly created student accounts to replace their temporary passwords upon initial sign-in.

---

## 2. User Roles & Access Matrix

WIMS assigns system capabilities based on three hierarchical access levels. A checkmark (`Yes`) indicates the module is visible on the user's Dashboard.

| System Capability / Module | Student (Level 1) | Teacher (Level 2) | Admin (Level 3) |
| :--- | :---: | :---: | :---: |
| **Sign In & Session Management** | Yes | Yes | Yes |
| **Mandatory First-Time Password Reset** | Yes | No | No |
| **Scan QR** (Log Daily Time In / Time Out) | Yes | No | No |
| **Attendance** (Personal History & Export) | Yes | No | No |
| **Attendance** (All Students, Filters & Export) | No | Yes | Yes |
| **Create Student Accounts** (Bulk `.xlsx` Import) | No | Yes | Yes |
| **Generate QR** (Partner Company PNGs) | No | No | Yes |
| **Create Teacher Accounts** | No | No | Yes |

---

## 3. Quick-Start Workflows by Role

**For Administrators (Initial System Setup)**
1. **Generate Company QR Codes:** Open **Generate QR**, select each partner company, download the PNG files, and send them to the respective deployment sites for display.
2. **Onboard Immersion Teachers:** Open **Create Teacher Accounts** and register each supervising teacher.
3. **Provision or Monitor Students:** Assist teachers with bulk student imports or monitor school-wide attendance via the **Attendance** module.

**For Immersion Teachers (Class Setup & Daily Monitoring)**
1. **Bulk-Create Student Accounts:** Open **Create Student Accounts**, download the Excel template, populate your class list (matching exact Section and Company names), upload the file, and distribute the downloaded credential sheet to your students.
2. **Track Daily Deployment:** Open **Attendance**, filter by **Date**, **Section**, and **Company** to check who is `Attended`, `No Time Out`, or `Absent`, and click **Download Attendance Report.xlsx** for official grading records.

**For Students (First Login & Daily Immersion Routine)**
1. **Activate Your Account:** Sign in using your assigned username and temporary password, then complete the mandatory password reset prompt.
2. **Log Daily Attendance:** Upon arriving at your partner company, open **Scan QR** and scan the company's official WIMS QR code to log your **Time In**. Scan the exact same QR code at the end of your shift to log your **Time Out**.
3. **Review Your Hours:** Open **Attendance** anytime to verify your logged timestamps or download your personal `.xlsx` record.

---

## 4. Authentication & Account Security

### 4.1 Signing In to WIMS
1. Open the **WIMS Portal** in your mobile or desktop web browser.
2. Enter your assigned **Username**:
   * **Student Format:** Last 4 digits of your LRN + lowercase last name with spaces removed.
   * **Example:** If LRN is `109876541234` and Last Name is `Dela Cruz`, the username is `1234delacruz`.
3. Enter your **Password**. Click the **eye icon** inside the field if you need to verify what you typed.
4. Click **Sign In**.

### 4.2 Mandatory First-Time Password Change (Students Only)
To protect student privacy, accounts generated via bulk import use temporary passwords that must be changed before accessing the system:

1. Immediately after your first sign-in attempt, the **Change Password** modal will appear on screen.
2. Verify the **Current Password** field (automatically pre-filled from your sign-in).
3. Enter a **New Password** containing **at least 6 characters**.
4. Re-type the exact password in the **Confirm New Password** field.
5. Click **Change Password**. Your credentials will update immediately, and you will be redirected to your **Dashboard**.

---

## 5. Step-by-Step Module Guides

### 5.1 Dashboard Navigation
Once authenticated, the **Dashboard** displays interactive action cards corresponding to your role's permissions.
* **Open a Module:** Click any **Action Card** on the main screen.
* **Return to Dashboard:** Click the **Back** button located at the top-right corner of any module page.
* **End Your Session:** Click **Log Out** at the top-right corner of the Dashboard (always log out when using shared school computers).

### 5.2 Scan QR (Student Attendance Logging)
**Access:** Students (Level 1)  
**Purpose:** Records verifiable daily arrival (**Time In**) and departure (**Time Out**) at the assigned partner company.

**How to Log Attendance:**
1. From the Dashboard, click **Scan QR**.
2. Click **Start Camera** and click **Allow** when your browser asks for camera permissions.
3. Aim your device's camera squarely at your company's official WIMS QR code.
4. Wait for the automatic scan to complete. The camera will turn off automatically and display a status banner:
   * **1st Scan of the Day:** Displays `Time in recorded successfully.` and logs your arrival timestamp.
   * **2nd Scan of the Day:** Displays `Time out recorded successfully.` and logs your departure timestamp.

**Attendance Validation Rules:**
* **Company Lock:** Your account is bound to one designated partner company. Scanning another company's QR code will fail and trigger an error.
* **Two-Scan Daily Limit:** Each student is permitted exactly one **Time In** and one **Time Out** per calendar day (`Asia/Manila`). Any subsequent scan attempts on the same day are automatically blocked.

### 5.3 Attendance Monitoring & Excel Reports
**Access:** All Roles (View and controls adapt to user level)  
**Purpose:** Provides live attendance counters, status tracking, and downloadable Excel (`.xlsx`) reports.

#### A. Student View
1. Select **Attendance** from the Dashboard.
2. Review the top summary counters:
   * **Your records:** Total immersion days logged.
   * **Time in recorded:** Total days with a verified arrival scan.
   * **Time out recorded:** Total days with a verified departure scan.
3. *(Optional)* Select a date in the **Date** picker to filter records on or after that date.
4. Click **Download Attendance Report.xlsx** to save a personal spreadsheet copy of your attendance logs.

#### B. Teacher & Admin View
1. Select **Attendance** from the Dashboard.
2. Review the school-wide summary metrics across the top cards (**Student records**, **Students**, **Time in recorded**, **Time out recorded**).
3. Locate the **Report filters** panel and select values for all three criteria:
   * **Date:** Displays attendance records starting on or after the chosen date.
   * **Section:** Filters students belonging to a specific class section.
   * **Company:** Filters students deployed to a specific partner company.
4. Once **Date**, **Section**, and **Company** are all selected (and matching records exist), the **Download Attendance Report.xlsx** button becomes active. Click it to export the official attendance sheet.

**Understanding Exported Attendance Statuses:**
* `Attended`: The student successfully logged both **Time In** and **Time Out** for the day.
* `No Time Out`: The student logged **Time In**, but did not scan out before the report was generated.
* `Absent`: The student has neither a **Time In** nor a **Time Out** record for the specified date.

### 5.4 Create Student Accounts (Bulk Excel Import)
**Access:** Teachers (Level 2) & Admins (Level 3)  
**Purpose:** Automates the creation of up to 500 student accounts at once using a structured `.xlsx` template.

**Step 1: Check Reference Names & Download the Template**
1. Open **Create Student Accounts** from the Dashboard.
2. Review the on-screen **Company** and **Section** reference tables. Every student row in your spreadsheet must match these exact system names (case-insensitive).
3. Click **Download Template** to save `student-account-template.xlsx` to your computer.

**Step 2: Populate the Spreadsheet**
Fill out each column in `student-account-template.xlsx` without renaming or reordering the header row:

| Column Header | Requirement | Formatting & Validation Rules |
| :--- | :---: | :--- |
| `LRN` | Required | Minimum 4 digits. Format column as Text in Excel so leading zeros are preserved. |
| `Last Name` | Required | Student's legal surname (used to generate the default username). |
| `First Name` | Required | Student's given name. |
| `Middle Name` | Optional | Leave blank if not applicable. |
| `Section` | Required | Must match an existing entry in the on-screen **Section** reference list. |
| `Company` | Required | Must match an existing entry in the on-screen **Company** reference list. |
| `ContactNumber` | Required | Student's mobile number (e.g., `09171234567`). Format column as Text to preserve the leading `0`. |

**Step 3: Upload & Distribute Credentials**
1. Return to the **Create Student Accounts** page and click **Choose Spreadsheet**.
2. Select your saved `.xlsx` file (must contain between **1 and 500** student rows).
3. Confirm that the validation banner reads: `X student row(s) ready to import.`
4. Click **Create Accounts & Download XLSX**.
5. Your browser will automatically download `student-accounts.xlsx`, which contains each student's generated **Username** and **Temporary Password**. Distribute these credentials privately to each student.

### 5.5 Generate QR (Partner Company Setup)
**Access:** Admins Only (Level 3)  
**Purpose:** Produces official, verifiable check-in QR code images for partner immersion sites.

1. Open **Generate QR** from the Dashboard.
2. Open the **Company** dropdown menu and choose the target partner company.
3. Click **Generate QR Code**. The unique QR graphic will render in the preview pane.
4. Click **Download PNG** to save the high-resolution image (named `company-name-check-in-qr.png`).
5. Print or forward the PNG to the partner company supervisor to post at the workplace check-in area.

### 5.6 Create Teacher Accounts
**Access:** Admins Only (Level 3)  
**Purpose:** Registers new Work Immersion Teachers (Access Level 2) in WIMS.

1. Open **Create Teacher Accounts** from the Dashboard.
2. Complete all required form fields:
   * **Full name:** Teacher's complete name (e.g., `Juan Dela Cruz`).
   * **Username:** Unique login identifier (lowercase recommended, no spaces).
   * **Password:** Initial login password (minimum **6 characters**).
   * **Contact number:** Active mobile number (e.g., `09XX XXX XXXX`).
3. Click **Create Account**. Wait for the green confirmation banner verifying that the teacher account is active.

---

## 6. Troubleshooting & System Messages

If you encounter an error banner or disabled button while using WIMS, consult the resolution table below:

| System Message / Issue | Root Cause | Step-by-Step Resolution |
| :--- | :--- | :--- |
| `Invalid username or password` | Credentials contain a typo, uppercase letters in the username, or extra spaces. | Check that your username follows the exact lowercase format (`1234lastname`) with no spaces. Click the eye icon to inspect your password before clicking **Sign In**. |
| `This company QR does not match your assigned company` | The QR code scanned belongs to a different partner company than the one assigned to the student's profile. | Verify that you are scanning the official WIMS QR code designated for your assigned company. If your deployment site changed, ask your teacher or admin to update your company assignment. |
| `Your attendance is already complete for today` | The student has already completed both the **Time In** (1st scan) and **Time Out** (2nd scan) for the current calendar day. | No further action is required. Check the **Attendance** module to confirm both timestamps are recorded. |
| `Missing template columns: ...` | One or more column headers in the uploaded `.xlsx` file were deleted, renamed, or misspelled. | Click **Download Template** on the **Create Student Accounts** page to get a fresh copy, and paste your data values directly under the original headers. |
| `Row X: Section / Company was not found.` | The Section or Company name typed in Row `X` does not match any active record in the WIMS database. | Check the **Company** and **Section** reference tables displayed on the **Create Student Accounts** screen and correct the spelling in Row `X` of your Excel file. |
| `Download Attendance Report.xlsx` button is disabled | Required report filters are unselected (Teacher/Admin view), or the current filter combination returned zero records. | Select a specific **Date**, **Section**, and **Company** in the **Report filters** panel, and verify that at least one student record appears in the table below. |
| Camera fails to start on **Scan QR** | Browser camera permissions were denied, or another app is currently using the camera. | Click the lock/site-settings icon in your browser's address bar, set **Camera** to **Allow**, refresh the page, and click **Start Camera** again. |
