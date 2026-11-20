// ==UserScript==
// @name         PiGallery2 Navigation
// @namespace    https://github.com/kennethsible
// @version      1.5.1
// @description  Tap or click the edges of the screen to navigate the lightbox in PiGallery2.
// @author       Ken Sible
// @include      *://pigallery2.*
// @include      *://*.pigallery2.*
// @include      *://*/pigallery2/*
// @updateURL    https://raw.githubusercontent.com/kennethsible/pigallery2-navigation/main/pigallery2-nav.user.js
// @downloadURL  https://raw.githubusercontent.com/kennethsible/pigallery2-navigation/main/pigallery2-nav.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let lastTouchTime = 0;
    let touchStartTime = 0;
    const MAX_TOUCH_DURATION = 250;

    function triggerNav(navKey) {
        const arrow = document.querySelector(navKey === 'ArrowLeft' ? '#leftArrow' : '#rightArrow');
        if (arrow) {
            arrow.click();
            return;
        }
        const keyCode = navKey === 'ArrowLeft' ? 37 : 39;
        document.dispatchEvent(new KeyboardEvent('keydown', { key: navKey, code: navKey, keyCode, which: keyCode, bubbles: true }));
    }

    function handleEvent(e) {
        const blackCanvas = document.querySelector('div.blackCanvas');
        const isPreviewOpen = blackCanvas && getComputedStyle(blackCanvas).opacity === '1';

        const infoPanel = document.querySelector('app-info-panel');
        const isInfoPanel = infoPanel?.offsetWidth > 0;

        const controls = document.querySelector('div.controls');
        const lightbox = document.querySelector('div.lightbox');
        const isVideoPlayer = lightbox?.querySelector('div.controls-video');

        const buttonPressed = e.target.closest('button, [role="button"], .control-button, .navigation-arrow, ng-icon, #dropdown-basic');

        if (!isPreviewOpen || isInfoPanel || isVideoPlayer || buttonPressed) return;

        const screenWidth = window.innerWidth;
        const edgeLimit = screenWidth * 0.30;
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const navKey = clientX < edgeLimit ? 'ArrowLeft' : (clientX > screenWidth - edgeLimit ? 'ArrowRight' : null);

        if (!navKey) return;

        if (e.type === 'dblclick') {
            if (e.cancelable) e.preventDefault();
            e.stopImmediatePropagation();
            return;
        }

        if (controls?.classList.contains('dim-controls')) {
            if (e.cancelable) e.preventDefault();
            e.stopImmediatePropagation();
        }

        if (e.type === 'pointerdown' || e.type === 'touchstart') {
            touchStartTime = Date.now();
        }

        if (e.type === 'pointerup' || e.type === 'touchend') {
            lastTouchTime = Date.now();
            const touchDuration = Date.now() - touchStartTime;
            touchStartTime = 0;
            if (touchDuration <= MAX_TOUCH_DURATION) {
                triggerNav(navKey);
            }
        }

        if (e.type === 'click') {
            if (Date.now() - lastTouchTime > 500) {
                triggerNav(navKey);
            }
        }
    }

    ['pointerdown', 'pointerup', 'click', 'dblclick', 'touchstart', 'touchend'].forEach(evt =>
        window.addEventListener(evt, handleEvent, { capture: true, passive: false })
    );
})();
