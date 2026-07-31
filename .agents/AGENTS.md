# Ahmed Website KSA — Agent Rules

## CRITICAL: Always Git Commit Before Editing Any File

**Before making ANY file edit** (CSS, JSX, JS, JSON, etc.), you MUST:

1. Run `git status` to see what is currently modified
2. Stage and commit a checkpoint:
`
git add -A
git commit -m "checkpoint: before [description of what you are about to change]"
`

This ensures the user can always `git revert` or `git checkout` to undo any change.

**No exceptions. Even for tiny single-line fixes — always create a checkpoint commit first.**

### Example workflow every time:
`
# Step 1: Checkpoint BEFORE the edit
git add -A
git commit -m "checkpoint: before fixing SpecialOffers background color"

# Step 2: Make the edit to the file
# Step 3: Commit the result
git add components/homepage/SpecialOffers.css
git commit -m "fix: correct SpecialOffers background color"
`

## CRITICAL: Never Use Destructive Regex on CSS/JS Files

Never run a PowerShell or shell command that does broad character-level substitution across files (e.g. replacing every letter 'f' with 'o'). Always:
- Target **specific full property names** in regex patterns (e.g. `flex` not `f`)
- Preview changes before applying (use `-WhatIf` or test on a single file first)
- Apply to one file at a time and verify before moving to the next

## CRITICAL: Never Use git reset --hard

Never run `git reset --hard`. It permanently destroys uncommitted work.
Use `git revert <commit-hash>` instead — it creates a new undo commit safely.

## Always Commit After Completing a Task

After finishing any task or logical group of edits, commit the result:
`
git add -A
git commit -m "feat/fix: [clear description of what changed and why]"
`

This gives the user a full, browsable history with `git log` and the ability to revert any change at any time.
