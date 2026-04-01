// ==UserScript==
// @name         PiGallery2 Navigation
// @namespace    https://github.com/kennethsible
// @version      1.2
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

    let lastNav = 0;

    function handleEvent(e) {
        const controls = document.querySelector('div.controls');
        const lightbox = document.querySelector('div.lightbox');
        const infoPanel = document.querySelector('app-info-panel');
        const blackCanvas = document.querySelector('div.blackCanvas');
        const isPreviewOpen = getComputedStyle(blackCanvas).opacity === '1';
        const isInfoPanel = infoPanel?.offsetWidth > 0;
        const isVideoPlayer = lightbox.querySelector('div.controls-video');
        const buttonPressed = e.target.closest('button, ng-icon, #dropdown-basic');
        if (!isPreviewOpen || isInfoPanel || isVideoPlayer || buttonPressed) return;

        const screenWidth = window.innerWidth;
        const edgeLimit = screenWidth * 0.30;
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const navKey = clientX < edgeLimit ? 'ArrowLeft' : (clientX > screenWidth - edgeLimit ? 'ArrowRight' : null);
        if (!navKey) return;

        if (controls.classList.contains('dim-controls')) {
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
        }

        const isFinalAction = e.type === 'touchend' || e.type === 'click';
        if (isFinalAction && Date.now() - lastNav > 300) {
            lastNav = Date.now();
            window.dispatchEvent(new KeyboardEvent('keydown', { key: navKey, bubbles: true }));
        }
    }

    ['click', 'touchstart', 'touchend'].forEach(evt =>
        window.addEventListener(evt, handleEvent, { capture: true, passive: false })
    );
})();
