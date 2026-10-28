# Work Immersion Tracker

A React and TypeScript single-page app built with Vite.

## Requirements

- Node.js 20.19+ (or 22.12+)
- npm

## Run locally with Vite

1. Install the project dependencies:

   ```bash
   npm install
   ```

2. Start the Vite development server:

   ```bash
   npm run dev
   ```

3. Open the local URL printed in the terminal (usually `http://localhost:5173`).

Vite provides hot reload while you edit the app.

### Build and preview

To run the TypeScript checks and create a production build:

```bash
npm run build
```

The built files are written to `dist/`. To serve that build locally:

```bash
npm run preview
```

## Run locally with Vercel

The project includes a `server` script for running the app with Vercel's local development server. Install the Vercel CLI once if it is not already available:

```bash
npm install --global vercel
```

Once you installed the Vercel CLI try running this command to link the enviroment files (In case, you're not the owner of the Vercel project ask the Project Manager to pull the .env.local)

```bash
vercel link
```

After linking your Vercel run this command to get .env.local if it's not already pulled automatically

```bash
vercel env pull .env.local
```

Then, from the project directory, start the local Vercel server:

```bash
npm install
npm run server
```

The `server` script runs `vercel dev --local`. Open the local URL shown in the terminal.

## Deploy to Vercel

### Using the Vercel dashboard

1. Push this project to a Git provider supported by Vercel.
2. In the Vercel dashboard, choose **Add New Project** and import the repository.
3. Select **Vite** as the framework preset, or let Vercel detect it.
4. Use these project settings:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Install command:** `npm install`
5. Deploy. Vercel can build and deploy future updates when you push commits to the connected repository.

### Using the Vercel CLI

Install the CLI if needed, then link and deploy the project:

```bash
npm install --global vercel
vercel
```

Follow the prompts to link the project and create a preview deployment. To deploy to production:

```bash
vercel --prod
```

## Account and attendance setup

Before using spreadsheet account creation, QR check-in, or attendance reports, run
[`database/migrations/001_accounts_attendance.sql`](./database/migrations/001_accounts_attendance.sql)
against the Neon database configured by `DATABASE_URL`. It creates the reference
tables `access_reference`, `company_reference`, `immersion_teacher`, and
`section_reference`, along with `users` and `attendance_record` matching the
provided Neon schema. Existing tables are not altered.

Add reference rows to `section_reference(section_name)` and
`company_reference(company_name)` before importing students. Section/company names
in the workbook match those references without case sensitivity.
`immersion_teacher` is a separate reference entity; it does not create or grant a
teacher login. Access role IDs are looked up by name from `access_reference`.

Student import accepts `.xlsx` workbooks with these headers:
`LRN`, `Last Name`, `First Name`, `Middle Name`, `Section`, `Company`,
`ContactNumber`. A student username and initial password are generated as the
last four LRN digits plus lowercase last name without spaces. LRN and student
names are used only to generate credentials and are not saved. The generated
accounts workbook includes user-table fields and each temporary password;
distribute it securely.
Keep LRN and contact-number cells formatted as text to preserve leading zeros.
Company QR codes record time in on first scan and time out on the next scan for
the signed-in student. Attendance access is restricted server-side to the
student's own rows; teacher/admin reports can filter by date, section, and company.

## Useful scripts

| Command           | Description                               |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the Vite development server         |
| `npm run server`  | Start the local Vercel development server |
| `npm run build`   | Type-check and build the production app   |
| `npm run preview` | Preview the production build locally      |
| `npm run lint`    | Run ESLint                                |
