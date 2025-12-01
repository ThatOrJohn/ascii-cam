# ASCII Cam

Transform your webcam feed into real-time ASCII art using Three.js.

## Overview

ASCII Cam is a browser-based application that captures your device's camera feed and converts it to ASCII characters in real-time. Built with Three.js and the AsciiEffect renderer, it creates a nostalgic, terminal-style visualization of live video.

## Features

- **Real-time ASCII Rendering**: Converts webcam feed to ASCII art at 60fps
- **Camera Switching**: Toggle between front and rear cameras on mobile devices
- **Adjustable Resolution**: Control ASCII character density for detail vs. performance
- **Invert Mode**: Switch between light and dark backgrounds
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **No Build Required**: Runs directly in the browser with ES modules

## Demo

[Live Demo](https://ascii-cam-time.netlify.app)

## Requirements

- Modern web browser with WebGL support (Chrome, Firefox, Safari, Edge)
- Camera/webcam access
- HTTPS connection (required for camera access on most browsers)

## Installation & Usage

### Option 1: Open Directly

Simply open `index.html` in a web browser. Note that some browsers may restrict camera access when opening files directly from the filesystem.

### Option 2: Local Development Server

For the best experience, run a local server:

**Using Python:**

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js:**

```bash
npx http-server -p 8000
```

**Using PHP:**

```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Deploy to GitHub Pages

1. Fork or clone this repository
2. Go to repository Settings > Pages
3. Select the `main` branch as source
4. Your ASCII Cam will be available at `https://your-username.github.io/ascii-cam`

## How It Works

1. **Camera Access**: Uses the MediaDevices API (`getUserMedia`) to capture video from your device's camera
2. **Video Texture**: The video stream is used as a texture in Three.js
3. **3D Scene**: A simple plane geometry displays the video texture
4. **ASCII Effect**: Three.js's `AsciiEffect` post-processing renderer converts each frame to ASCII characters
5. **Real-time Rendering**: The scene renders continuously at ~60fps for smooth animation

## Controls

- **Start Camera**: Begin capturing and rendering
- **Stop Camera**: Stop the camera feed
- **Switch Camera**: Toggle between available cameras (mobile)
- **ASCII Resolution**: Adjust character density (lower = more detail, slower performance)
- **Invert**: Switch between white-on-black and black-on-white
- **Color Mode**: Toggle color (currently renders in monochrome for authentic ASCII aesthetic)

## Browser Compatibility

| Browser | Desktop | Mobile |
| ------- | ------- | ------ |
| Chrome  | ✅      | ✅     |
| Firefox | ✅      | ✅     |
| Safari  | ✅      | ✅     |
| Edge    | ✅      | ✅     |

## Technical Stack

- **Three.js v0.160.0**: 3D rendering library
- **AsciiEffect**: Three.js post-processing effect
- **MediaDevices API**: Webcam access
- **ES6 Modules**: Modern JavaScript module system
- **Vanilla JS**: No framework dependencies

## Project Structure

```
ascii-cam/
├── index.html          # Main HTML structure
├── main.js             # Application logic and Three.js setup
├── styles.css          # Styling and responsive design
└── README.md           # Documentation
```

## Customization

### Change ASCII Characters

Edit the character set in `main.js`:

```javascript
this.effect = new AsciiEffect(this.renderer, " .:-+*=%@#", {
  invert: false,
  resolution: 0.15,
});
```

The characters should be ordered from darkest to brightest.

### Adjust Default Resolution

Modify the default resolution in `index.html`:

```html
<input
  type="range"
  id="resolution"
  min="0.05"
  max="0.3"
  step="0.01"
  value="0.15"
/>
```

### Change Color Scheme

Edit the colors in `styles.css` or modify the effect styling in `main.js`:

```javascript
this.effect.domElement.style.color = "white";
this.effect.domElement.style.backgroundColor = "black";
```

## Performance Optimization

- Lower resolution values provide better performance on slower devices
- The video quality requested can be adjusted in the `getUserMedia` constraints
- ASCII rendering is efficient, but very high resolutions may impact frame rate

## Known Limitations

- Requires HTTPS for camera access (except on localhost)
- Camera switching may not work on all devices
- Some browsers may not support camera selection
- Color mode is currently disabled (monochrome ASCII is more authentic)

## Troubleshooting

**Camera permission denied:**

- Check browser settings to ensure camera access is allowed
- Try refreshing the page and accepting the permission prompt

**No camera found:**

- Ensure your device has a camera
- Check that no other application is using the camera

**Black screen:**

- Verify you're accessing via HTTPS or localhost
- Check browser console for errors
- Ensure WebGL is supported and enabled

## Credits

- Inspired by [Three.js ASCII Example](https://threejs.org/examples/?q=asci#webgl_effects_ascii)
- Built with [Three.js](https://threejs.org/)
- AsciiEffect by Three.js contributors

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

Special thanks to the Three.js team for the excellent library and examples that made this project possible.

---

Made with ASCII art and code
