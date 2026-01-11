# Team Testing Deployment Guide

**Purpose:** Steps for deploying QuerySimple and HelperSimple to your team for user testing  
**Version:** v1.19.0-r019.22  
**Last Updated:** 2026-01-10

---

## 📋 **Deployment Workflow**

### **Phase 1: Pre-Export Testing** ✅
**Status:** Current phase

1. **Configure Test Page**
   - Add all searches your team will need
   - Test each query type (PIN, Major, Address, etc.)
   - Verify deep linking works (`#pin=123`, `?major=456`)
   - Test Results Management Modes (New, Add, Remove)
   - Verify Map Identify restoration
   - Check Graphics layer highlighting

2. **Run E2E Test Suite**
   ```bash
   # Full regression test
   npx playwright test tests/e2e/query-simple/ --project=chromium
   ```

3. **Manual Smoke Test Checklist**
   - [ ] Hash parameters execute queries correctly
   - [ ] Widget opens/closes properly
   - [ ] Results accumulation works (Add mode)
   - [ ] Results removal works (Remove mode)
   - [ ] Map selection syncs with results
   - [ ] Graphics layer highlights correctly
   - [ ] Identify popup doesn't break selection
   - [ ] URL parameters clean up on widget close
   - [ ] No console errors in production

---

### **Phase 2: Site Export** 🔄

1. **Export Experience**
   - In ExB Builder: **File** → **Export**
   - Select your configured experience
   - Wait for export to complete
   - Download the `.zip` file

2. **Extract and Verify**
   ```bash
   # Extract the zip
   unzip your-experience-export.zip -d exported-site/
   
   # Verify structure
   cd exported-site/
   ls -la
   # Should see: index.html, cdn/, widgets/, etc.
   ```

3. **Test Exported Site Locally**
   ```bash
   # Serve locally (Python example)
   python3 -m http.server 8080
   
   # Or use any local server
   # Then open: http://localhost:8080
   ```

   - Verify all widgets load
   - Test a few queries
   - Check console for errors

---

### **Phase 3: Add BugHerd (Visual Feedback + Kanban)** 🎯

**Why:** Allows team members to pin feedback directly on the page + built-in Kanban board for issue tracking.

**BugHerd Benefits:**
- Visual feedback (click anywhere on page to pin a comment)
- Automatic screenshots with annotations
- Built-in Kanban board (Backlog → To Do → Doing → Done)
- Browser/OS info captured automatically
- No need for separate project management tool

1. **Sign Up for BugHerd**
   - Go to: https://bugherd.com
   - Start free trial (14 days)
   - Create new project
   - Go to **Settings** → **Install**
   - Copy your embed code

2. **Add BugHerd to Exported Site**
   
   Open the exported `index.html` file and add **before the closing `</body>` tag**:

   ```html
   <!-- BugHerd Visual Feedback + Kanban -->
   <script type='text/javascript'>
   (function (d, t) {
     var bh = d.createElement(t), s = d.getElementsByTagName(t)[0];
     bh.type = 'text/javascript';
     bh.src = 'https://www.bugherd.com/sidebarv2.js?apikey=YOUR_API_KEY';
     s.parentNode.insertBefore(bh, s);
   })(document, 'script');
   </script>
   <!-- End BugHerd -->
   ```
   
   **Replace `YOUR_API_KEY` with your actual BugHerd project API key.**

3. **Test BugHerd**
   - Reload the page
   - Look for BugHerd feedback tab (usually right side)
   - Click anywhere on the page to pin a comment
   - Add a note and select severity (Critical, Important, Normal, Minor)
   - Submit → Check your BugHerd dashboard
   - Verify it appears in the Kanban board

---

### **Phase 4: Deploy to Team** 🚀

1. **Upload Exported Site**
   - Upload to your web server / hosting
   - Or use a service like Netlify, Vercel, GitHub Pages
   - Ensure HTTPS is enabled (required for ArcGIS services)

2. **Create Testing Instructions for Team**
   
   **Example Email/Document:**

   ```
   Subject: QuerySimple Widget - User Testing

   Hi Team,

   Please test the new QuerySimple and HelperSimple widgets:
   
   🔗 Testing URL: https://your-site.com/experience/
   
   ### How to Report Issues:
   1. Click the BugHerd feedback tab (right side of screen)
   2. Click anywhere on the page to pin a comment
   3. Add a brief description and select severity
   4. Click Submit (issue will appear in Kanban board)
   
   ### What to Test:
   - All search types (PIN, Major, Address, etc.)
   - Deep linking: Try these URLs:
     - https://your-site.com/experience/#pin=2223059013
     - https://your-site.com/experience/?major=222305
   - Results Management:
     - Switch to "Add" mode and run multiple queries
     - Switch to "Remove" mode and remove results
   - Map interaction:
     - Click on map features
     - Close identify popup
     - Verify your search results are still selected
   
   ### Known Issues:
   (List any known bugs from docs/bugs/BUGS.md)
   
   Thanks!
   ```

3. **Monitor Feedback**
   - Check BugHerd Kanban board daily
   - Triage feedback items (drag between columns)
   - Assign tasks to team members
   - Log critical bugs in [`docs/bugs/BUGS.md`](../bugs/BUGS.md)
   - Move completed items to "Done" column

---

## 🔍 **Troubleshooting Exported Site**

### **Issue: Widgets not loading**
- Check browser console for errors
- Verify all paths in `index.html` are correct
- Ensure `cdn/` folder is present

### **Issue: ArcGIS services failing**
- Verify HTTPS is enabled (required by ArcGIS)
- Check CORS settings on your web server
- Verify ArcGIS Online/Portal is accessible

### **Issue: Deep linking not working**
- Check if web server preserves hash parameters (`#pin=123`)
- Test both hash (`#`) and query string (`?`) formats
- Verify HelperSimple widget is included in the experience

### **Issue: BugHerd not appearing**
- Check browser console for script loading errors
- Verify your API key is correct
- Try hard-refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Ensure you're not in an iframe (BugHerd may have restrictions)

---

## 📊 **Post-Testing Analysis**

After team testing, compile results:

1. **Feedback Summary**
   - Total feedback items received
   - Critical bugs found
   - Enhancement requests
   - Positive feedback highlights

2. **Bug Triage**
   - Categorize by severity (Critical, High, Medium, Low)
   - Add to [`docs/bugs/BUGS.md`](../bugs/BUGS.md)
   - Prioritize for next sprint

3. **Update Documentation**
   - Add findings to [`docs/development/CURRENT_WORK.md`](CURRENT_WORK.md)
   - Update known issues in README
   - Document any workarounds discovered

---

## 📝 **Checklist: Ready for Team Deployment**

**Pre-Export:**
- [ ] All searches configured and tested
- [ ] E2E tests passing
- [ ] Manual smoke test complete
- [ ] No console errors

**Export:**
- [ ] Site exported from ExB
- [ ] Extracted and verified structure
- [ ] Tested locally

**BugHerd:**
- [ ] Account created
- [ ] Project created
- [ ] API key obtained
- [ ] Script added to `index.html`
- [ ] Tested pin-to-page feedback
- [ ] Kanban board configured

**Deployment:**
- [ ] Uploaded to hosting
- [ ] HTTPS enabled
- [ ] Accessible to team
- [ ] Testing instructions sent
- [ ] Monitoring BugHerd Kanban board

---

## 🎯 **Success Metrics**

**Good Testing Session Indicators:**
- 10+ feedback items submitted
- Mix of bugs, enhancements, and positive feedback
- Screenshots with clear annotations
- Reproducible steps provided

**Red Flags:**
- No feedback received (tool not working?)
- Vague descriptions without screenshots
- Same issue reported multiple times (critical bug?)
- Issues stuck in "To Do" with no movement (blockers?)

---

## 🔗 **Related Documentation**

- [`docs/development/TESTING_WALKTHROUGH.md`](TESTING_WALKTHROUGH.md) - Automated testing guide
- [`docs/bugs/BUGS.md`](../bugs/BUGS.md) - Known bugs list
- [`docs/development/CURRENT_WORK.md`](CURRENT_WORK.md) - Current development status
- [`TODO.md`](../../TODO.md) - Task tracking

---

**Last Updated:** 2026-01-10  
**Status:** Ready for Phase 2 (Site Export)
