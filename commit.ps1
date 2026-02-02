param(
  [string]$Message = "Checkpoint commit"
)

git status
git add .
git commit -m $Message
git push
