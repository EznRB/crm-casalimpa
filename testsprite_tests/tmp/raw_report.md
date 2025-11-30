
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** crm casa limpa
- **Date:** 2025-11-27
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** OAuth Login Success
- **Test Code:** [TC001_OAuth_Login_Success.py](./TC001_OAuth_Login_Success.py)
- **Test Error:** OAuth login flow could not be initiated because the OAuth login option is missing or inaccessible on the login page. The 'Mais' button reveals unrelated menu options. Task stopped as further testing is not possible without OAuth login access.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/110654bf-04e1-4d37-ac73-648ed0877f7b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** OAuth Login Failure
- **Test Code:** [TC002_OAuth_Login_Failure.py](./TC002_OAuth_Login_Failure.py)
- **Test Error:** OAuth login option is not available on the login page, so testing OAuth login failure scenarios cannot proceed. Reporting this as a website issue and stopping further testing.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/b7eb1df0-b661-47e7-8beb-af439a1b50d4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** Client CRUD Operations
- **Test Code:** [TC003_Client_CRUD_Operations.py](./TC003_Client_CRUD_Operations.py)
- **Test Error:** Login failed due to invalid credentials. Cannot proceed with client management operations without successful login. Please provide valid login credentials to continue testing Create, Read, Update, and Delete operations for client management.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/54397222-9148-431a-889f-3f0cb711f1e4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** Schedule Service with Team Allocation and Conflict Prevention
- **Test Code:** [TC004_Schedule_Service_with_Team_Allocation_and_Conflict_Prevention.py](./TC004_Schedule_Service_with_Team_Allocation_and_Conflict_Prevention.py)
- **Test Error:** Stopped testing due to critical issue: The system incorrectly rejects valid email addresses during login and magic link requests, preventing access to the system and blocking all further testing of scheduling service order workflows.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/signup?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/signup?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/otp?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/otp?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/b31d2e5c-4b7d-40b5-b90f-cf5f64072219
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** Reschedule Service with Availability Revalidation
- **Test Code:** [TC005_Reschedule_Service_with_Availability_Revalidation.py](./TC005_Reschedule_Service_with_Availability_Revalidation.py)
- **Test Error:** The task to verify system behavior when rescheduling service orders could not be completed because all login attempts failed due to invalid credentials. Without access to the system, it was not possible to select an existing scheduled order, change the service date/time, confirm rescheduling, or verify revalidation of team availability and update of history. Valid login credentials are required to proceed with this test.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/otp?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/4b6a98bf-13d3-49f3-ab42-767c8637be19
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** Cancel Service Order and Record History
- **Test Code:** [TC006_Cancel_Service_Order_and_Record_History.py](./TC006_Cancel_Service_Order_and_Record_History.py)
- **Test Error:** Unable to proceed with cancellation process verification due to lack of valid login credentials and repeated invalid email errors on login page. Access to scheduled service orders and cancellation functionality requires successful login, which is currently not possible. Please provide valid credentials or alternative access to continue.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/otp?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/otp?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/d923a8ff-28c5-4f0b-aea6-770702fbe1ef
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** Invoice Creation and Payment Reconciliation
- **Test Code:** [TC007_Invoice_Creation_and_Payment_Reconciliation.py](./TC007_Invoice_Creation_and_Payment_Reconciliation.py)
- **Test Error:** Unable to proceed with the task because the system rejects all provided email addresses as invalid for login or account creation. No access to the main application is possible to test invoice generation, payment marking, and receipt issuance. Please provide valid login credentials or a test account to continue.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/otp?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/signup?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/signup?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/1644d71d-3c01-4d2d-b25c-72160e7bca1c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** Role-Based Access Control Enforcement
- **Test Code:** [TC008_Role_Based_Access_Control_Enforcement.py](./TC008_Role_Based_Access_Control_Enforcement.py)
- **Test Error:** Admin login via password failed. Magic link email sent for Admin login. Please confirm login via magic link or provide valid credentials to proceed with role-based access testing.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/bccad318-1781-4f0a-bb20-d1ab7b0ca24c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** Generate Reports and Export CSV/PDF
- **Test Code:** [TC009_Generate_Reports_and_Export_CSVPDF.py](./TC009_Generate_Reports_and_Export_CSVPDF.py)
- **Test Error:** Unable to proceed with report generation and export verification due to lack of valid login credentials. Multiple login attempts failed with error 'Invalid login credentials'. Please provide valid credentials to continue testing.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/otp?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/7f8ef85b-d1c7-4d74-b53f-fa81028adffd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** Chatbot Budget Generation Assistance
- **Test Code:** [TC010_Chatbot_Budget_Generation_Assistance.py](./TC010_Chatbot_Budget_Generation_Assistance.py)
- **Test Error:** Unable to proceed with chatbot functionality testing as all login and account creation attempts failed due to invalid credentials or email errors. The chatbot widget in the budgets module is inaccessible without successful login. Please provide valid credentials or alternative access to continue testing.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/signup?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/otp?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/f82e31e9-a218-44a1-9868-faa9ca22911d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011
- **Test Name:** System Health Check Endpoint
- **Test Code:** [TC011_System_Health_Check_Endpoint.py](./TC011_System_Health_Check_Endpoint.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/d96ffd2d-991b-4ad5-b3dc-d656d565d078
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012
- **Test Name:** Team Management - Employee Profile and Skill Assignment
- **Test Code:** [TC012_Team_Management___Employee_Profile_and_Skill_Assignment.py](./TC012_Team_Management___Employee_Profile_and_Skill_Assignment.py)
- **Test Error:** Testing stopped due to inability to login or create account. Persistent invalid email errors prevent access to the system and further testing of employee profile creation, editing, and allocation functionalities.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/signup?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/otp?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/55fa099c-898d-4b11-b661-fa313be585a0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013
- **Test Name:** UI Responsiveness and Theme Toggle
- **Test Code:** [TC013_UI_Responsiveness_and_Theme_Toggle.py](./TC013_UI_Responsiveness_and_Theme_Toggle.py)
- **Test Error:** Testing stopped due to login failure. Dashboard access is required to verify UI responsiveness and theme toggle functionality. Please resolve login issues and provide valid credentials to continue testing.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/4df88ea4-d475-4323-93c7-80b4540d056c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014
- **Test Name:** Scheduling Performance Validation
- **Test Code:** [TC014_Scheduling_Performance_Validation.py](./TC014_Scheduling_Performance_Validation.py)
- **Test Error:** Login failed due to invalid credentials. Cannot proceed with scheduling test without valid login. Please provide valid credentials or alternative access method.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/4c63f7cc-1931-4bbe-be35-aa55070e8177
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015
- **Test Name:** Page Load Times for Primary Features
- **Test Code:** [TC015_Page_Load_Times_for_Primary_Features.py](./TC015_Page_Load_Times_for_Primary_Features.py)
- **Test Error:** Login failed due to invalid credentials. Cannot proceed to test page load times for primary features without valid login. Please provide valid credentials to continue.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/b06c96ad-dcc5-4913-8ee9-01fd33dfc922
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016
- **Test Name:** System Availability Monitoring
- **Test Code:** [TC016_System_Availability_Monitoring.py](./TC016_System_Availability_Monitoring.py)
- **Test Error:** Unable to verify system uptime due to login and account creation failures caused by invalid email errors. Access to system health monitoring data is blocked. Task cannot proceed without valid credentials or system access.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/token?grant_type=password:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://hyygforlvwbbdzpctnid.supabase.co/auth/v1/otp?redirect_to=http%3A%2F%2F192.168.15.42%3A3001%2Fauth%2Fcallback:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/43382d7d-6574-4047-8daf-78053599f3f7/3af49c6a-e609-4a9e-9707-2b0bee59bf93
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **6.25** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---