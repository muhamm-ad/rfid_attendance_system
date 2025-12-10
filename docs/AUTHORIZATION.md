# 🔐 Authorization Model - RFID Attendance System

This document defines the user roles, permissions, and access control model for the RFID Attendance System.

## 📋 Table of Contents

- [User Roles](#user-roles)
- [Permission Matrix](#permission-matrix)
- [Detailed Permissions](#detailed-permissions)
- [API Endpoint Access](#api-endpoint-access)
- [Page Access](#page-access)
- [Implementation Notes](#implementation-notes)

---

## 👥 User Roles

The system defines **three user roles** for system access (distinct from Person types like student/teacher/staff/visitor):

### 1. **Admin** (Administrator)

- **Description:** Full system access with all privileges
- **Use Case:** System administrators, IT staff, institution managers
- **Capabilities:**
  - Complete system management
  - User account management
  - All data operations
  - System configuration

### 2. **Staff** (Staff Member)

- **Description:** Operational access for daily management tasks
- **Use Case:** Administrative staff, receptionists, office workers
- **Capabilities:**
  - Manage persons (add, edit, view)
  - Manage payments
  - View reports and statistics
  - Cannot manage system users or perform system-level operations

### 3. **Viewer** (Read-Only)

- **Description:** Limited read-only access for viewing data
- **Use Case:** Supervisors, auditors, external consultants
- **Capabilities:**
  - View persons, attendance, payments
  - View reports and statistics
  - Cannot modify any data
  - Cannot access sensitive operations

---

## 🔑 Permission Matrix

| Feature/Operation | Admin | Staff | Viewer |
|-------------------|-------|-------|--------|
| **Person Management** |
| View persons | ✅ | ✅ | ✅ |
| Create person | ✅ | ✅ | ❌ |
| Update person | ✅ | ✅ | ❌ |
| Delete person | ✅ | ✅ | ❌ |
| Upload person photo | ✅ | ✅ | ❌ |
| View person photos | ✅ | ✅ | ✅ |
| **Attendance/Scanning** |
| View attendance logs | ✅ | ✅ | ✅ |
| Perform RFID scan | ✅ | ✅ | ❌ |
| Manual attendance entry | ✅ | ✅ | ❌ |
| **Payment Management** |
| View payments | ✅ | ✅ | ✅ |
| Create payment | ✅ | ✅ | ❌ |
| Update payment | ✅ | ✅ | ❌ |
| Delete payment | ✅ | ✅ | ❌ |
| **Reports & Statistics** |
| View statistics | ✅ | ✅ | ✅ |
| Generate reports | ✅ | ✅ | ✅ |
| Export reports | ✅ | ✅ | ✅ |
| **Search** |
| Search persons | ✅ | ✅ | ✅ |
| **User Management** |
| View users | ✅ | ❌ | ❌ |
| Create user | ✅ | ❌ | ❌ |
| Update user | ✅ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ |
| Change user role | ✅ | ❌ | ❌ |
| **System Operations** |
| Access dashboard | ✅ | ✅ | ✅ |
| System configuration | ✅ | ❌ | ❌ |
| Database operations | ✅ | ❌ | ❌ |
| API access | ✅ | ✅ | ✅ (limited) |

---

## 📝 Detailed Permissions

### Admin Permissions

#### Person Management

- ✅ **View all persons** - Can view all persons regardless of type
- ✅ **Create person** - Can add new persons (students, teachers, staff, visitors)
- ✅ **Update person** - Can modify any person's information
- ✅ **Delete person** - Can permanently delete persons
- ✅ **Upload photos** - Can upload and manage person photos
- ✅ **View photos** - Can view all person photos

#### Attendance Management

- ✅ **View all attendance logs** - Full access to attendance history
- ✅ **Perform RFID scans** - Can manually trigger scans
- ✅ **Manual entry** - Can manually add/edit attendance records
- ✅ **Filter and search** - Full access to all filtering options

#### Payment Management

- ✅ **View all payments** - Can see all payment records
- ✅ **Create payment** - Can record new payments
- ✅ **Update payment** - Can modify payment records
- ✅ **Delete payment** - Can remove payment records
- ✅ **View payment history** - Full access to payment history

#### Reports & Statistics

- ✅ **View all statistics** - Complete access to all statistics
- ✅ **Generate reports** - Can generate any type of report
- ✅ **Export data** - Can export reports in various formats
- ✅ **Custom date ranges** - Full flexibility in report generation

#### User Management

- ✅ **View all users** - Can see all system users
- ✅ **Create user** - Can create new user accounts
- ✅ **Update user** - Can modify user information and roles
- ✅ **Delete user** - Can remove user accounts
- ✅ **Change roles** - Can assign/change user roles
- ✅ **Reset passwords** - Can reset user passwords

#### System Operations

- ✅ **System configuration** - Can modify system settings
- ✅ **Database access** - Can perform database operations
- ✅ **API management** - Full API access
- ✅ **Audit logs** - Can view system audit logs

---

### Staff Permissions

#### Person Management

- ✅ **View all persons** - Can view all persons
- ✅ **Create person** - Can add new persons
- ✅ **Update person** - Can modify person information
- ✅ **Delete person** - Can delete persons
- ✅ **Upload photos** - Can upload person photos
- ✅ **View photos** - Can view all person photos

#### Attendance Management

- ✅ **View all attendance logs** - Can view attendance history
- ✅ **Perform RFID scans** - Can manually trigger scans
- ✅ **Manual entry** - Can manually add/edit attendance records
- ✅ **Filter and search** - Can use all filtering options

#### Payment Management

- ✅ **View all payments** - Can see all payment records
- ✅ **Create payment** - Can record new payments
- ✅ **Update payment** - Can modify payment records
- ✅ **Delete payment** - Can remove payment records
- ✅ **View payment history** - Can access payment history

#### Reports & Statistics

- ✅ **View all statistics** - Can access all statistics
- ✅ **Generate reports** - Can generate reports
- ✅ **Export data** - Can export reports
- ✅ **Custom date ranges** - Can use custom date ranges

#### User Management

- ❌ **No access** - Cannot manage system users

#### System Operations

- ❌ **No system configuration** - Cannot modify system settings
- ❌ **No database access** - Cannot perform database operations
- ✅ **API access** - Can use API endpoints (with staff permissions)
- ❌ **No audit logs** - Cannot view system audit logs

---

### Viewer Permissions

#### Person Management

- ✅ **View all persons** - Can view all persons (read-only)
- ❌ **Create person** - Cannot add new persons
- ❌ **Update person** - Cannot modify person information
- ❌ **Delete person** - Cannot delete persons
- ❌ **Upload photos** - Cannot upload photos
- ✅ **View photos** - Can view person photos

#### Attendance Management

- ✅ **View all attendance logs** - Can view attendance history (read-only)
- ❌ **Perform RFID scans** - Cannot trigger scans
- ❌ **Manual entry** - Cannot add/edit attendance records
- ✅ **Filter and search** - Can use filtering options (read-only)

#### Payment Management

- ✅ **View all payments** - Can see payment records (read-only)
- ❌ **Create payment** - Cannot record payments
- ❌ **Update payment** - Cannot modify payments
- ❌ **Delete payment** - Cannot remove payments
- ✅ **View payment history** - Can view payment history (read-only)

#### Reports & Statistics

- ✅ **View all statistics** - Can access statistics (read-only)
- ✅ **Generate reports** - Can generate reports (read-only)
- ✅ **Export data** - Can export reports
- ✅ **Custom date ranges** - Can use custom date ranges

#### User Management

- ❌ **No access** - Cannot view or manage system users

#### System Operations

- ❌ **No system configuration** - Cannot modify system settings
- ❌ **No database access** - Cannot perform database operations
- ✅ **Limited API access** - Can only use GET endpoints (read-only)
- ❌ **No audit logs** - Cannot view system audit logs

---

## 🌐 API Endpoint Access

### Public Endpoints (No Authentication Required)

- ❌ **None** - All endpoints require authentication after implementation

### Admin-Only Endpoints

- `POST /api/users` - Create user
- `GET /api/users` - List all users
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user
- `POST /api/system/config` - System configuration
- `GET /api/system/logs` - System audit logs

### Admin & Staff Endpoints

- `POST /api/persons` - Create person
- `PUT /api/persons/[id]` - Update person
- `DELETE /api/persons/[id]` - Delete person
- `POST /api/upload-photo` - Upload photo
- `POST /api/scan` - Perform RFID scan
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/[id]` - Update attendance record
- `DELETE /api/attendance/[id]` - Delete attendance record
- `POST /api/payments` - Create payment
- `PUT /api/payments/[id]` - Update payment
- `DELETE /api/payments/[id]` - Delete payment

### All Authenticated Users (Admin, Staff, Viewer)

- `GET /api/persons` - List persons
- `GET /api/persons/[id]` - Get person details
- `GET /api/attendance` - List attendance records
- `GET /api/payments` - List payments
- `GET /api/stats` - Get statistics
- `GET /api/reports` - Generate reports
- `GET /api/search` - Search persons
- `GET /api/photos/[id]` - Get photo (with auth check)

---

## 📄 Page Access

### Dashboard (`/dashboard`)

- **Admin:** ✅ Full access to all tabs
- **Staff:** ✅ Full access to all tabs
- **Viewer:** ✅ Read-only access (no edit/delete buttons)

### Login Page (`/login`)

- **All:** ✅ Public access (unauthenticated users)

### User Management Page (`/admin/users`) - To be created

- **Admin:** ✅ Full access
- **Staff:** ❌ No access (redirect to dashboard)
- **Viewer:** ❌ No access (redirect to dashboard)

### Settings Page (`/admin/settings`) - To be created

- **Admin:** ✅ Full access
- **Staff:** ❌ No access (redirect to dashboard)
- **Viewer:** ❌ No access (redirect to dashboard)

---

## 🔒 Implementation Notes

### Authentication Requirements

1. **All pages** (except `/login`) require authentication
2. **All API endpoints** require authentication
3. **Session management** using JWT tokens or secure cookies
4. **Password requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

### Authorization Checks

1. **Middleware level:** Check authentication on all routes
2. **API level:** Verify user role before processing requests
3. **Component level:** Hide/show UI elements based on permissions
4. **Database level:** Consider row-level security if needed

### User Model Schema

```typescript
User {
  id: string (UUID)
  email: string (unique)
  password: string (hashed)
  role: 'admin' | 'staff' | 'viewer'
  name: string
  created_at: DateTime
  updated_at: DateTime
  last_login: DateTime
  is_active: boolean
}
```

### Session Management

- **Session duration:** 24 hours (configurable)
- **Token refresh:** Automatic refresh before expiration
- **Logout:** Clear session on logout
- **Inactive timeout:** Optional auto-logout after inactivity

### Security Considerations

1. **Password hashing:** Use bcrypt with salt rounds (minimum 10)
2. **Rate limiting:** Implement on login endpoint
3. **CSRF protection:** Use CSRF tokens for state-changing operations
4. **XSS protection:** Sanitize all user inputs
5. **SQL injection:** Use parameterized queries (Prisma handles this)
6. **Audit logging:** Log all authentication attempts and sensitive operations

### Role Hierarchy

```
Admin (highest privileges)
  ↓
Staff (operational privileges)
  ↓
Viewer (read-only privileges)
```

### Permission Inheritance

- Higher roles inherit all permissions of lower roles
- Admin has all permissions
- Staff has all Viewer permissions + write access
- Viewer has only read permissions

---

## 📊 Permission Summary Table

| Operation Category | Admin | Staff | Viewer |
|-------------------|-------|-------|--------|
| **Read Operations** | ✅ All | ✅ All | ✅ All |
| **Write Operations** | ✅ All | ✅ All | ❌ None |
| **Delete Operations** | ✅ All | ✅ All | ❌ None |
| **User Management** | ✅ All | ❌ None | ❌ None |
| **System Management** | ✅ All | ❌ None | ❌ None |

---

## 🎯 Next Steps

1. **Create User model** in Prisma schema
2. **Implement authentication** (NextAuth.js recommended)
3. **Create authorization middleware** for API routes
4. **Add role checks** to all API endpoints
5. **Implement UI permission checks** in components
6. **Create user management interface** for admins
7. **Add audit logging** for sensitive operations
8. **Implement password reset** functionality
9. **Add session management** and token refresh
10. **Create login page** with proper error handling

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0  
**Status:** Draft - Pending Implementation
