// Three.js Scene Setup (Magical Particle Field)
let scene, camera, renderer, particles;
function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const particleCount = 3000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
        new THREE.Color('#ff007f'), // Pink
        new THREE.Color('#ffd700'), // Gold
        new THREE.Color('#ffffff'), // White
        new THREE.Color('#00d2ff')  // Cyan
    ];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 5;
}

function animateParticles() {
    requestAnimationFrame(animateParticles);
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;
    renderer.render(scene, camera);
}

// // Local Image Paths
const imagePaths = [
    '1.jpeg',
    '2.jpeg',
    '3.jpeg',
    '4.jpg',
    '5.jpg',
    '6.jpeg',
    '7.jpeg',
    '8.jpg',
    '9.jpg',
    '10.jpeg',
    '11.jpeg',
    '12.jpeg',
    '13.jpg',
    '14.jpeg',
    '15.jpg',
    '16.jpg',
    '17.jpg',
    '18.jpg',
    '1.jpeg', // Duplicate 1 to make 20
    '2.jpeg'  // Duplicate 2 to make 20
];

// Slideshow Controller
class SlideshowController {
    constructor() {
        this.container = document.getElementById('slideshow');
        this.currentIdx = 0;
        this.isPaused = false;
        this.timeline = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.holdTimer = null;
        this.initTouch();
    }

    init() {
        this.container.innerHTML = '';
        imagePaths.forEach((path, i) => {
            const img = document.createElement('img');
            img.src = path;
            img.className = 'slide-img';
            img.alt = `Memory ${i + 1}`;
            this.container.appendChild(img);
        });
    }

    getTransitions(img, direction = 1) {
        const types = ['flip', 'scale', 'slide', 'roto'];
        const type = types[this.currentIdx % types.length];

        const configs = {
            flip: { rotationY: direction * 90, opacity: 0, scale: 0.8 },
            scale: { scale: 1.5, opacity: 0, filter: 'blur(10px)' },
            slide: { x: direction * 500, opacity: 0, rotationZ: direction * 10 },
            roto: { rotationZ: direction * 180, scale: 0, opacity: 0 }
        };
        return configs[type];
    }

    async playSequence() {
        const slides = document.querySelectorAll('.slide-img');
        if (this.currentIdx >= slides.length) return;

        this.timeline = gsap.timeline({
            onComplete: () => {
                this.currentIdx++;
                if (this.currentIdx < slides.length) {
                    this.playSequence();
                } else {
                    // Transition to next scene logic will be triggered by main timeline
                }
            }
        });

        const currentSlide = slides[this.currentIdx];

        // Entry Animation
        this.timeline.set(currentSlide, { visibility: 'visible', opacity: 0, scale: 0.5 });
        this.timeline.to(currentSlide, {
            opacity: 1,
            scale: 1,
            rotationY: 0,
            x: 0,
            rotationZ: 0,
            duration: 1.2,
            ease: "power3.out"
        });

        // Pause for viewing
        this.timeline.to({}, { duration: 2.5 });

        // Exit Animation
        const exitVars = this.getTransitions(currentSlide);
        this.timeline.to(currentSlide, {
            ...exitVars,
            duration: 1.2,
            ease: "power3.in"
        });
    }

    initTouch() {
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.isPaused = true;
            if (this.timeline) this.timeline.pause();

            // Interaction feedback
            gsap.to(this.container, { scale: 0.98, duration: 0.3 });
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleInteraction();
        }, { passive: true });
    }

    handleInteraction() {
        const diff = this.touchEndX - this.touchStartX;
        const threshold = 50;

        if (diff > threshold) {
            // Swipe Right (Go Back)
            this.goBack();
        } else {
            // Just a hold/tap, resume
            this.resume();
        }

        gsap.to(this.container, { scale: 1, duration: 0.3 });
    }

    goBack() {
        // Go back 2-3 slides
        const prevIdx = Math.max(0, this.currentIdx - 2);
        this.currentIdx = prevIdx;

        // Reset current animations
        gsap.killTweensOf('.slide-img');
        gsap.set('.slide-img', { opacity: 0, visibility: 'hidden' });

        this.isPaused = false;
        this.playSequence();
    }

    resume() {
        this.isPaused = false;
        if (this.timeline) this.timeline.resume();
    }
}

const slideshowControl = new SlideshowController();

// Main Cinematic Timeline (Automatic Playback)
function initCinematicExperience() {
    const mainTl = gsap.timeline();

    // Reset scenes
    gsap.set(".scene", { opacity: 0, display: "none" });

    // Scene 1: Entry
    mainTl.to("#scene-entry", { display: "flex", opacity: 1, duration: 2 })
        .to(".reveal-text", { opacity: 1, filter: "blur(0px)", y: -20, duration: 3, ease: "power2.out" })
        .to("#scene-entry", { opacity: 0, duration: 1.5, delay: 1.5, onComplete: () => gsap.set("#scene-entry", { display: "none" }) });

    // Scene 2: Reveal
    mainTl.to("#scene-reveal", { display: "flex", opacity: 1, duration: 1.5 })
        .from(".glow-text", { scale: 0.5, opacity: 0, duration: 2.5, ease: "back.out(1.7)" })
        .from(".sub-reveal", { y: 20, opacity: 0, duration: 1.5 }, "-=1")
        .to("#scene-reveal", { opacity: 0, duration: 1.5, delay: 2.5, onComplete: () => gsap.set("#scene-reveal", { display: "none" }) });

    // Scene 3: Journey (Stacked Transitions)
    mainTl.to("#scene-journey", {
        display: "flex",
        opacity: 1,
        duration: 1,
        onStart: () => {
            slideshowControl.init();
            slideshowControl.playSequence();
        }
    });

    // We need a way to wait for the slideshow sequence in the main timeline
    // Estimated duration: 20 images * (1.5 entry + 2.5 pause + 1.2 exit) = ~104s
    mainTl.to({}, { duration: 104 });

    mainTl.to("#scene-journey", {
        opacity: 0,
        duration: 1.5,
        onComplete: () => gsap.set("#scene-journey", { display: "none" })
    });

    // Scene 4: Story
    mainTl.to("#scene-story", { display: "flex", opacity: 1, duration: 1.2 });
    document.querySelectorAll('.story-line').forEach((line, i) => {
        mainTl.to(line, { opacity: 1, y: 0, duration: 3, ease: "power2.out" }, `-=${i === 0 ? 0 : 2}`);
    });
    mainTl.to("#scene-story", { opacity: 0, duration: 1.2, delay: 3, onComplete: () => gsap.set("#scene-story", { display: "none" }) });

    // Scene 5: Finale
    mainTl.to("#scene-finale", { display: "flex", opacity: 1, duration: 2 })
        .from(".grand-finale-text", { scale: 0.1, opacity: 0, duration: 3, ease: "elastic.out(1, 0.3)" });

    document.querySelectorAll('.finale-line').forEach((line, i) => {
        mainTl.to(line, { opacity: 1, y: 0, duration: 2, ease: "power2.out" }, `-=1`);
    });

    mainTl.to(".footer-note", { opacity: 1, duration: 2 }, "+=0.5")
        .add(() => {
            const count = 300;
            const defaults = { origin: { y: 0.7 } };
            function fire(particleRatio, opts) {
                confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
            }
            fire(0.25, { spread: 26, startVelocity: 65 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 55 });
        });

    // Camera movement throughout the timeline
    gsap.to(camera.position, { z: 2.2, duration: mainTl.duration(), ease: "none" });
}

// User Interaction Trigger
document.getElementById('play-btn').addEventListener('click', function () {
    const music = document.getElementById('bg-music');
    music.play().catch(e => console.log("Music play blocked", e));

    gsap.to(".music-trigger", {
        opacity: 0,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
            document.querySelector('.music-trigger').style.display = 'none';
        }
    });

    // Start Everything
    initThree();
    animateParticles();
    initCinematicExperience();
});

// Resize Handler
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
