# Quick Start Guide - Innovare Payroll

Get up and running in 3 minutes!

## 🚀 Fast Setup

```bash
# 1. Install dependencies
npm install

# 2. Initialize database
npm run db:push

# 3. Seed with admin user (IMPORTANT!)
tsx server/seed.ts

# 4. Start the application
npm run dev
```

## 🔐 Login

Open `http://localhost:5000` and login with:

- **Username:** `admin`
- **Password:** `password`

⚠️ **Change this password immediately after login!**

## 📊 What's Included

The seed script creates:

- ✅ **4 User Accounts** (Admin, Payroll Officer, HR Officer, Auditor)
- ✅ **10 Sample Employees** with complete profiles
- ✅ **Sample Payroll Run** (November 2024)
- ✅ **Leave Policies** (Annual, Sick, Compassionate, Study)
- ✅ **Leave Requests** in various states
- ✅ **Salary Advances** for testing
- ✅ **Statutory Configuration** (PAYE, NAPSA, NHIMA)
- ✅ **Audit Logs** showing system activity

## 🎯 Next Steps

1. **Explore the Dashboard** - See payroll summary and quick stats
2. **View Employees** - Check the 10 pre-loaded employees
3. **Review Payslips** - See generated payslips for November 2024
4. **Test Excel Features:**
   - Go to Attendance → Download Template
   - Fill it with data
   - Upload it back to test bulk import
5. **Generate Reports** - Try PAYE, NAPSA, and NHIMA reports
6. **Export to Excel** - Download payroll data as Excel files

## 🆘 Troubleshooting

**Can't login?**
```bash
# Re-run the seed script
tsx server/seed.ts
```

**Port 5000 already in use?**
Edit `.env` and change:
```env
PORT=3000
```

**Database connection failed?**
Check PostgreSQL is running:
```bash
# Mac: 
brew services list

# Linux:
sudo systemctl status postgresql
```

## 📚 Full Documentation

- **Deploy to Cloud:** [DEPLOY_TO_RENDER.md](DEPLOY_TO_RENDER.md)
- **Local/Offline Setup:** [LOCAL_TESTING.md](LOCAL_TESTING.md)
- **Complete Guide:** [README.md](README.md)

## 🔑 All Demo Accounts

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `password` | Admin | Full system access |
| `payroll` | `password` | Payroll Officer | Process payroll, generate reports |
| `hrofficer` | `password` | HR Officer | Manage employees, leaves |
| `auditor` | `password` | Auditor | Read-only access |

---

**That's it! You're ready to go!** 🎉
