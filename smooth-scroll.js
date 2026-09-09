(() => {
    if (typeof window.Lenis !== 'function') return;

    window.cosmicScroll = new window.Lenis({
        autoRaf: true,
        anchors: true,
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
        stopInertiaOnNavigate: true,
        respectReducedMotion: true
    });
})();
