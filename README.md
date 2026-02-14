# Academic Scheduler Pro

A comprehensive scheduling tool for Department Schedule Developers to match faculty requests with semester course schedules.

## Overview

Academic Scheduler Pro is a web-based application designed to streamline the academic scheduling process for university departments. It facilitates communication between faculty members and schedule developers, allowing for efficient collection of teaching preferences and management of the master schedule.

The application serves two primary user roles:

1.  **Faculty Members:**
    *   Access a dedicated portal to submit teaching preferences for the upcoming semester.
    *   Specify desired course load, preferred courses, days, times, and modalities.
    *   Indicate willingness to teach in different formats (Live, Online, Hybrid).
    *   Provide special instructions or constraints.
    *   **Review & Verify:** View their assigned schedule after the draft is published.
    *   **Accept/Reject:** Formally accept their schedule or reject it with comments for the admin.

2.  **Department Schedule Developers (Admins):**
    *   View a comprehensive dashboard of the master schedule.
    *   Manage course offerings, sections, rooms, and instructors.
    *   Review and track faculty requests in real-time.
    *   Assign faculty to course sections based on preferences and availability.
    *   Utilize AI assistance for scheduling suggestions.
    *   **Verification Dashboard:** Track which faculty have accepted or rejected their assigned schedules.
    *   **Communication:** Send automated email reminders for requests and schedule reviews.


1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```
