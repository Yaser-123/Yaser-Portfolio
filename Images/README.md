# Image Frames for CYBERFICTION

This folder should contain the animation frames for the scroll-driven animation.

## File Naming

- Files should be named from `0001.png` to `0187.png` (4 digits)
- Total of 187 image frames are expected

## How to Add Images

You can place your image sequences in this folder using PowerShell:

```powershell
# Create Images folder if it doesn't exist
mkdir -Force .\Images

# If you have existing images that need to be renamed to 0001.png format
# You can use a script like this to rename them:
# $i = 1
# Get-ChildItem -Path .\source-folder\*.png | ForEach-Object {
#     $newName = "{0:0000}.png" -f $i
#     Copy-Item $_.FullName -Destination ".\Images\$newName"
#     $i++
# }
```

## Notes

- The script will look for these images first in the Images folder
- If an image is missing, it will try several fallback locations
- Image dimensions should be consistent for all frames