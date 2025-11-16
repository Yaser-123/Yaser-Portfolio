# CYBERFICTION Website

A creative scroll-driven website with canvas animation showcasing the CYBERFICTION concept.

## Features

- Smooth scroll animation using Locomotive Scroll
- Frame-by-frame animation controlled by scroll position
- Responsive design with proper device pixel ratio handling
- Progressive image loading for better performance

## How to Run

1. Open index.html in a local web server (not directly from file system)
2. For example, using Python's built-in HTTP server:

```powershell
# Navigate to the project directory
cd "c:\path\to\CYBERFICTION-SOURCE-CODE-main"

# Start a Python HTTP server
python -m http.server 8000
```

3. Open your browser and go to http://localhost:8000

## Image Frames

The animation uses a sequence of PNG images that change as you scroll. 

- Default location: `./pv2-unscreen/unscreen-001.png` to `unscreen-150.png`
- See `./frames/README.md` for detailed instructions on replacing or configuring frames

## Configuration

- To change the image source folder, edit the `FRAMES_PATH` constant in `script.js`
- To use external images, run the provided `create-junction.ps1` script

## Credits

CYBERFICTION - A decentralized community that creates new values and profits through play in the virtual world.