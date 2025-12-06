# GitHub Setup Instructions

This repository has been configured for GitHub but requires authentication to push. Follow these steps to complete the setup.

## Current Status

✅ **Completed:**
- Widgets directory converted from nested repo to regular directory
- GitHub remote added: `https://github.com/MapSimple-Org/ExB-Simple.git`
- `develop` branch created
- `main` branch created  
- Repository documentation added (README.md, INSTALLATION.md, CONTRIBUTING.md)

⏳ **Pending (requires authentication):**
- Push branches to GitHub

## Authentication Setup

You'll need to authenticate with GitHub. Choose one method:

### Option 1: SSH (Recommended)

1. **Check if you have SSH keys:**
   ```bash
   ls -la ~/.ssh
   ```

2. **If no SSH key exists, generate one:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

3. **Add SSH key to GitHub:**
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste your key and save

4. **Update remote URL to use SSH:**
   ```bash
   git remote set-url origin git@github.com:MapSimple-Org/ExB-Simple.git
   ```

### Option 2: Personal Access Token (PAT)

1. **Create a Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Copy the token

2. **Use token when pushing:**
   ```bash
   git push -u origin develop
   # When prompted for username: your-github-username
   # When prompted for password: paste-your-token
   ```

### Option 3: GitHub CLI

1. **Install GitHub CLI:**
   ```bash
   brew install gh
   ```

2. **Authenticate:**
   ```bash
   gh auth login
   ```

3. **Push branches:**
   ```bash
   git push -u origin develop
   git push -u origin main
   ```

## Push Branches to GitHub

Once authenticated, run these commands:

```bash
cd /Users/adamcabrera/Dev/arcgis-experience-builder-1.19

# Push develop branch
git checkout develop
git push -u origin develop

# Push main branch
git checkout main
git push -u origin main

# Switch back to develop for ongoing work
git checkout develop
```

## Set Default Branch on GitHub

After pushing:

1. Go to https://github.com/MapSimple-Org/ExB-Simple
2. Settings → Branches
3. Set default branch to `main`
4. Save

## Configure Branch Protection

1. Go to Settings → Branches
2. Add rule for `main`:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging (if you add CI)
   - ✅ Require branches to be up to date before merging
   - ✅ Restrict who can push to matching branches (no one - PRs only)

3. Add rule for `develop` (optional):
   - Allow direct pushes for integration work
   - Require PRs for merging to `main`

## Verify Setup

After pushing, verify:

1. **Branches are visible on GitHub:**
   - https://github.com/MapSimple-Org/ExB-Simple/branches

2. **Files are present:**
   - README.md should be visible
   - Widgets directory should be visible

3. **Test clone:**
   ```bash
   cd /tmp
   git clone https://github.com/MapSimple-Org/ExB-Simple.git test-clone
   ls test-clone/client/your-extensions/widgets/
   ```

## Next Steps

After setup is complete:

1. **Create Pull Request** (if you have feature branch work):
   - Source: `fix/hash-parameter-after-clear-results` (if recreated)
   - Target: `develop`
   - Title: "Fix hash parameter bugs: Data source lifecycle and tab switching"

2. **Add repository topics** on GitHub:
   - `arcgis-experience-builder`
   - `widgets`
   - `typescript`
   - `react`

3. **Add repository description:**
   "User-focused Experience Builder widgets following the 'Simple, clean, real, raw' philosophy"

4. **Consider adding:**
   - GitHub Actions for CI/CD
   - Issue templates
   - Pull request template
   - Code of conduct

## Troubleshooting

### "fatal: could not read Username"

This means Git needs authentication. Use one of the authentication methods above.

### "Permission denied (publickey)"

SSH key not set up correctly. Check:
- SSH key is added to GitHub
- Remote URL uses SSH: `git remote -v`
- SSH agent is running: `ssh-add -l`

### "Repository not found"

- Check repository name: `ExB-Simple`
- Check organization: `MapSimple-Org`
- Verify you have access to the repository

