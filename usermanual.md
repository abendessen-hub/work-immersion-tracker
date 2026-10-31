# Work Immersion Monitoring System (WIMS) — User Manual

Welcome to the official User Manual for the **Work Immersion Monitoring System (WIMS)**, developed in partnership with **Luis Y. Ferrer Jr. Senior High School**, **JDVP**, **Nexus**, and **XDO**.

---

## 1. Overview & Purpose

### What is WIMS?
The **Work Immersion Monitoring System (WIMS)** is a centralized, web-based platform designed to streamline and secure the management of Senior High School work immersion programs. It replaces manual paper logbooks with real-time QR code attendance tracking, automated spreadsheet account provisioning, and role-based reporting.

### Core Purpose
- **Accurate Attendance Tracking:** Ensure students check in and check out at their designated partner companies using verifiable, company-specific QR codes and Philippine Standard Time (`Asia/Manila`).
- **Role-Based Access & Privacy:** Protect student records by restricting students to their own attendance data while giving teachers and administrators comprehensive filtering and Excel export tools.
- **Streamlined Onboarding:** Allow immersion teachers and administrators to bulk-generate student accounts via Excel spreadsheets without manually entering credentials one by one.
- **Account Security:** Enforce mandatory password changes upon a student's first sign-in using temporary credentials.

---

## 2. User Roles & Permissions

WIMS operates on three distinct access levels:

| Role | Access Level | Available Features |
| :--- | :---: | :--- |
| **Student** | `1` | • Sign in & mandatory first-time password change<br>• **Scan QR** (Record daily Time In and Time Out)<br>• **Attendance** (View personal attendance history & export personal report) |
| **Teacher** | `2` | • Sign in<br>• **Attendance** (Filter all students by Date, Section, and Company; export `.xlsx` reports)<br>• **Create Student Accounts** (Bulk import students via `.xlsx` template) |
| **Admin** | `3` | • All **Teacher** capabilities<br>• **Generate QR** (Create & download unique check-in QR code PNGs for partner companies)<br>• **Create Teacher Accounts** (Register new immersion teachers) |

---

## 3. Getting Started: Signing In & Account Security

### 3.1 How to Sign In
1. Open the **Work Immersion Monitoring System (WIMS)** portal in your web browser.
2. Enter your assigned **Username**:
   - For students, the default username format is the **last 4 digits of your LRN + lowercase last name without spaces** (e.g., `1234ferrer`).
3. Enter your **Password** (click the eye icon to toggle password visibility if needed).
4. Click **Sign In**.

### 3.2 First-Time Password Change (Mandatory for New Student Accounts)
When signing in for the very first time with a temporary password:
1. A password change modal will automatically appear on screen.
2. Verify your **Current Password** (pre-filled from your sign-in attempt).
3. Enter a **New Password** (must be at least **6 characters** long).
4. Re-enter the password in **Confirm New Password**.
5. Click **Change Password**. You will be automatically signed in and redirected to the main **Dashboard**.

---

## 4. Feature Guide by Module

### 4.1 Dashboard
Once signed in, the **Work Immersion Monitoring System (WIMS)** dashboard displays action cards tailored to your role.
- Click any **Action Card** to open that module.
- Use the **Back** button at the top-right of any sub-page to return to the Dashboard.
- Click **Log Out** at the top-right of the Dashboard to safely end your session.

---

### 4.2 Scan QR (Students)
Used by students at their assigned work immersion company site to log daily attendance.

1. From the Dashboard, select **Scan QR**.
2. Click **Start Camera** and grant browser permission to access your device's camera.
3. Point your camera at your assigned company's official WIMS QR code:
   - **1st Scan of the Day:** Records your **Time In**.
   - **2nd Scan of the Day:** Records your **Time Out**.
4. Once scanned, the camera stops automatically and displays a confirmation message (`Time in recorded successfully.` or `Time out recorded successfully.`).

> **Important Rules:**
> - You can only scan the QR code belonging to your **assigned company**. Scanning another company's QR code will be rejected.
> - Once both **Time In** and **Time Out** are recorded for the current day, additional scans for that day will be blocked.

---

### 4.3 Attendance (All Roles)
Used to monitor live attendance statistics and export spreadsheet reports.

#### For Students:
1. Open **Attendance** from the Dashboard.
2. View your summary tiles (**Your records**, **Time in recorded**, **Time out recorded**).
3. Optional: Select a **Date** filter to view records starting from a specific date.
4. Click **Download Attendance Report.xlsx** to save a copy of your personal attendance table.

#### For Teachers & Admins:
1. Open **Attendance** from the Dashboard.
2. View overall summary metrics (**Student records**, **Students**, **Time in recorded**, **Time out recorded**).
3. Under **Report filters**, refine the list using:
   - **Date** (filters records on or after the selected date)
   - **Section** (filters by school section)
   - **Company** (filters by partner company)
4. To enable the **Download Attendance Report.xlsx** button, select a **Date**, **Section**, and **Company** first, then click the button to export the filtered attendance sheet (including student status: `Attended`, `No Time Out`, or `Absent`).

---

### 4.4 Create Student Accounts (Teachers & Admins)
Used to bulk-create student accounts from an Excel (`.xlsx`) workbook.

1. Open **Create Student Accounts** from the Dashboard.
2. Review the on-screen reference tables listing valid **Company** and **Section** names configured in the system.
3. Click **Download Template** to get `student-account-template.xlsx`.
4. Fill out the spreadsheet columns:
   - `LRN` (Must contain at least 4 digits; format cell as Text to keep leading zeros)
   - `Last Name` (Required)
   - `First Name` (Required)
   - `Middle Name` (Optional)
   - `Section` (Must match a valid Section name from the reference list, case-insensitive)
   - `Company` (Must match a valid Company name from the reference list, case-insensitive)
   - `ContactNumber` (Format cell as Text to keep leading zeros)
5. Click **Choose Spreadsheet** and select your completed `.xlsx` file (supports 1 to 500 student rows per upload).
6. Verify the row count message (`X student row(s) ready to import.`) and click **Create Accounts & Download XLSX**.
7. WIMS will create the accounts and automatically download `student-accounts.xlsx` containing each student's generated **Username** and **Temporary Password**. Distribute these credentials securely to your students.

---

### 4.5 Generate QR (Admins Only)
Used to generate and download official check-in QR codes for partner companies.

1. Open **Generate QR** from the Dashboard.
2. Select a partner company from the **Company** dropdown menu.
3. Click **Generate QR Code**. A preview of the QR code will appear on screen.
4. Click **Download PNG** to save the image file (e.g., `company-name-check-in-qr.png`) for printing or distribution to the immersion site.

---

### 4.6 Create Teacher Accounts (Admins Only)
Used to provision login accounts for Work Immersion Teachers.

1. Open **Create Teacher Accounts** from the Dashboard.
2. Fill in the required fields:
   - **Full name** (e.g., `Juan Dela Cruz`)
   - **Username** (assigned login username)
   - **Password** (must be at least 6 characters)
   - **Contact number** (e.g., `09XX XXX XXXX`)
3. Click **Create Account**. A confirmation message will appear once the teacher account is active.

---

## 5. Troubleshooting & Common Messages

| Message / Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Invalid username or password` | Username or password was typed incorrectly. | Verify your username (lowercase, no spaces) and password. Use the eye icon to check what you typed. |
| `This company QR does not match your assigned company` | A student scanned a QR code belonging to a different partner company. | Scan only the official QR code generated for your assigned immersion company. |
| `Your attendance is already complete for today` | Both Time In and Time Out have already been logged for today. | No further scans are needed until the next immersion day. |
| `Missing template columns: ...` | The uploaded `.xlsx` file has missing or renamed column headers. | Click **Download Template** and copy your student data into the official template columns. |
| `Row X: Section / Company was not found.` | The section or company name in the Excel sheet does not exist in the database. | Check the **Company** and **Section** reference tables shown on the **Create Accounts** page and match the spelling. |
| `Download Attendance Report.xlsx` button is disabled | Filters are incomplete (for Teachers/Admins) or no records match. | Select a **Date**, **Section**, and **Company** filter first, and ensure matching records exist. |

