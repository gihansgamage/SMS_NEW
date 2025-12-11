# 🚀 Quick Start - Society Management System

## ⚡ Get Running in 5 Minutes

### 1️⃣ Add Credentials to `.env` (REQUIRED)

Open `.env` file and replace these values:

```env
# Change these:
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
STUDENT_SERVICE_EMAIL=studentservice@pdn.ac.lk
```

**Get Google OAuth:**
- Go to: https://console.cloud.google.com/
- Create OAuth 2.0 Client ID
- Redirect URI: `http://localhost:8080/login/oauth2/code/google`

**Get Gmail App Password:**
- Go to: https://myaccount.google.com/apppasswords
- Generate password (16 characters)

### 2️⃣ Start Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

✅ Backend running at: http://localhost:8080

### 3️⃣ Start Frontend

```bash
cd sms-uop
npm install
npm run dev
```

✅ Frontend running at: http://localhost:5173

## 🎯 Test It

### Public Site
- Open: http://localhost:5173
- Browse societies
- Try registration form

### Admin Panel
- Open: http://localhost:5173/admin/login
- Login with: `gihansgamage@gmail.com` (or other authorized email)
- View dashboard
- Test approvals

## ✅ What's Already Done

- ✅ Database created (Supabase)
- ✅ All tables set up
- ✅ Backend configured
- ✅ Entities fixed
- ✅ Services implemented
- ✅ Controllers ready
- ✅ Approval workflow complete
- ✅ 14 admin users pre-loaded

## 📋 Pre-configured Admin Users

| Email | Role | Password |
|-------|------|----------|
| gihansgamage@gmail.com | Vice Chancellor | (Your Google login) |
| gihansanjaya2001@gmail.com | Deputy VC | (Your Google login) |
| gsgamage4@gmail.com | Assistant Registrar | (Your Google login) |
| s20369@sci.pdn.ac.lk | Dean Science | (Your Google login) |

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check Java version
java -version  # Should be 17+

# Check port
lsof -i :8080  # Should be free
```

### OAuth fails
- Check credentials in `.env`
- Verify redirect URI in Google Console
- Must use email from `admin_users` table

### Emails not working
- Use app password, not regular password
- Enable 2FA on Gmail first

## 📚 Full Documentation

- `README.md` - Complete overview
- `SETUP_GUIDE.md` - Detailed setup
- `IMPLEMENTATION_SUMMARY.md` - Technical details

## 🎉 That's It!

Your Society Management System is ready to use!

1. Add credentials to `.env` ⚠️
2. Run backend ▶️
3. Run frontend ▶️
4. Login and test ✅

---

**Need help?** Check `SETUP_GUIDE.md` for detailed instructions.
