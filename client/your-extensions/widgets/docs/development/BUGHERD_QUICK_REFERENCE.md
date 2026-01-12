# BugHerd Quick Reference Guide

**Purpose:** Quick reference for integrating BugHerd into exported Experience Builder site  
**Last Updated:** 2026-01-10

---

## 🎯 **Why BugHerd?**

**BugHerd = Visual Feedback + Kanban Board**

### **Visual Feedback:**
- Team clicks anywhere on the page to pin a comment
- Automatic screenshots with annotations
- Browser/OS info captured automatically

### **Built-in Kanban:**
- **Backlog** → Newly reported issues
- **To Do** → Prioritized, ready to work
- **Doing** → Currently being worked on
- **Done** → Completed

**No need for a separate project management tool!**

---

## 🚀 **Quick Setup (5 minutes)**

### **1. Sign Up**
- Go to: https://bugherd.com
- Start free trial (14 days)
- Plans start at $39/month after trial

### **2. Create Project**
- Click **New Project**
- Enter project name (e.g., "QuerySimple Widget Testing")
- Click **Create**

### **3. Get API Key**
- Go to **Settings** → **Install**
- Copy your project's API key (looks like: `abcd1234-efgh-5678-ijkl-9012mnop3456`)

---

## 💻 **Integration Code**

Add this to your **exported `index.html`** file, **before the closing `</body>` tag**:

```html
<!-- BugHerd Visual Feedback + Kanban -->
<script type='text/javascript'>
(function (d, t) {
  var bh = d.createElement(t), s = d.getElementsByTagName(t)[0];
  bh.type = 'text/javascript';
  bh.src = 'https://www.bugherd.com/sidebarv2.js?apikey=YOUR_API_KEY_HERE';
  s.parentNode.insertBefore(bh, s);
})(document, 'script');
</script>
<!-- End BugHerd -->
```

**Replace `YOUR_API_KEY_HERE` with your actual API key.**

---

## 📋 **Team Instructions Template**

Copy this into your team testing email/document:

```
### How to Report Issues with BugHerd

1. **Open the test site**: [YOUR_SITE_URL]

2. **Report an issue:**
   - Click the BugHerd feedback tab (right side of screen)
   - Click anywhere on the page where you see the issue
   - A pin will appear with a comment box
   - Describe what's wrong
   - Select severity:
     • Critical (blocks testing)
     • Important (major issue)
     • Normal (regular bug)
     • Minor (cosmetic/nice-to-have)
   - Click Submit

3. **Your feedback automatically includes:**
   - Screenshot of the page
   - Your browser and OS
   - The page URL
   - Console errors (if any)

4. **Track progress:**
   - I'll be moving your issues through the Kanban board
   - You can see status: Backlog → To Do → Doing → Done
```

---

## 🔧 **BugHerd Dashboard Features**

### **Kanban Board:**
- Drag issues between columns
- Filter by severity, status, assignee
- Sort by date, priority

### **Issue Details:**
- Screenshot with pin location
- Full description
- Browser/OS info
- Page URL
- Comments/discussion thread
- Assign to team members
- Set due dates
- Add tags

### **Settings:**
- Invite team members
- Set up email notifications
- Configure status columns (customize beyond default 4)
- Integrate with other tools (Slack, Jira, etc.)

---

## 🎯 **Workflow During Testing**

### **Daily Routine:**
1. **Morning:** Check BugHerd Kanban board
2. **Triage:** Move new issues from Backlog to To Do (or reject if duplicates)
3. **Prioritize:** Reorder items in To Do column by priority
4. **Work:** Move item to Doing when starting work
5. **Complete:** Move to Done when fixed
6. **Communicate:** Add comments to keep team updated

### **Weekly Review:**
- Review all Done items
- Archive completed issues
- Analyze patterns (common bugs, confusing features)
- Update [`docs/bugs/BUGS.md`](../bugs/BUGS.md) with critical issues
- Plan next sprint based on feedback

---

## 🐛 **Troubleshooting**

### **BugHerd tab not appearing:**
- **Check browser console** for script loading errors
- **Verify API key** is correct (no typos, no extra spaces)
- **Try hard-refresh:** Ctrl+Shift+R (Win) / Cmd+Shift+R (Mac)
- **Check ad-blocker:** May block feedback widgets
- **Try different browser:** Test in Chrome, Firefox, Edge

### **Cannot pin feedback:**
- **iframe restrictions:** BugHerd may not work inside iframes
- **HTTPS required:** Ensure site is served over HTTPS
- **Browser permissions:** Check if JavaScript is enabled

### **Issues not appearing in dashboard:**
- **Check project:** Ensure you're looking at the correct project
- **Refresh dashboard:** Sometimes updates are delayed 10-30 seconds
- **Check filters:** May be filtering out the issue

---

## 💰 **Pricing (as of 2026-01)**

- **Free Trial:** 14 days, full features
- **Standard:** $39/month (5 users, unlimited projects)
- **Premium:** $99/month (15 users, advanced features)
- **Enterprise:** Custom pricing (unlimited users, SSO, SLA)

**Tip:** Start with Standard plan - you can always upgrade.

---

## 🔗 **Alternative Tools (if BugHerd doesn't work)**

If BugHerd doesn't fit your needs:

1. **Marker.io** - Similar visual feedback, no Kanban
2. **Usersnap** - More advanced, higher price
3. **Mouseflow** - Includes session replay
4. **Jira + Screenshot extension** - If you already have Jira

---

## 📚 **Related Documentation**

- **Full Deployment Guide:** [`TEAM_TESTING_DEPLOYMENT.md`](TEAM_TESTING_DEPLOYMENT.md)
- **TODO Item:** [`TODO.md`](../../TODO.md) - Item #8
- **Bug Tracking:** [`docs/bugs/BUGS.md`](../bugs/BUGS.md)

---

## ✅ **Quick Checklist**

Before deploying to team:

- [ ] BugHerd account created
- [ ] Project created and named
- [ ] API key copied
- [ ] Integration code added to exported `index.html`
- [ ] Tested on localhost (pin a test issue)
- [ ] Verified test issue appears in BugHerd dashboard
- [ ] Tested Kanban drag-and-drop
- [ ] Team instructions email drafted
- [ ] Site uploaded to hosting (HTTPS enabled)
- [ ] Team invited to BugHerd project (optional)
- [ ] Tested one more time on live URL

---

**Last Updated:** 2026-01-10  
**Status:** Ready to use
