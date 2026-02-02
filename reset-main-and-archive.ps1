param (
    [string]$ArchiveBranch
)

Write-Host "=== Archive old main & promote current code to main ===" -ForegroundColor Cyan

# 0. Ensure this is a git repo
if (-not (Test-Path ".git")) {
    Write-Error "Not a git repository."
    exit 1
}

# 1. Abort any active rebase
if ( (Test-Path ".git/rebase-apply") -or (Test-Path ".git/rebase-merge") ) {
    Write-Host "Active rebase detected – aborting rebase" -ForegroundColor Yellow
    git rebase --abort | Out-Null
}

# 2. Ensure we are on main
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Error "You must be on the 'main' branch to run this script."
    exit 1
}

# 3. Auto-commit any local changes (this is the NEW code)
$status = git status --porcelain
if ($status) {
    Write-Host "Uncommitted changes detected – auto committing" -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git add .
    git commit -m ("Auto checkpoint before archive (" + $timestamp + ")") | Out-Null
}

Write-Host "Working tree clean and committed" -ForegroundColor Green

# 4. Ask for archive branch name if not provided
if (-not $ArchiveBranch) {
    $ArchiveBranch = Read-Host "Enter archive branch name (e.g. phase-3-foundation)"
}

if (-not $ArchiveBranch) {
    Write-Error "Archive branch name is required."
    exit 1
}

Write-Host ("Archive branch will be: " + $ArchiveBranch) -ForegroundColor Green

# 5. Remember the OLD main commit (this is what we archive)
$oldMainCommit = git rev-parse HEAD

# 6. Create archive branch from OLD main
Write-Host ("Creating archive branch '" + $ArchiveBranch + "'")
git branch $ArchiveBranch $oldMainCommit | Out-Null
git push origin $ArchiveBranch | Out-Null

# 7. Promote CURRENT code to main (this is the key step)
Write-Host "Promoting current code to main"
git push origin HEAD:main --force-with-lease | Out-Null

# 8. Final state
Write-Host ""
Write-Host "=== Final branch state ===" -ForegroundColor Cyan
git branch -a
git log --oneline --decorate -5

Write-Host ""
Write-Host ("SUCCESS: Old main archived as '" + $ArchiveBranch + "', new code is now main") -ForegroundColor Green
