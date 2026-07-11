# Admin Console & System Management

## Overview
The Admin Console is the command center for platform administrators. It is strictly protected by Role-Based Access Control (RBAC) and provides a God's-eye view of the system's health, user activity, and configuration.

## Features & Use Cases Applied
- **System Health Monitoring:** Visual indicators for API latency, database connection status, and active user counts.
- **Audit Logs:** A chronological record of critical system events (e.g., user sign-ups, permission changes, system errors). Logs are structured using Queue and Stack concepts for efficient appending and retrieval.
- **User Management:** Admins can view the complete user roster, change roles (User <-> Analyst <-> Admin), and manage access.
- **Infrastructure Simulation:** Shows simulated load balancing, caching metrics, and event queues as per the Chapter 23 System Design constraints.

## Security & Architecture
- All sensitive routes are wrapped in an `AuthContext` check. If a non-admin attempts to access the route, they are automatically redirected.
- Firestore Security Rules (when deployed) ensure that only users with `role == 'admin'` can read or write to the system configuration collections.
