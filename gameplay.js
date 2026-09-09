(() => {
    const video = document.querySelector('#gameplay-video');
    const toggle = document.querySelector('.video-toggle');
    if (!video || !toggle) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    let userPaused = false;
    let userStarted = false;

    video.controls = false;
    video.muted = true;
    toggle.hidden = false;

    const updateLabel = () => {
        toggle.textContent = video.paused ? 'Play gameplay' : 'Pause gameplay';
    };

    const updatePlayback = () => {
        const shouldPlay = inView && !document.hidden && !userPaused
            && (!reducedMotion.matches || userStarted);
        if (shouldPlay) {
            video.play().catch(updateLabel);
        } else {
            video.pause();
        }
    };

    toggle.addEventListener('click', () => {
        if (video.paused) {
            userPaused = false;
            userStarted = true;
            video.play().catch(updateLabel);
        } else {
            userPaused = true;
            video.pause();
        }
    });

    video.addEventListener('play', updateLabel);
    video.addEventListener('pause', updateLabel);
    document.addEventListener('visibilitychange', updatePlayback);
    reducedMotion.addEventListener('change', () => {
        userStarted = false;
        updatePlayback();
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting && entry.intersectionRatio >= 0.3;
            updatePlayback();
        }, { threshold: [0, 0.3] });
        observer.observe(video);
    }

    const showcase = document.querySelector('.gameplay-showcase');
    const track = document.querySelector('.video-track');
    const preview = document.querySelector('.gameplay-preview');
    const previewVideo = preview?.querySelector('video');
    const stage = document.querySelector('.orbit-stage');
    const orbit = document.querySelector('.orbit-path');
    const route = document.querySelector('.orbit-route');
    const reveal = document.querySelector('.orbit-reveal');
    const mask = document.querySelector('#orbit-reveal-mask');
    const sun = document.querySelector('.orbit-sun');
    if (!showcase || !track || !preview || !previewVideo || !stage || !orbit || !route || !reveal || !mask) return;

    // Fit the same ordered, looping route to the actual planet centres at each size.
    const rebuildRoute = () => {
        const bounds = stage.getBoundingClientRect();
        if (sun) sun.style.left = `${document.documentElement.clientWidth / 2 - bounds.left}px`;
        const points = [...stage.querySelectorAll('.planet')].map(planet => {
            const rect = planet.getBoundingClientRect();
            return { x: rect.left + rect.width / 2 - bounds.left,
                y: rect.top + rect.height / 2 - bounds.top };
        });
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let index = 1; index < points.length; index += 1) {
            const from = points[index - 1];
            const to = points[index];
            const bend = (to.y - from.y) * 0.65;
            if (index === 2 || index === 6) {
                const x = (from.x + to.x) / 2;
                const y = (from.y + to.y) / 2;
                const r = Math.min(38, bounds.width * 0.1);
                d += ` C ${from.x} ${from.y + bend} ${x + r} ${y - r} ${x} ${y}`;
                d += ` C ${x - r * 2} ${y + r * 2} ${x - r * 2} ${y - r * 2} ${x} ${y}`;
                d += ` C ${x + r} ${y + r} ${to.x} ${to.y - bend} ${to.x} ${to.y}`;
            } else {
                d += ` C ${from.x} ${from.y + bend} ${to.x} ${to.y - bend} ${to.x} ${to.y}`;
            }
        }
        orbit.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
        const left = Math.min(0, ...points.map(point => point.x)) - 100;
        mask.setAttribute('x', left);
        mask.setAttribute('y', -10);
        mask.setAttribute('width', bounds.width - left + 100);
        mask.setAttribute('height', bounds.height + 20);
        route.setAttribute('d', d);
        reveal.setAttribute('d', d);
    };

    // Enter low, cross the viewport while the planets pass, then leave after the finale.
    let framePending = false;
    let currentPlanetShift = 0;
    let layout;
    const updateScroll = () => {
        framePending = false;
        const { trackTop, naturalStageTop, sectionTop, height, start,
            routeEnd, finaleTravel, planetLimit, videoLowTop,
            videoHighTop } = layout;
        const scroll = window.scrollY;
        const travel = Math.max(0, scroll - start);
        const showcaseTravel = Math.min(travel, finaleTravel);
        const showcaseProgress = Math.min(1, showcaseTravel / Math.max(1, finaleTravel));
        const videoShift = reducedMotion.matches ? 0
            : showcaseTravel - (videoLowTop - videoHighTop) * showcaseProgress;
        const planetShift = reducedMotion.matches ? 0
            : -Math.min(planetLimit, travel * 0.2);
        const stageTop = naturalStageTop - scroll + planetShift;
        const progress = reducedMotion.matches ? 1
            : Math.max(0, Math.min(1, (height * 0.8 - stageTop) / routeEnd));
        const sunTop = stageTop + routeEnd;
        const videoTop = trackTop - scroll + videoShift;
        const videoBottom = videoTop + layout.videoHeight;
        // The Sun has a soft visual tail. Permanently clip gameplay behind its
        // leading edge so that transparency cannot reveal the video again.
        const sunEdgeAtVideo = sunTop + Math.min(54, height * 0.06);
        const sunCover = Math.max(0, Math.min(layout.videoHeight,
            videoBottom - sunEdgeAtVideo));
        const smooth = value => {
            const t = Math.max(0, Math.min(1, value));
            return t * t * (3 - 2 * t);
        };
        // The horizon emerges at the end of the chain and the section clips its exit.
        const appear = reducedMotion.matches ? 1
            : smooth((height * 0.95 - sunTop) / (height * 0.35));
        const disappear = reducedMotion.matches ? 0
            : smooth((height * 0.32 - sunTop) / (height * 0.42));
        const sunOpacity = appear;
        preview.style.setProperty('--video-shift', `${videoShift}px`);
        preview.style.setProperty('--video-sun-cover', `${sunCover}px`);
        stage.style.setProperty('--planet-shift', `${planetShift}px`);
        reveal.style.strokeDashoffset = (1 - progress).toFixed(4);
        showcase.style.setProperty('--sun-top', `${sunTop - sectionTop + scroll}px`);
        showcase.style.setProperty('--sun-opacity', sunOpacity.toFixed(4));
        route.style.opacity = (1 - disappear).toFixed(4);
        currentPlanetShift = planetShift;
    };
    const scheduleScroll = () => {
        if (!framePending) {
            framePending = true;
            window.requestAnimationFrame(updateScroll);
        }
    };
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    const updateLayout = () => {
        rebuildRoute();
        const scroll = window.scrollY;
        const height = window.innerHeight;
        const trackTop = track.getBoundingClientRect().top + scroll;
        const naturalStageTop = stage.getBoundingClientRect().top - currentPlanetShift + scroll;
        const freeViewport = Math.max(0, height - preview.offsetHeight - 48);
        const videoHighTop = 24 + freeViewport * 0.3;
        const videoLowTop = 24 + freeViewport * 0.7;
        const start = Math.max(0, trackTop - videoLowTop);
        const routeEnd = sun ? sun.offsetTop : stage.clientHeight;
        layout = { trackTop, naturalStageTop, height, start, routeEnd,
            sectionTop: showcase.getBoundingClientRect().top + scroll,
            finaleTravel: Math.max(0, (naturalStageTop + routeEnd - start - height * 0.1) / 1.2),
            planetLimit: stage.clientHeight * 0.22,
            videoHeight: previewVideo.offsetHeight,
            videoLowTop,
            videoHighTop };
        scheduleScroll();
    };
    window.addEventListener('resize', updateLayout);
    reducedMotion.addEventListener('change', scheduleScroll);
    if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(updateLayout);
        resizeObserver.observe(track);
        resizeObserver.observe(preview);
        resizeObserver.observe(stage);
    }
    updateLayout();
})();
