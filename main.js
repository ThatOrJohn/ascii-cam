import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

class AsciiCam {
    constructor() {
        this.video = document.getElementById('video');
        this.container = document.getElementById('ascii-container');
        this.errorElement = document.getElementById('error-message');

        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.effect = null;
        this.videoTexture = null;
        this.plane = null;
        this.stream = null;
        this.animationId = null;

        this.currentFacingMode = 'user'; // 'user' for front, 'environment' for back
        this.isRunning = false;
        this.currentColorScheme = 'classic';

        // Color schemes with retro console/arcade palettes
        this.colorSchemes = {
            classic: { fg: '#ffffff', bg: '#000000' },
            gameboy: { fg: '#9bbc0f', bg: '#0f380f' },
            amber: { fg: '#ffb000', bg: '#000000' },
            green: { fg: '#33ff33', bg: '#001100' },
            c64: { fg: '#7c70da', bg: '#3e31a2' },
            arcade: { fg: '#00ffff', bg: '#000033' }
        };

        this.initUI();
    }

    initUI() {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const switchBtn = document.getElementById('switchBtn');
        const resolutionSlider = document.getElementById('resolution');
        const resolutionValue = document.getElementById('resolutionValue');
        const colorSchemeSelect = document.getElementById('colorScheme');
        const hideHeaderToggle = document.getElementById('hideHeader');
        const header = document.querySelector('header');

        startBtn.addEventListener('click', () => this.start());
        stopBtn.addEventListener('click', () => this.stop());
        switchBtn.addEventListener('click', () => this.switchCamera());

        resolutionSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            resolutionValue.textContent = value;
            if (this.effect) {
                this.updateResolution(parseFloat(value));
            }
        });

        colorSchemeSelect.addEventListener('change', (e) => {
            this.currentColorScheme = e.target.value;
            if (this.effect) {
                this.applyColorScheme();
            }
        });

        hideHeaderToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                header.style.opacity = '0';
                header.style.pointerEvents = 'none';
            } else {
                header.style.opacity = '1';
                header.style.pointerEvents = 'auto';
            }
        });
    }

    async start() {
        try {
            this.hideError();
            await this.initCamera();
            this.initThree();
            this.animate();
            this.updateButtons(true);
        } catch (error) {
            this.showError(error.message);
            console.error('Error starting camera:', error);
        }
    }

    async initCamera() {
        const constraints = {
            video: {
                facingMode: this.currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;

            // Wait for video to be ready
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    resolve();
                };
            });

            await this.video.play();
            this.isRunning = true;
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                throw new Error('Camera permission denied. Please allow camera access and try again.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No camera found on this device.');
            } else {
                throw new Error(`Failed to access camera: ${error.message}`);
            }
        }
    }

    initThree() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera = new THREE.OrthographicCamera(
            width / -2, width / 2,
            height / 2, height / -2,
            1, 1000
        );
        this.camera.position.z = 500;

        // Create video texture
        this.videoTexture = new THREE.VideoTexture(this.video);
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;

        // Calculate aspect ratios
        const videoAspect = this.video.videoWidth / this.video.videoHeight;
        const windowAspect = width / height;

        let planeWidth, planeHeight;

        if (windowAspect > videoAspect) {
            planeHeight = height;
            planeWidth = height * videoAspect;
        } else {
            planeWidth = width;
            planeHeight = width / videoAspect;
        }

        // Create plane with video texture
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const material = new THREE.MeshBasicMaterial({ map: this.videoTexture });
        this.plane = new THREE.Mesh(geometry, material);
        this.scene.add(this.plane);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);

        // Create ASCII effect
        this.effect = new AsciiEffect(this.renderer, ' .:-+*=%@#', {
            invert: false,
            resolution: 0.15
        });
        this.effect.setSize(width, height);
        this.applyColorScheme();

        // Add to container
        this.container.innerHTML = '';
        this.container.appendChild(this.effect.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        this.effect.render(this.scene, this.camera);
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.left = width / -2;
        this.camera.right = width / 2;
        this.camera.top = height / 2;
        this.camera.bottom = height / -2;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.effect.setSize(width, height);

        if (this.video.videoWidth && this.video.videoHeight) {
            const videoAspect = this.video.videoWidth / this.video.videoHeight;
            const windowAspect = width / height;

            let planeWidth, planeHeight;

            if (windowAspect > videoAspect) {
                planeHeight = height;
                planeWidth = height * videoAspect;
            } else {
                planeWidth = width;
                planeHeight = width / videoAspect;
            }

            this.plane.geometry.dispose();
            this.plane.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        }
    }

    updateResolution(value) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.effect = new AsciiEffect(this.renderer, ' .:-+*=%@#', {
            invert: false,
            resolution: value
        });
        this.effect.setSize(width, height);
        this.applyColorScheme();

        this.container.innerHTML = '';
        this.container.appendChild(this.effect.domElement);
    }

    applyColorScheme() {
        const scheme = this.colorSchemes[this.currentColorScheme];
        this.effect.domElement.style.color = scheme.fg;
        this.effect.domElement.style.backgroundColor = scheme.bg;
    }

    async switchCamera() {
        if (!this.isRunning) return;

        this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';

        // Stop current stream
        this.stopStream();

        // Restart with new camera
        try {
            await this.initCamera();
            this.videoTexture.needsUpdate = true;
        } catch (error) {
            this.showError('Failed to switch camera: ' + error.message);
            this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        }
    }

    stop() {
        this.stopStream();

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.container) {
            this.container.innerHTML = '';
        }

        this.isRunning = false;
        this.updateButtons(false);
    }

    stopStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
    }

    updateButtons(isRunning) {
        document.getElementById('startBtn').disabled = isRunning;
        document.getElementById('stopBtn').disabled = !isRunning;
        document.getElementById('switchBtn').disabled = !isRunning;
    }

    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.classList.remove('hidden');
    }

    hideError() {
        this.errorElement.classList.add('hidden');
    }
}

// Initialize app when DOM is ready
const app = new AsciiCam();
