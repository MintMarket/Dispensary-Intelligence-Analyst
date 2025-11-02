# Setup Guide for Non-Technical Users

This guide will help you set up and run the Dispensary Intelligence Analyst on your computer, even if you have no coding experience.

## What You'll Need

1. A computer (Windows, Mac, or Linux)
2. About 15 minutes
3. Internet connection

## Step-by-Step Setup

### Step 1: Install Node.js

Node.js is the software that runs this application.

**Windows:**
1. Go to https://nodejs.org
2. Click the big green button that says "Download Node.js (LTS)"
3. Run the downloaded file
4. Click "Next" through all the steps (keep all default settings)
5. Click "Finish"

**Mac:**
1. Go to https://nodejs.org
2. Click the big green button that says "Download Node.js (LTS)"
3. Open the downloaded file
4. Follow the installation steps
5. Click "Continue" and "Install"

**Linux (Ubuntu/Debian):**
Open Terminal and run:
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Verify Installation

**Windows:**
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. In the black window that appears, type: `node --version`
4. You should see something like `v20.x.x`

**Mac:**
1. Press `Command + Space`
2. Type `terminal` and press Enter
3. In the window that appears, type: `node --version`
4. You should see something like `v20.x.x`

**Linux:**
1. Open Terminal
2. Type: `node --version`
3. You should see something like `v20.x.x`

✅ If you see a version number, you're good to go!

### Step 3: Download the Project

You already have the project files since you're reading this! The folder is called:
```
Dispensary-Intelligence-Analyst
```

### Step 4: Install the Application

**Windows:**
1. Open the `Dispensary-Intelligence-Analyst` folder
2. Double-click on `setup.bat` (we'll create this file for you)
3. Wait for it to say "Setup complete!"

**Mac/Linux:**
1. Open Terminal
2. Type: `cd ` (with a space after cd)
3. Drag the `Dispensary-Intelligence-Analyst` folder into the Terminal window
4. Press Enter
5. Type: `./setup.sh`
6. Press Enter
7. Wait for it to say "Setup complete!"

### Step 5: Run Your First Report

**Windows:**
1. In the `Dispensary-Intelligence-Analyst` folder
2. Double-click `run-report.bat`
3. A window will open and show your intelligence report!

**Mac/Linux:**
1. In Terminal (in the project folder)
2. Type: `./run-report.sh`
3. Press Enter
4. Your intelligence report will appear!

## What You'll See

The report shows:
- **Competitor Promos** - Sales and discounts competitors are running
- **Pricing Gaps** - Where your prices might be higher/lower
- **Upcoming Events** - Industry events in the next 21 days
- **Smart Alerts** - Important things you should know about
- **Recommendations** - What you should do next

## Important Notes

### Currently Using Test Data

Right now, the system uses **fake test data** to show you how it works. This is perfect for:
- Learning how the system works
- Seeing sample reports
- Testing before connecting real data

### To Use Real Data

To connect real data sources (like Weedmaps, Google Places, etc.), you'll need to:
1. Hire a developer (or contact us for setup service)
2. They'll connect the system to your data sources
3. This requires API keys and integrations

## Different Ways to Use It

### Option 1: Run When Needed (Easiest)

Just double-click the `run-report.bat` (Windows) or run `./run-report.sh` (Mac/Linux) whenever you want a fresh report.

**Best for:** Getting reports once a day or week

### Option 2: Schedule Automatic Reports

You can set your computer to run reports automatically:

**Windows - Task Scheduler:**
1. Search for "Task Scheduler" in Windows
2. Click "Create Basic Task"
3. Name it "Daily Intelligence Report"
4. Choose "Daily"
5. Pick a time (like 8:00 AM)
6. Choose "Start a Program"
7. Browse to `run-report.bat` in your folder
8. Click Finish

**Mac - Calendar App:**
1. Open Calendar
2. Create a new event for 8:00 AM daily
3. Set it to repeat daily
4. Add an alert that runs a script
5. Choose the `run-report.sh` file

**Linux - Cron:**
```bash
crontab -e
# Add this line (runs daily at 8 AM):
0 8 * * * /path/to/Dispensary-Intelligence-Analyst/run-report.sh
```

### Option 3: Run on a Server (Advanced)

If you want the system running 24/7 and accessible from anywhere:
1. You'll need a cloud server (AWS, DigitalOcean, etc.)
2. This requires technical knowledge or hiring someone
3. Monthly cost: $5-20/month

## Troubleshooting

### "command not found" or "not recognized"

**Problem:** Node.js isn't installed properly

**Solution:**
1. Go back to Step 1
2. Make sure you installed Node.js
3. Restart your computer
4. Try Step 2 again

### "Permission denied" (Mac/Linux)

**Problem:** The script files don't have permission to run

**Solution:**
```bash
chmod +x setup.sh
chmod +x run-report.sh
chmod +x run-*.sh
```

### Can't find the folder

**Problem:** You're in the wrong directory

**Solution (Windows):**
1. Open the folder in File Explorer
2. Click in the address bar at the top
3. Type `cmd` and press Enter
4. Now try the commands

**Solution (Mac/Linux):**
Use the `cd` command to navigate:
```bash
cd ~/Desktop/Dispensary-Intelligence-Analyst
# or wherever you saved it
```

### Report looks weird or has errors

**Problem:** Installation didn't complete

**Solution:**
1. Delete the `node_modules` folder (if it exists)
2. Run setup again
3. Make sure your internet connection is stable

## Getting Help

### Check the README
The `README.md` file has more technical documentation.

### Common Questions

**Q: Is my data secure?**
A: Yes, everything runs on your computer. No data is sent anywhere.

**Q: Do I need to be online?**
A: Only for setup and if you connect real data sources. The test version works offline.

**Q: Can I customize the reports?**
A: Yes! Edit the `.env` file to change settings like:
- Which market/city to analyze
- Alert thresholds
- How many days to look back/forward

**Q: How much does this cost to run?**
A: Free if running on your computer. Cloud hosting costs $5-20/month.

**Q: Can I share reports with my team?**
A: Yes! The reports are saved as text files you can email or print.

## Next Steps

Once you're comfortable with the basics:

1. **Customize Settings** - Edit `.env` to change your market, thresholds, etc.
2. **Schedule Reports** - Set up automatic daily reports
3. **Connect Real Data** - Hire a developer to connect real data sources
4. **Integrate with Tools** - Export reports to Excel, email them automatically, etc.

## Need Professional Setup?

If you want help with:
- Connecting real data sources
- Setting up cloud hosting
- Customizing reports
- Training your team

Consider hiring a developer or contact the project maintainers for setup services.

---

**Remember:** Start simple! Just run the test reports first to see how everything works. You can always add more complexity later.
