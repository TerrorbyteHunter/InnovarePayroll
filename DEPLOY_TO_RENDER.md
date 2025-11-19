# Deploying Innovare Payroll to Render

This guide will help you deploy the Innovare Payroll application to Render for testing and production use.

## Prerequisites

- A Render account (sign up at https://render.com)
- A PostgreSQL database (you can create one on Render)
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Repository

1. **Push your code to Git:**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Ensure these files exist in your repository:**
   - `package.json` with build and start scripts
   - `drizzle.config.ts` for database migrations
   - `.gitignore` to exclude `node_modules` and `.env`

## Step 2: Create a PostgreSQL Database on Render

1. Go to your Render Dashboard
2. Click **New** → **PostgreSQL**
3. Configure your database:
   - **Name**: `innovare-payroll-db`
   - **Database**: `innovare_payroll`
   - **User**: `innovare_user` (or leave default)
   - **Region**: Choose the region closest to you
   - **PostgreSQL Version**: 16 (recommended)
   - **Plan**: Free or Starter (depending on your needs)
4. Click **Create Database**
5. **Save the connection details** - you'll need them later:
   - Internal Database URL (for connecting from your web service)
   - External Database URL (for local testing)

## Step 3: Create a Web Service on Render

1. Go to your Render Dashboard
2. Click **New** → **Web Service**
3. Connect your Git repository
4. Configure your web service:

### Basic Settings
- **Name**: `innovare-payroll`
- **Region**: Same region as your database
- **Branch**: `main` (or your default branch)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

### Environment Variables

Click **Add Environment Variable** and add the following:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Production mode |
| `DATABASE_URL` | `[Your Render Postgres Internal URL]` | Copy from database settings |
| `SESSION_SECRET` | `[Generate a random string]` | Use: `openssl rand -base64 32` |
| `PORT` | `5000` | Application port |
| `ALLOWED_ORIGINS` | `https://innovare-payroll.onrender.com` | Replace with your Render URL |

**To generate a secure SESSION_SECRET:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use a password generator to create a 32-character random string
```

### Advanced Settings
- **Auto-Deploy**: Yes (recommended - deploys on every git push)
- **Plan**: Free or Starter
- **Health Check Path**: `/` (optional)

5. Click **Create Web Service**

## Step 4: Initialize the Database

After your service is deployed:

1. Go to the **Shell** tab in your Render web service dashboard
2. Run the database migration:
   ```bash
   npm run db:push
   ```

   This will create all the necessary tables in your database.

## Step 5: Access Your Application

1. Your app will be available at: `https://innovare-payroll.onrender.com` (or your custom domain)
2. Default login credentials:
   - **Username**: `admin`
   - **Password**: `password`
   
   **⚠️ IMPORTANT**: Change the admin password immediately after first login!

## Step 6: Post-Deployment Checklist

- [ ] Test login functionality
- [ ] Create a test employee
- [ ] Run a test payroll
- [ ] Generate and download a report
- [ ] Change the default admin password
- [ ] Set up regular database backups (Render provides automatic backups on paid plans)

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Ensure all dependencies are in `package.json`, not just `devDependencies`
- Run `npm install` locally to verify

**Error: "Build command failed"**
- Check the build logs in Render dashboard
- Ensure `npm run build` works locally

### Application Won't Start

**Check the logs:**
1. Go to your Render service dashboard
2. Click on **Logs** tab
3. Look for errors in the startup logs

**Common issues:**
- Database connection failing: Verify `DATABASE_URL` is correct
- Port issues: Ensure `PORT=5000` in environment variables
- Missing environment variables: Double-check all required env vars are set

### Database Connection Issues

**Error: "Connection refused"**
- Use the **Internal Database URL** (not External) in `DATABASE_URL`
- Ensure database and web service are in the same region

**Error: "Tables don't exist"**
- Run `npm run db:push` in the Render Shell

### Performance Issues

**Slow response times:**
- Upgrade to a paid plan for better resources
- Enable caching for static assets
- Consider upgrading your database plan

## Updating Your Application

When you push updates to your repository:

1. Render will automatically detect the changes (if Auto-Deploy is enabled)
2. It will rebuild and redeploy your application
3. Check the **Events** tab to monitor deployment progress

**Manual deployment:**
1. Go to your service dashboard
2. Click **Manual Deploy** → **Deploy latest commit**

## Monitoring and Maintenance

### Health Checks
- Render performs automatic health checks
- Configure custom health check endpoints if needed

### Logs
- Access logs from the **Logs** tab in your service dashboard
- Set up log persistence on paid plans

### Backups
- Free PostgreSQL: Manual backups via `pg_dump`
- Paid plans: Automatic daily backups with point-in-time recovery

### Scaling
- Upgrade your plan for more resources
- Add additional instances for high availability (paid plans)

## Custom Domain (Optional)

To use your own domain:

1. Go to your service **Settings**
2. Scroll to **Custom Domain**
3. Add your domain (e.g., `payroll.yourcompany.com`)
4. Update DNS records as instructed
5. Render will automatically provision SSL certificates

## Security Best Practices

1. **Use Environment Variables** for all secrets
2. **Enable HTTPS** (automatic on Render)
3. **Set strong SESSION_SECRET**
4. **Change default passwords** immediately
5. **Regular backups** of your database
6. **Monitor logs** for suspicious activity
7. **Keep dependencies updated**: Run `npm audit` and `npm update` regularly

## Cost Estimates

### Free Tier
- Web Service: Free (spins down after inactivity)
- PostgreSQL: Free (limited storage and connections)
- Suitable for: Testing and small-scale use

### Paid Plans (Starting at)
- Web Service: $7/month (always active)
- PostgreSQL: $7/month (more storage, better performance)
- Suitable for: Production use with moderate traffic

## Support and Resources

- **Render Documentation**: https://render.com/docs
- **Render Community**: https://community.render.com
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

## Next Steps

After successful deployment:

1. Configure your statutory settings (PAYE, NAPSA, NHIMA rates)
2. Import or create employee records
3. Set up leave policies
4. Configure payroll schedules
5. Train your team on using the system

---

**Need help?** Check the troubleshooting section or contact Render support at https://render.com/support
