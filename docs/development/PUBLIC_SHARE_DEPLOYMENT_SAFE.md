# SAFE Public-Share Deployment Process

**CRITICAL**: Staging uses a **separate clone**. Copy operations read FROM the main repo but write TO the staging directory. **NEVER** run `git checkout public-share` or destructive commands in the main repo.

**Last Updated**: 2026-02-12  
**Created After**: Near-disaster where main repo was accidentally modified

---

## 📋 Quick Overview: Two-Stage Deployment

This is a **TWO-STAGE process** with a manual verification checkpoint:

1. **Stage 1:** Push to **ExB-Simple's `public-share` branch** (private repo) for verification
   - URL: https://github.com/MapSimple-Org/ExB-Simple/tree/public-share
   - **YOU VERIFY HERE** - Check structure, version, no leaked docs
   
2. **Stage 2:** Push to **ExB-Simple-Public's `main` branch** (public repo) for final deployment
   - URL: https://github.com/MapSimple-Org/ExB-Simple-Public/
   - **PUBLIC USERS CLONE FROM HERE**

**Never skip the verification step.** If Stage 1 looks wrong, fix and re-push before going public.

---

## ⚠️ GOLDEN RULES

1. **NEVER** run `git checkout public-share` in the main repo
2. **NEVER** run `rm` or destructive commands in the main repo for public-share work
3. **ONLY** run git/rm/cp in `/Users/adamcabrera/Dev/ExB-Simple-Public-Share/` (staging directory)
4. **ALWAYS** verify you're in the staging directory before running ANY staging commands

---

## Prerequisites

### 1. Staging Directory Setup

The staging directory should be a **separate git clone** of the repository:

```bash
# One-time setup (if not already done)
cd /Users/adamcabrera/Dev/
git clone https://github.com/MapSimple-Org/ExB-Simple.git ExB-Simple-Public-Share
cd ExB-Simple-Public-Share
git checkout public-share
git remote add public https://github.com/MapSimple-Org/ExB-Simple-Public.git
```

**Verify remotes:**
```bash
git remote -v
# Should show:
# origin  https://github.com/MapSimple-Org/ExB-Simple.git (private)
# public  https://github.com/MapSimple-Org/ExB-Simple-Public.git (public)
```

---

## Deployment Process

### Step 0: Pre-Staging (Main Repo - Before Copy)

**Work in the main repo** (`client/your-extensions/widgets/` and `docs/releases/`). Complete these steps before copying to staging. All must be done before Stage 1 push. No git/rm commands here - just create and edit files.

#### 0a. Create/Update Release Document

Create or overwrite the release document. Only the current release is kept (no history).

- **Location:** `docs/releases/RELEASE_v1.19.0-r{version}.md`
- **Name format:** `RELEASE_v1.19.0-r024.18.md` (use actual version from `version.ts`)
- **Overwrite:** Replace the file each release; do not keep multiple release docs

#### 0b. Update README.md

Update `README.md` in the widgets directory (`client/your-extensions/widgets/README.md`):

- Update "Current Version" to match `version.ts`
- Update "Latest Update" and "What's New" with release highlights
- Follow existing README format (see current README for structure)
- **Filename is always README.md** (no version in filename)

#### 0c. Ensure CHANGELOG.md is Up to Date

Verify `CHANGELOG.md` includes all entries through the current release. Copy to staging will bring it in.

---

### Step 1: Switch to Staging Directory and Verify

**CRITICAL CHECK**: Always verify you're in the staging directory:

```bash
# Verify current directory
pwd
# MUST show: /Users/adamcabrera/Dev/ExB-Simple-Public-Share

# If it shows /Users/adamcabrera/Dev/arcgis-experience-builder-1.19/ - STOP!
# Navigate to staging:
cd /Users/adamcabrera/Dev/ExB-Simple-Public-Share/
```

**Verify branch:**
```bash
git branch --show-current
# Should show: public-share
```

---

### Step 2: Clean Staging Directory (Remove Old Files)

**ONLY in staging directory** - remove old widget files:

```bash
# Still in /Users/adamcabrera/Dev/ExB-Simple-Public-Share/
rm -rf query-simple helper-simple shared-code .cursor CHANGELOG.md README.md .gitignore LICENSE
```

**Verify clean:**
```bash
ls -la
# Should show only: .git/
```

---

### Step 3: Copy New Files to Staging

**Copy from main repo widgets directory.** Run these from the staging directory:

```bash
# From staging directory, copy from main repo widgets
cd /Users/adamcabrera/Dev/ExB-Simple-Public-Share/

# Copy widgets
cp -r /Users/adamcabrera/Dev/arcgis-experience-builder-1.19/client/your-extensions/widgets/query-simple .
cp -r /Users/adamcabrera/Dev/arcgis-experience-builder-1.19/client/your-extensions/widgets/helper-simple .
cp -r /Users/adamcabrera/Dev/arcgis-experience-builder-1.19/client/your-extensions/widgets/shared-code .
cp -r /Users/adamcabrera/Dev/arcgis-experience-builder-1.19/client/your-extensions/widgets/.cursor .

# Copy documentation (README and CHANGELOG prepared in Step 0)
cp /Users/adamcabrera/Dev/arcgis-experience-builder-1.19/client/your-extensions/widgets/CHANGELOG.md .
cp /Users/adamcabrera/Dev/arcgis-experience-builder-1.19/client/your-extensions/widgets/README.md .

# Get .gitignore from public-share branch (source: whatever was last committed there)
git fetch origin public-share
git show origin/public-share:.gitignore > .gitignore

# Restore LICENSE from public-share (unchanged - no edits per release)
git show origin/public-share:LICENSE > LICENSE
```

**Verify structure:**
```bash
ls -la
# Should show: .cursor, .git, .gitignore, CHANGELOG.md, LICENSE, README.md, helper-simple, query-simple, shared-code
```

---

### Step 4: Commit in Staging Directory

**ONLY in staging directory**:

```bash
# Still in /Users/adamcabrera/Dev/ExB-Simple-Public-Share/
git add -A
git commit -m "Public distribution: Update to r{version}

[Summarize key changes - see RELEASE doc and CHANGELOG]

See CHANGELOG.md for complete details."
```

---

### Step 5: Two-Stage Deployment (Push to Remotes)

**CRITICAL: This is a TWO-STAGE process with a manual verification checkpoint.**

#### **Stage 1: Push to Private Repo's `public-share` Branch (Verification)**

**ONLY in staging directory**:

```bash
# Still in /Users/adamcabrera/Dev/ExB-Simple-Public-Share/

# Stage 1: Push to ExB-Simple's public-share branch (private repo)
git push origin public-share
```

**What happens:** This pushes to the private repository's `public-share` branch.  
**Purpose:** Verification stage - check everything before going public.

---

### Step 6: Verify on GitHub (REQUIRED - Do NOT Skip)

**Visit:** https://github.com/MapSimple-Org/ExB-Simple/tree/public-share

**Check the following:**
- [ ] Widgets are at root (NOT nested in `client/your-extensions/widgets/`)
- [ ] README shows correct version (e.g., r022.26)
- [ ] CHANGELOG is up to date
- [ ] No internal documentation leaked (no `docs/` folder)
- [ ] Structure is clean and ready for public consumption
- [ ] `.cursor/rules/` folder is present (public development rules)
- [ ] `shared-code/` folder is present

**If anything looks wrong:** Fix it in staging, recommit, and push again to `origin public-share`.

**Do NOT proceed to Stage 2 until verification is complete.**

---

### Step 7: Push to Public Repository (Final Deployment)

**Only AFTER Stage 1 verification passes**, push to the public-facing repository:

```bash
# Still in /Users/adamcabrera/Dev/ExB-Simple-Public-Share/

# Stage 2: Push to ExB-Simple-Public's main branch (public repo)
git push public public-share:main --force
```

**What happens:** This pushes from your local `public-share` branch to the public repository's `main` branch.  
**Purpose:** Final deployment - public users can now clone/download.

---

### Step 8: Verify Public Repository

**Visit:** https://github.com/MapSimple-Org/ExB-Simple-Public

**Verify:**
- [ ] Same structure as Stage 1 verification
- [ ] README shows correct version
- [ ] Public users can clone successfully

**Test Clone (Optional but Recommended):**
```bash
# From a different directory
cd /tmp
git clone https://github.com/MapSimple-Org/ExB-Simple-Public.git test-public-clone
cd test-public-clone
ls -la
# Should show: query-simple, helper-simple, shared-code, README.md, CHANGELOG.md, etc.
```

---

## Safety Checklist

Before running ANY command, verify:

- [ ] Current directory is `/Users/adamcabrera/Dev/ExB-Simple-Public-Share/`
- [ ] NOT in `/Users/adamcabrera/Dev/arcgis-experience-builder-1.19/`
- [ ] Current branch is `public-share`
- [ ] No uncommitted changes in main repo that need to be preserved

---

## What NOT to Do (Costly Mistakes)

### ❌ NEVER DO THESE:

1. **NEVER** `cd /Users/adamcabrera/Dev/arcgis-experience-builder-1.19/` for public-share work
2. **NEVER** `git checkout public-share` in the main repo
3. **NEVER** `git pull origin public-share` in the main repo
4. **NEVER** `rm -rf` anything in the main repo for public-share
5. **NEVER** `cp` files from staging TO the main repo
6. **NEVER** run `git reset --hard` in the main repo for public-share

### Why These Are Dangerous:

- The main repo contains **untracked files** (`.local-backups/`, `server/public/apps/`) that are **NOT in Git**
- If you delete these, they **CANNOT be restored** - they're gone forever
- Switching branches in the main repo can cause conflicts that risk these files
- The main repo is your **development environment** - it should NEVER be modified for deployment

---

## Recovery (If You Make a Mistake)

### If You Accidentally Modified Main Repo:

1. **DO NOT** commit anything
2. **DO NOT** run `git reset --hard` (might lose untracked files)
3. **Check what was changed:**
   ```bash
   cd /Users/adamcabrera/Dev/arcgis-experience-builder-1.19/
   git status
   ```
4. **Restore tracked files only:**
   ```bash
   git checkout -- .
   ```
5. **Verify critical untracked directories still exist:**
   ```bash
   ls -la .local-backups/
   ls -la server/public/apps/
   ```
6. **If untracked files are missing:** They're gone. Check Time Machine or backups.

---

## Quick Reference: One-Liner Safety Check

Before running ANY command for public-share deployment:

```bash
pwd | grep -q "ExB-Simple-Public-Share" && echo "✅ Safe: In staging directory" || echo "❌ DANGER: Not in staging directory! Navigate to /Users/adamcabrera/Dev/ExB-Simple-Public-Share/"
```

---

## Summary

**The Rule**: Staging directory is **isolated**. Main repo is **untouchable**. 

- **Staging**: Where we prepare and commit changes
- **Main Repo**: Where we develop. NEVER modify for deployment.

**Deployment Flow:**
```
Main Development Repo
(/Users/adamcabrera/Dev/arcgis-experience-builder-1.19/)
    ↓ Step 0: Create release doc, update README, ensure CHANGELOG current
    ↓ Step 1-3: Copy files to staging
Staging Directory
(/Users/adamcabrera/Dev/ExB-Simple-Public-Share/)
    ↓ Step 4: git commit
STAGE 1: Push to ExB-Simple (private) → public-share branch
(https://github.com/MapSimple-Org/ExB-Simple/tree/public-share)
    ↓ (MANUAL VERIFICATION REQUIRED)
    ↓ (only if verification passes)
STAGE 2: Push to ExB-Simple-Public (public) → main branch
(https://github.com/MapSimple-Org/ExB-Simple-Public/)
    ↓
PUBLIC USERS CLONE FROM HERE
```

**Why Two Stages?**
1. **Safety Net:** Catch mistakes (leaked docs, wrong version) before going public
2. **No Public Errors:** Public repo only gets verified, clean content
3. **Rollback Option:** Fix and re-push to Stage 1 if needed
4. **Backup:** `public-share` branch serves as staging/backup

**If in doubt**: Don't run the command. Ask first.

---

## 🚀 Quick Reference: Exact Commands

### Stage 1: Push to Private Repo (Verification)

```bash
# In staging directory
cd /Users/adamcabrera/Dev/ExB-Simple-Public-Share/

# Verify location and branch
pwd  # MUST show: /Users/adamcabrera/Dev/ExB-Simple-Public-Share
git branch --show-current  # MUST show: public-share

# Stage 1: Push to private repo's public-share branch
git push origin public-share
```

**Then verify:** https://github.com/MapSimple-Org/ExB-Simple/tree/public-share

### Stage 2: Push to Public Repo (Final Deployment)

**Only after Stage 1 verification passes:**

```bash
# Still in staging directory
cd /Users/adamcabrera/Dev/ExB-Simple-Public-Share/

# Stage 2: Push to public repo's main branch
git push public public-share:main --force
```

**Then verify:** https://github.com/MapSimple-Org/ExB-Simple-Public/

---

## 📊 Deployment Checklist

### Step 0: Pre-Staging (Main Repo)
- [ ] Release doc created/updated: `docs/releases/RELEASE_v1.19.0-r{version}.md`
- [ ] README.md updated (version, What's New)
- [ ] CHANGELOG.md up to date through current release

### Before Staging Commands
- [ ] Current directory is `/Users/adamcabrera/Dev/ExB-Simple-Public-Share/` (for Steps 1+)
- [ ] Current branch is `public-share`
- [ ] Files copied from main repo and verified

### Stage 1: Private Repo Verification
- [ ] Pushed to `origin public-share`
- [ ] Visited https://github.com/MapSimple-Org/ExB-Simple/tree/public-share
- [ ] Widgets at root (not nested)
- [ ] Correct version in README
- [ ] CHANGELOG up to date
- [ ] No internal docs leaked
- [ ] Structure looks clean

### Stage 2: Public Repo Deployment
- [ ] Pushed to `public public-share:main`
- [ ] Visited https://github.com/MapSimple-Org/ExB-Simple-Public/
- [ ] Same structure as Stage 1
- [ ] Public can clone successfully

---

**If in doubt**: Don't run the command. Ask first.

---

**Last Updated**: 2026-01-30  
**Created After**: Near-disaster where main repo was accidentally modified  
**Purpose**: Prevent costly mistakes that could delete untracked files
