# Local Testing and Offline Hosting Guide

This guide will help you run Innovare Payroll on your local machine for testing and development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or later) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v14 or later) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)
- A text editor (VS Code, Sublime Text, etc.)

## Option 1: Quick Start (Development Mode)

This is the fastest way to get started for testing and development.

### Step 1: Clone or Download the Project

```bash
# If using Git:
git clone <your-repository-url>
cd innovare-payroll

# Or download and extract the ZIP file, then navigate to the folder
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (may take a few minutes).

### Step 3: Set Up Local Database

#### Create PostgreSQL Database

1. **Open PostgreSQL command line** (psql):
   ```bash
   psql -U postgres
   ```

2. **Create a new database**:
   ```sql
   CREATE DATABASE innovare_payroll;
   CREATE USER innovare_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE innovare_payroll TO innovare_user;
   \q
   ```

#### Configure Database Connection

Create a `.env` file in the project root:

```bash
# Create .env file
touch .env
```

Add the following content to `.env`:

```env
# Database Configuration
DATABASE_URL=postgresql://innovare_user:your_secure_password@localhost:5432/innovare_payroll

# Application Configuration
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-secret-key-here-change-this-to-something-random

# Optional: Enable detailed logging
DEBUG=true
```

**Generate a secure SESSION_SECRET:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Step 4: Initialize the Database

Run database migrations to create all tables:

```bash
npm run db:push
```

You should see output confirming tables were created successfully.

### Step 5: Start the Application

```bash
npm run dev
```

The application will start on `http://localhost:5000`

**Default login credentials:**
- Username: `admin`
- Password: `password`

**⚠️ IMPORTANT**: Change the password after first login!

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

## Option 2: Production Build (Offline Hosting)

For hosting on a local network without internet access or in production-like environment.

### Step 1-4: Same as Option 1

Follow steps 1-4 from Option 1 above.

### Step 5: Build the Application

```bash
npm run build
```

This creates optimized production files in the `dist` folder.

### Step 6: Start in Production Mode

```bash
npm run start
```

The application runs on `http://localhost:5000`

### Step 7: Access from Other Computers (Local Network)

To access the application from other computers on your network:

1. **Find your computer's local IP address:**
   
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet "
   
   # On Windows:
   ipconfig
   ```
   
   Look for an address like `192.168.1.100`

2. **Update your `.env` file** to allow connections:
   ```env
   ALLOWED_ORIGINS=http://192.168.1.100:5000,http://localhost:5000
   ```

3. **Restart the application:**
   ```bash
   npm run start
   ```

4. **On other computers**, open a browser and go to:
   ```
   http://192.168.1.100:5000
   ```
   (Replace with your actual IP address)

## Database Management

### Backup Database

Create a backup of your database:

```bash
# Full backup
pg_dump -U innovare_user innovare_payroll > backup_$(date +%Y%m%d).sql

# With password prompt:
pg_dump -U innovare_user -h localhost innovare_payroll > backup_$(date +%Y%m%d).sql
```

### Restore Database

Restore from a backup:

```bash
psql -U innovare_user innovare_payroll < backup_20241119.sql
```

### Reset Database

To start fresh (⚠️ **CAUTION: This deletes all data!**):

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE innovare_payroll;"
psql -U postgres -c "CREATE DATABASE innovare_payroll;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE innovare_payroll TO innovare_user;"

# Reinitialize
npm run db:push
```

## Testing Features

### 1. Excel File Export/Import

**Test Attendance Import:**
1. Go to Attendance page
2. Click "Download Template"
3. Fill in the template with test data
4. Click "Upload Attendance" and select your file
5. Verify records are imported

**Test Payroll Export:**
1. Create a payroll run
2. Generate payslips
3. Click "Export to Excel"
4. Open the downloaded file to verify data

### 2. Home Address Feature

1. Go to Employees page
2. Add or edit an employee
3. Fill in both "Address" and "Residential Address" fields
4. Save and verify fields are stored correctly

### 3. Send Payroll Data

1. Complete a payroll run
2. Click "Export Payroll"
3. Excel file downloads with all employee payroll data
4. Verify all fields including residential addresses are included

## Troubleshooting

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:** Change the port in `.env`:
```env
PORT=3000
```

Then access at `http://localhost:3000`

### Database Connection Failed

**Error:** `Connection refused` or `Database does not exist`

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   # Mac:
   brew services list
   
   # Linux:
   sudo systemctl status postgresql
   
   # Windows: Check Services app for PostgreSQL
   ```

2. Check database exists:
   ```bash
   psql -U postgres -l
   ```

3. Verify connection string in `.env` matches your database credentials

### Tables Don't Exist

**Error:** `relation "employees" does not exist`

**Solution:** Run migrations:
```bash
npm run db:push
```

### Build Fails

**Error:** `Module not found` or `Cannot find module`

**Solutions:**
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear npm cache:
   ```bash
   npm cache clean --force
   npm install
   ```

### Application Won't Start

**Check for errors:**
1. Look at the terminal output for error messages
2. Check if all environment variables are set in `.env`
3. Verify Node.js version: `node --version` (should be v20+)

## Performance Optimization

### For Faster Development

1. **Use nodemon for auto-restart** (already configured in dev mode)
2. **Enable debug mode** in `.env`:
   ```env
   DEBUG=true
   ```

### For Better Production Performance

1. **Enable production mode**:
   ```env
   NODE_ENV=production
   ```

2. **Use process manager** (PM2):
   ```bash
   npm install -g pm2
   pm2 start npm --name "payroll" -- run start
   pm2 save
   ```

## Running as a Windows Service

To run the application as a background service on Windows:

1. **Install node-windows:**
   ```bash
   npm install -g node-windows
   ```

2. **Create service script** (`install-service.js`):
   ```javascript
   const Service = require('node-windows').Service;
   
   const svc = new Service({
     name: 'Innovare Payroll',
     description: 'HR & Payroll Management System',
     script: require('path').join(__dirname, 'dist', 'index.js'),
     env: [{
       name: "NODE_ENV",
       value: "production"
     }]
   });
   
   svc.on('install', () => svc.start());
   svc.install();
   ```

3. **Install the service:**
   ```bash
   node install-service.js
   ```

## Security Considerations

### For Local Testing

1. **Change default passwords** immediately
2. **Use strong SESSION_SECRET**
3. **Don't expose to the internet** - use only on trusted networks
4. **Regular backups** of your database

### For Production/Offline Hosting

1. **Enable HTTPS** using a reverse proxy (nginx or Apache)
2. **Set up firewall rules** to restrict access
3. **Use strong database passwords**
4. **Keep system updated**: Regularly run `npm update`
5. **Monitor logs** for suspicious activity

## Network Configuration

### Firewall Rules (Windows)

Allow incoming connections on port 5000:

1. Open **Windows Defender Firewall**
2. Click **Advanced Settings**
3. Click **Inbound Rules** → **New Rule**
4. Select **Port** → Next
5. Select **TCP** and enter **5000**
6. Allow the connection
7. Name it "Innovare Payroll"

### Firewall Rules (Linux)

```bash
sudo ufw allow 5000/tcp
sudo ufw reload
```

## Scheduled Backups

### Windows (Task Scheduler)

Create a batch file `backup.bat`:
```batch
@echo off
set PGPASSWORD=your_password
pg_dump -U innovare_user innovare_payroll > "C:\Backups\payroll_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql"
```

Schedule it in Task Scheduler to run daily.

### Linux/Mac (Crontab)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump -U innovare_user innovare_payroll > ~/backups/payroll_$(date +\%Y\%m\%d).sql
```

## Getting Help

### Check Application Logs

Development mode shows detailed logs in the terminal.

For production, logs are written to:
- Console output
- Can be redirected to a file:
  ```bash
  npm run start > app.log 2>&1
  ```

### Common Issues

1. **Slow performance**: Check database indexes, restart PostgreSQL
2. **Memory issues**: Increase Node.js memory: `NODE_OPTIONS=--max_old_space_size=4096 npm run start`
3. **Connection timeouts**: Check network settings, firewall rules

## Next Steps

After successful setup:

1. Configure statutory settings (Settings page)
2. Import or create employees
3. Set up leave policies
4. Create your first payroll run
5. Generate and review reports

---

**Need more help?** Check the main README.md or application documentation.
