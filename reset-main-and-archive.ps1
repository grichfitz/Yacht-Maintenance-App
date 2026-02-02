param (
    [string]$ArchiveBranch
)

Write-Host "=== Git Main Reset & Archive Script ===" -ForegroundColor Cyan

# STEP 0: Ensure we are in a git repo
if (!(Test-Path ".git")) {
    Write-Error "This is not a git repository. Aborting."
    exit 1
}

# STEP 1: Ensure working tree is clean
$STATUS = git status --porcelain
if ($STATUS) {
    Write-Error "Working tree is NOT clean. Commit or stash changes first."
    git status
    exit 1
}

Write-Host "Working tree clean" -ForegroundColor Green

# STEP 2: Ensure we are on main
$CURRENT_BRANCH = git branch --show-current
if ($CURRENT_BRANCH -ne "main") {
    Write-Error "You must be on 'main' branch to run this script."
    exit 1
}

Write-Host "On main branch" -ForegroundColor Green

# STEP 3: Ask for archive branch if not provided
if (-not $ArchiveBranch) {
    $ArchiveBranch = Read-Host "Enter archive branch name (e.g. phase-1-foundation)"
}

if (-not $ArchiveBranch) {
    Write-Error "Archive branch name is required."
    exit 1
}

Write-Host ("Archive branch set to: " + $ArchiveBranch) -ForegroundColor Green

# STEP 4: Rename local main -> archive branch
Write-Host ("Archiving main to '" + $ArchiveBranch + "'")
git branch -m main $ArchiveBranch

# STEP 5: Push archive branch to GitHub
Write-Host "Pushing archive branch to origin"
git push origin $ArchiveBranch

# STEP 6: Create NEW main from current HEAD
Write-Host "Creating new main branch"
git checkout -b main

# STEP 7: Push new main and set upstream
Write-Host "Pushing new main to origin"
git push -u origin main

# STEP 8: Final verification
Write-Host ""
Write-Host "=== Final State ===" -ForegroundColor Cyan
git branch -a

Write-Host ""
Write-Host ("Main branch reset complete. Archive branch: " + $ArchiveBranch) -ForegroundColor Green
