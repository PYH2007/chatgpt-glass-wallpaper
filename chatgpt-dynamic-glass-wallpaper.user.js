// ==UserScript==
// @name         ChatGPT Dynamic Glass Wallpaper
// @namespace    chatgpt-wallpaper
// @version      1.9.21
// @description  ChatGPT local image or video wallpaper
// @match        https://chatgpt.com/*
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/PYH2007/chatgpt-glass-wallpaper/main/chatgpt-dynamic-glass-wallpaper.user.js
// @downloadURL  https://raw.githubusercontent.com/PYH2007/chatgpt-glass-wallpaper/main/chatgpt-dynamic-glass-wallpaper.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // é¦–æ¬¡è¿è¡Œæ—¶é€‰æ‹©ä¸€æ¬¡è§†é¢‘ï¼Œä¹‹åŽä¼šè‡ªåŠ¨ä»Žæµè§ˆå™¨å­˜å‚¨ä¸­è¯»å–ã€‚
    const WALLPAPER_DB_NAME = 'ChatGPTWallpaperDB';
    const WALLPAPER_STORE_NAME = 'wallpapers';
    const WALLPAPER_RECORD_KEY = 'active-video';
    const PREVIOUS_VIDEO_RECORD_KEY = 'previous-video';
    const SUMMARY_PANEL_HIDDEN_KEY = 'gpt-wallpaper-hide-summary-panel';

    // Hide the Work Outputs/Sources card by default. Option+Shift+O toggles it.
    document.body.classList.toggle(
        'gpt-hide-work-summary',
        localStorage.getItem(SUMMARY_PANEL_HIDDEN_KEY) !== 'false'
    );
    document.addEventListener('keydown', (event) => {
        if (
            event.code !== 'KeyO' ||
            !event.altKey ||
            !event.shiftKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.repeat
        ) return;

        event.preventDefault();
        const hidden = document.body.classList.toggle('gpt-hide-work-summary');
        localStorage.setItem(SUMMARY_PANEL_HIDDEN_KEY, String(hidden));
    }, true);

    /*
    ============================================================
    MODULE 1ï¼šå¸¸ç”¨å‚æ•°æŽ§åˆ¶é¢æ¿
    ============================================================

    ä»¥åŽè°ƒæ•´å£çº¸æ•ˆæžœï¼Œåªä¿®æ”¹è¿™é‡Œã€‚
    ä¸éœ€è¦ä¿®æ”¹ä¸‹é¢å…¶ä»–æ¨¡å—ã€‚
    */

    const SETTINGS = {

        /*
        --------------------------------------------------------
        å£çº¸äº®åº¦
        --------------------------------------------------------

        1.00 = åŽŸå§‹äº®åº¦
        0.80 = ç¨å¾®å˜æš—
        0.65 = æŽ¨è
        0.40 = å¾ˆæš—
        1.20 = æ¯”åŽŸè§†é¢‘æ›´äº®
        */

        wallpaperBrightness: 0.65,


        /*
        --------------------------------------------------------
        å£çº¸æ•´ä½“æ¨¡ç³Š
        --------------------------------------------------------

        0  = å®Œå…¨ä¸æ¨¡ç³Š
        2  = è½»å¾®æ¨¡ç³Š
        5  = æ˜Žæ˜¾æ¨¡ç³Š

        æ³¨æ„ï¼šè¿™æŽ§åˆ¶çš„æ˜¯å£çº¸æœ¬èº«ï¼Œä¸æ˜¯æ¯›çŽ»ç’ƒé¢æ¿ã€‚
        */

        wallpaperBlur: 0,


        /*
        --------------------------------------------------------
        å£çº¸é¥±å’Œåº¦
        --------------------------------------------------------

        1.00 = åŽŸå§‹é¢œè‰²
        0.80 = é¢œè‰²ç¨æ·¡
        1.20 = é¢œè‰²æ›´é²œè‰³
        */

        wallpaperSaturation: 1.00,


        /*
        --------------------------------------------------------
        å£çº¸ç¼©æ”¾
        --------------------------------------------------------

        1.00 = æ­£å¸¸
        1.05 = æ”¾å¤§ 5%
        1.10 = æ”¾å¤§ 10%
        */

        wallpaperScale: 1.00,


        /*
        --------------------------------------------------------
        å£çº¸ä½ç½®
        --------------------------------------------------------

        'center center' = å±…ä¸­
        'center top'    = é ä¸Š
        'center bottom' = é ä¸‹
        'left center'   = é å·¦
        'right center'  = é å³
        */

        wallpaperPosition: 'center center',


        /*
        --------------------------------------------------------
        è§†é¢‘æ’­æ”¾é€Ÿåº¦
        --------------------------------------------------------

        1.00 = åŽŸé€Ÿåº¦
        0.80 = æ…¢ä¸€äº›
        1.20 = å¿«ä¸€äº›
        */

        playbackSpeed: 1.00,


        /*
        --------------------------------------------------------
        æ¯›çŽ»ç’ƒå¼ºåº¦
        --------------------------------------------------------

        0  = ä¸æ¨¡ç³Š
        12 = è½»åº¦æ¯›çŽ»ç’ƒ
        18 = æŽ¨è
        25 = å¼ºæ¯›çŽ»ç’ƒ
        */

        glassBlur: 18,


        /*
        --------------------------------------------------------
        å„åŒºåŸŸé€æ˜Žåº¦
        --------------------------------------------------------

        æ•°å€¼è¶Šå°è¶Šé€æ˜Žã€‚
        0.00 = å®Œå…¨é€æ˜Ž
        1.00 = å®Œå…¨ä¸é€æ˜Ž
        */

        mainBackgroundOpacity: 0.10,
        sidebarOpacity: 0.16,
        composerOpacity: 0.48,
        userMessageOpacity: 0.46,
        panelOpacity: 0.44,
        codeBlockOpacity: 0.62,


        /*
        --------------------------------------------------------
        æ–‡å­—é˜´å½±
        --------------------------------------------------------

        true  = å¼€å¯ï¼Œè®©æ–‡å­—åœ¨å£çº¸ä¸Šæ›´æ¸…æ¥š
        false = å…³é—­
        */

        textShadow: true
    };

        /*
    ============================================================
    MODULE 2ï¼šåˆ›å»ºå¹¶åŠ è½½åŠ¨æ€å£çº¸
    ============================================================
    */

    document
        .getElementById('gpt-video-wallpaper')
        ?.remove();

    document
        .getElementById('gpt-image-wallpaper')
        ?.remove();

    document
        .getElementById('gpt-wallpaper-module-2-style')
        ?.remove();

    document
        .getElementById('gpt-wallpaper-error-message')
        ?.remove();


    /*
    å…ˆç«‹å³åˆ›å»ºè§†é¢‘å…ƒç´ ã€‚
    Module 9 æ‰§è¡Œæ—¶å°±èƒ½å¤Ÿæ‰¾åˆ°å®ƒã€‚
    */

    const wallpaperVideo =
        document.createElement('video');

    wallpaperVideo.id = 'gpt-video-wallpaper';

    wallpaperVideo.autoplay = false; // Explicit playback obeys visibility and user pause.
    wallpaperVideo.loop = true;
    wallpaperVideo.muted = true;
    wallpaperVideo.playsInline = true;
    wallpaperVideo.volume = 0;

    wallpaperVideo.setAttribute('muted', '');
    wallpaperVideo.setAttribute('playsinline', '');
    wallpaperVideo.setAttribute('aria-hidden', 'true');
    wallpaperVideo.setAttribute('tabindex', '-1');

    document.body.prepend(wallpaperVideo);

    const wallpaperImage = document.createElement('img');
    wallpaperImage.id = 'gpt-image-wallpaper';
    wallpaperImage.alt = '';
    wallpaperImage.setAttribute('aria-hidden', 'true');
    wallpaperImage.style.display = 'none';
    document.body.prepend(wallpaperImage);


    /*
    å£çº¸æ ·å¼ã€‚
    */

    const module2Style =
        document.createElement('style');

    module2Style.id =
        'gpt-wallpaper-module-2-style';

    module2Style.textContent = `
        #gpt-video-wallpaper,
        #gpt-image-wallpaper {
            position: fixed;
            inset: 0;

            width: 100vw;
            height: 100vh;

            object-fit: cover;
            object-position:
                ${SETTINGS.wallpaperPosition};

            transform:
                scale(${SETTINGS.wallpaperScale});

            transform-origin: center center;

            filter:
                brightness(${SETTINGS.wallpaperBrightness})
                saturate(${SETTINGS.wallpaperSaturation})
                blur(${SETTINGS.wallpaperBlur}px);

            z-index: -1;
            pointer-events: none;

            background-color: #05070c;
        }

        #gpt-image-wallpaper {
            filter:
                brightness(1)
                saturate(${SETTINGS.wallpaperSaturation})
                blur(${SETTINGS.wallpaperBlur}px);
        }
    `;

    document.documentElement.appendChild(
        module2Style
    );


    /*
    Chrome ä¸å…è®¸ HTTPS é¡µé¢ç›´æŽ¥æ’­æ”¾ file:// æˆ– localhost è§†é¢‘ã€‚
    è¿™é‡Œè®©ç”¨æˆ·é€‰æ‹©ä¸€æ¬¡æ–‡ä»¶ï¼ŒæŠŠè§†é¢‘ä¿å­˜åˆ° IndexedDBï¼Œä¹‹åŽä½¿ç”¨
    ChatGPT CSP æ˜Žç¡®å…è®¸çš„ blob: URL æ’­æ”¾ã€‚
    */

    let wallpaperObjectURL = null;
    let wallpaperUserPaused = false;

    function wallpaperCanPlay() {
        return !document.hidden && !wallpaperUserPaused &&
            wallpaperVideo.isConnected && Boolean(wallpaperVideo.getAttribute('src')) &&
            wallpaperImage.style.display !== 'block';
    }

    function openWallpaperDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(
                WALLPAPER_DB_NAME,
                1
            );

            request.onupgradeneeded = () => {
                const database = request.result;

                if (!database.objectStoreNames.contains(WALLPAPER_STORE_NAME)) {
                    database.createObjectStore(WALLPAPER_STORE_NAME);
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function readSavedWallpaper() {
        const database = await openWallpaperDatabase();

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(
                WALLPAPER_STORE_NAME,
                'readonly'
            );

            const request = transaction
                .objectStore(WALLPAPER_STORE_NAME)
                .get(WALLPAPER_RECORD_KEY);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
            transaction.oncomplete = () => database.close();
        });
    }

    async function saveWallpaperFile(file) {
        const database = await openWallpaperDatabase();

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(
                WALLPAPER_STORE_NAME,
                'readwrite'
            );

            const store = transaction.objectStore(WALLPAPER_STORE_NAME);
            const previousRequest = store.get(WALLPAPER_RECORD_KEY);

            previousRequest.onsuccess = () => {
                const previous = previousRequest.result;
                if (file.type.startsWith('image/') && previous?.type?.startsWith('video/')) {
                    store.put(previous, PREVIOUS_VIDEO_RECORD_KEY);
                }
                store.put(file, WALLPAPER_RECORD_KEY);
            };

            transaction.oncomplete = () => {
                database.close();
                resolve();
            };

            transaction.onerror = () => {
                database.close();
                reject(transaction.error);
            };
        });
    }

    function applyWallpaperBlob(wallpaperBlob) {
        wallpaperUserPaused = false;
        if (wallpaperObjectURL) {
            URL.revokeObjectURL(wallpaperObjectURL);
        }

        wallpaperObjectURL = URL.createObjectURL(wallpaperBlob);
        if (wallpaperBlob.type.startsWith('image/')) {
            document.body.classList.add('gpt-wallpaper-image-active');
            wallpaperVideo.pause();
            wallpaperVideo.removeAttribute('src');
            wallpaperVideo.load();
            wallpaperVideo.style.display = 'none';
            wallpaperImage.src = wallpaperObjectURL;
            wallpaperImage.style.display = 'block';
        } else {
            document.body.classList.remove('gpt-wallpaper-image-active');
            wallpaperImage.removeAttribute('src');
            wallpaperImage.style.display = 'none';
            wallpaperVideo.style.display = 'block';
            wallpaperVideo.src = wallpaperObjectURL;
            wallpaperVideo.playbackRate = SETTINGS.playbackSpeed;
            wallpaperVideo.load();
        }
    }

    function showWallpaperPicker(openImmediately = false) {
        if (document.getElementById('gpt-wallpaper-file-picker')) {
            if (openImmediately) {
                document.getElementById('gpt-wallpaper-file-input')?.click();
            }
            return;
        }

        const hadWallpaper = Boolean(wallpaperVideo.currentSrc || wallpaperImage.src);
        const input = document.createElement('input');
        input.id = 'gpt-wallpaper-file-input';
        input.type = 'file';
        input.accept = 'image/*,video/*,.png,.jpg,.jpeg,.webp,.mp4,.webm,.mov';
        input.style.display = 'none';

        const button = document.createElement('button');
        button.id = 'gpt-wallpaper-file-picker';
        button.type = 'button';
        button.textContent = '选择图片或视频壁纸';

        Object.assign(button.style, {
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '2147483647',
            padding: '14px 22px',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#ffffff',
            background: 'rgba(20,45,85,0.94)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
        });

        button.addEventListener('click', () => input.click());

        input.addEventListener('change', async () => {
            const selectedFile = input.files?.[0];

            if (!selectedFile) {
                return;
            }

            button.disabled = true;
            button.textContent = '正在保存壁纸，请稍候…';

            try {
                await saveWallpaperFile(selectedFile);
                await navigator.storage?.persist?.().catch(() => false);
                applyWallpaperBlob(selectedFile);
                button.remove();
                input.remove();
            } catch (error) {
                console.error(
                    '[Wallpaper Module 2] Saving selected video failed:',
                    error
                );

                button.disabled = false;
                button.textContent = '保存失败，请重新选择';
            }
        });

        input.addEventListener('cancel', () => {
            if (hadWallpaper) {
                button.remove();
                input.remove();
            }
        });

        document.body.append(input, button);

        if (openImmediately) {
            input.click();
        }
    }

    // Option + Shift + W opens the local image or video picker.
    document.addEventListener('keydown', (event) => {
        if (
            event.code !== 'KeyW' ||
            !event.altKey ||
            !event.shiftKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.repeat
        ) {
            return;
        }

        event.preventDefault();
        showWallpaperPicker(true);
    }, true);

    wallpaperVideo.addEventListener('loadeddata', async () => {
        wallpaperVideo.playbackRate = SETTINGS.playbackSpeed;

        if (!wallpaperCanPlay()) return;
        try {
            await wallpaperVideo.play();
            if (!wallpaperCanPlay()) wallpaperVideo.pause();
            console.log('[Wallpaper Module 2] Video loaded successfully.');
        } catch (playError) {
            console.warn(
                '[Wallpaper Module 2] Click the page once to start playback.',
                playError
            );
        }
    });

    wallpaperVideo.addEventListener('error', () => {
        console.error(
            '[Wallpaper Module 2] Video loading error:',
            wallpaperVideo.error
        );
    });

    async function loadWallpaperResource() {
        try {
            const savedWallpaper = await readSavedWallpaper();

            if (savedWallpaper) {
                applyWallpaperBlob(savedWallpaper);
            } else {
                showWallpaperPicker();
            }
        } catch (error) {
            console.error(
                '[Wallpaper Module 2] Browser storage failed:',
                error
            );

            showWallpaperPicker();
        }
    }


    /*
    æµè§ˆå™¨é˜»æ­¢è‡ªåŠ¨æ’­æ”¾æ—¶ï¼Œ
    ç‚¹å‡»é¡µé¢ä¸€æ¬¡å³å¯å¼€å§‹ã€‚
    */

    document.addEventListener(
        'pointerdown',
        () => {
            if (wallpaperCanPlay()) wallpaperVideo.play().catch(() => {});
        },
        {
            once: true,
            passive: true
        }
    );


    /*
    å¼€å§‹è¯»å–æœ¬åœ°å£çº¸ã€‚
    */

    loadWallpaperResource();

     /*
    MODULE 3ï¼šæ¸…é™¤å¤–å±‚å®žè‰²èƒŒæ™¯
    */

    document
        .getElementById('gpt-wallpaper-module-3-style')
        ?.remove();

    const module3Style = document.createElement('style');

    module3Style.id = 'gpt-wallpaper-module-3-style';

    module3Style.textContent = `
        :root {
            --main-surface-primary: transparent !important;
            --main-surface-secondary: transparent !important;
        }

        html,
        body,
        #root,
        #__next {
            background-color: transparent !important;
            background-image: none !important;
        }

        /*
        åˆ›å»ºç‹¬ç«‹çš„ stacking contextï¼Œè®© z-index: -1 çš„è§†é¢‘
        åªé€€åˆ° ChatGPT å†…å®¹åŽé¢ï¼Œä¸ä¼šæŽ‰åˆ°æ•´ä¸ªç½‘é¡µç”»å¸ƒåŽé¢ã€‚
        è¿™ä¸ä¿®æ”¹é¡µé¢ positionï¼Œå› æ­¤ä¸ä¼šå†æ¬¡é€ æˆé¡µé¢é”™ä½ã€‚
        */

        body {
            isolation: isolate !important;
        }

        /*
        æ¸…é™¤ ChatGPT æœ€å¤–å±‚é»‘è‰²èƒŒæ™¯ã€‚
        åªä¿®æ”¹èƒŒæ™¯å’Œå±‚çº§ï¼Œä¸ä¿®æ”¹ positionã€‚
        */

        body:not([data-gpt-dot-ui]) > div:not(#gpt-video-wallpaper):not(#gpt-wallpaper-loading-status):not(#gpt-wallpaper-error-message) {
            z-index: 1;
            background-color: transparent !important;
            background-image: none !important;
        }

        body:not([data-gpt-dot-ui]) > div:not(#gpt-video-wallpaper) > div {
            background-color: transparent !important;
            background-image: none !important;
        }

        main,
        main > div,
        main > div > div {
            background-color: transparent !important;
            background-image: none !important;
        }

        main,
        main > div {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            box-shadow: none !important;
        }

        .bg-token-main-surface-primary,
        [class~="bg-token-main-surface-primary"],
        [class*="bg-token-main-surface-primary"] {
            background-color: transparent !important;
            background-image: none !important;
        }

        .bg-token-main-surface-secondary,
        [class~="bg-token-main-surface-secondary"],
        [class*="bg-token-main-surface-secondary"] {
            background-color: transparent !important;
            background-image: none !important;
        }

        [class*="bg-token-bg-primary"] {
            background-color: transparent !important;
            background-image: none !important;
        }

        [class*="from-token-main-surface-primary"],
        [class*="via-token-main-surface-primary"],
        [class*="to-token-main-surface-primary"] {
            --tw-gradient-from: transparent !important;
            --tw-gradient-via: transparent !important;
            --tw-gradient-to: transparent !important;
        }

        body:not(.gpt-wallpaper-image-active) #gpt-video-wallpaper {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: -1 !important;
        }

        body.gpt-wallpaper-image-active #gpt-video-wallpaper {
            display: none !important;
        }

        #gpt-image-wallpaper {
            z-index: -1 !important;
            pointer-events: none !important;
        }
    `;

    document.documentElement.appendChild(module3Style);
        /*
    ============================================================
    MODULE 4ï¼šå·¦ä¾§è¾¹æ æ¯›çŽ»ç’ƒ
    ============================================================

    å¤„ç†ï¼š

    - Chat / Work åŒºåŸŸ
    - å¯¹è¯åˆ—è¡¨
    - Projects åŒºåŸŸ
    - å·¦ä¸‹è§’è´¦å·åŒºåŸŸ
    - ä¾§è¾¹æ å±•å¼€ä¸Žæ”¶èµ·çŠ¶æ€

    åªä¿®æ”¹è§†è§‰æ•ˆæžœï¼Œä¸ä¿®æ”¹å¸ƒå±€ã€‚
    */


    /*
    é˜²æ­¢é‡å¤æ·»åŠ æ ·å¼ã€‚
    */

    const oldModule4Style =
        document.getElementById(
            'gpt-wallpaper-module-4-style'
        );

    if (oldModule4Style) {
        oldModule4Style.remove();
    }


    const module4Style =
        document.createElement('style');

    module4Style.id =
        'gpt-wallpaper-module-4-style';

    module4Style.textContent = `

        /*
        ä¿®æ”¹ ChatGPT ä¾§è¾¹æ èƒŒæ™¯å˜é‡ã€‚
        */

        :root {
            --sidebar-surface-primary:
                rgba(
                    8,
                    14,
                    24,
                    ${SETTINGS.sidebarOpacity}
                ) !important;

            --sidebar-surface-secondary:
                rgba(
                    12,
                    19,
                    31,
                    ${Math.min(
                        SETTINGS.sidebarOpacity + 0.08,
                        1
                    )}
                ) !important;
        }


        /*
        ä¾§è¾¹æ ä¸»ä½“ã€‚
        */

        aside,
        nav {
            background-color:
                rgba(
                    8,
                    14,
                    24,
                    ${SETTINGS.sidebarOpacity}
                ) !important;

            background-image: none !important;

            backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(135%) !important;

            -webkit-backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(135%) !important;

            border-color:
                rgba(255, 255, 255, 0.10) !important;
        }


        /*
        ChatGPT çš„ä¾§è¾¹æ èƒŒæ™¯ classã€‚
        */

        .bg-token-sidebar-surface-primary,
        [class~="bg-token-sidebar-surface-primary"] {
            background-color:
                rgba(
                    8,
                    14,
                    24,
                    ${SETTINGS.sidebarOpacity}
                ) !important;

            background-image: none !important;

            backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(135%) !important;

            -webkit-backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(135%) !important;
        }


        .bg-token-sidebar-surface-secondary,
        [class~="bg-token-sidebar-surface-secondary"] {
            background-color:
                rgba(
                    12,
                    19,
                    31,
                    ${Math.min(
                        SETTINGS.sidebarOpacity + 0.08,
                        1
                    )}
                ) !important;

            background-image: none !important;
        }


        /*
        ä¾§è¾¹æ ä¸­çš„æ‚¬åœé¡¹ç›®ã€‚

        ä¸æ”¹å˜æŒ‰é’®å°ºå¯¸ï¼Œåªæ”¹å˜èƒŒæ™¯é¢œè‰²ã€‚
        */

        aside a:hover,
        aside button:hover,
        nav a:hover,
        nav button:hover {
            background-color:
                rgba(255, 255, 255, 0.10) !important;
        }


        /*
        ä¾§è¾¹æ å½“å‰é€‰ä¸­çš„é¡¹ç›®ã€‚
        */

        aside [aria-current="page"],
        nav [aria-current="page"] {
            background-color:
                rgba(255, 255, 255, 0.13) !important;

            border-color:
                rgba(255, 255, 255, 0.10) !important;
        }
    `;

    document.documentElement.appendChild(
        module4Style
    );
        /*
    ============================================================
    MODULE 5ï¼šé¡¶éƒ¨å·¥å…·æ æ¯›çŽ»ç’ƒ
    ============================================================

    å¤„ç†ï¼š

    - é¡¶éƒ¨ Chat / Work åŒºåŸŸ
    - æ¨¡åž‹é€‰æ‹©å™¨
    - å³ä¸Šè§’æŒ‰é’®
    - åˆ†äº«æŒ‰é’®
    - ä¸´æ—¶èŠå¤©æŒ‰é’®
    - å¤´åƒåŠå…¶ä»–é¡¶éƒ¨æŽ§ä»¶
    */


    /*
    é˜²æ­¢é‡å¤æ·»åŠ æ ·å¼ã€‚
    */

    const oldModule5Style =
        document.getElementById(
            'gpt-wallpaper-module-5-style'
        );

    if (oldModule5Style) {
        oldModule5Style.remove();
    }


    const module5Style =
        document.createElement('style');

    module5Style.id =
        'gpt-wallpaper-module-5-style';

    module5Style.textContent = `
        /* é¡¶éƒ¨æ•´æ¡åŒºåŸŸå®Œå…¨é€æ˜Žï¼Œä¸å†è¦†ç›–å…¨å®½æ¯›çŽ»ç’ƒã€‚ */
        header,
        [data-testid="page-header"],
        [data-testid*="page-header"] {
            background-color: transparent !important;
            background-image: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border-color: transparent !important;
            box-shadow: none !important;
        }

        /* æ¸…é™¤ header å†…ç”¨äºŽèƒŒæ™¯å’Œæ¸å˜çš„ token å±‚ã€‚ */
        header [class*="bg-token-main-surface"],
        [data-testid="page-header"] [class*="bg-token-main-surface"],
        [data-testid*="page-header"] [class*="bg-token-main-surface"],
        header::before,
        header::after,
        [data-testid="page-header"]::before,
        [data-testid="page-header"]::after,
        [data-testid*="page-header"]::before,
        [data-testid*="page-header"]::after {
            background-color: transparent !important;
            background-image: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            box-shadow: none !important;
        }

        /* é¡¶éƒ¨æ™®é€šæŒ‰é’®é»˜è®¤é€æ˜Žã€‚ */
        header button,
        header [role="button"],
        [data-testid="page-header"] button,
        [data-testid*="page-header"] button {
            background-color: transparent !important;
            background-image: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border-color: transparent !important;
            box-shadow: none !important;
        }

        /* é¡¶éƒ¨æŒ‰é’®åªæœ‰ hover æ—¶æ˜¾ç¤ºå¾ˆæ·¡çš„åé¦ˆã€‚ */
        header button:hover,
        header [role="button"]:hover,
        [data-testid="page-header"] button:hover,
        [data-testid*="page-header"] button:hover {
            background-color: rgba(255, 255, 255, 0.09) !important;
        }

        /* Share ä¿ç•™è½»è¾¹æ¡†ï¼Œä½†ä¸ä½¿ç”¨é»‘è‰²å¡«å……ã€‚ */
        [data-testid*="share"] {
            background-color: rgba(18, 34, 57, 0.08) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border: 1px solid rgba(255, 255, 255, 0.18) !important;
            box-shadow: none !important;
        }

        /* æ™®é€šèœå•è§¦å‘å™¨ä¹Ÿä¿æŒé€æ˜Žã€‚ */
        header [aria-haspopup="menu"],
        header [aria-haspopup="listbox"] {
            background-color: transparent !important;
            border-color: transparent !important;
            box-shadow: none !important;
        }

        /*
        JavaScript æ ‡è®°å‡ºçš„ Chat / Work å±€éƒ¨åˆ‡æ¢å™¨ã€‚
        åªå…è®¸è¿™ä¸ªå°ç»„ä»¶æœ‰ä¸€å±‚éžå¸¸è½»çš„é€æ˜Žåº•ã€‚
        */
        .gpt-chat-work-switch {
            background: transparent !important;
            background-image: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border: 1px solid rgba(255, 255, 255, 0.14) !important;
            box-shadow: none !important;
            color: white !important;
            text-shadow: none !important;
        }

        .gpt-chat-work-switch a,
        .gpt-chat-work-switch button,
        .gpt-chat-work-switch [role="tab"] {
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            box-shadow: none !important;
            color: white !important;
            text-shadow: none !important;
        }

        .gpt-chat-work-switch a:hover,
        .gpt-chat-work-switch a[aria-current="page"],
        .gpt-chat-work-switch button:hover,
        .gpt-chat-work-switch [role="tab"]:hover,
        .gpt-chat-work-switch button[aria-selected="true"],
        .gpt-chat-work-switch [role="tab"][aria-selected="true"],
        .gpt-chat-work-switch button[aria-pressed="true"],
        .gpt-chat-work-switch [data-state="active"] {
            background: rgba(255, 255, 255, 0.06) !important;
        }
    `;

    document.documentElement.appendChild(
        module5Style
    );

    /* ç²¾ç¡®æ ‡è®° Chat / Work çš„æœ€ä½Žå…±åŒå®¹å™¨ï¼Œä¸æ”¹å˜ DOM å¸ƒå±€ã€‚ */
    let module5MarkTimer;

    function markChatWorkSwitch() {
        const candidates = Array.from(
            document.querySelectorAll('button, [role="tab"], a')
        );

        const chatButton = candidates.find(
            (element) => element.textContent?.trim() === 'Chat'
        );

        const workButton = candidates.find(
            (element) => element.textContent?.trim() === 'Work'
        );

        if (!chatButton || !workButton) {
            return;
        }

        let commonContainer = chatButton.parentElement;
        let checkedLevels = 0;

        while (
            commonContainer &&
            !commonContainer.contains(workButton) &&
            checkedLevels < 5
        ) {
            commonContainer = commonContainer.parentElement;
            checkedLevels++;
        }

        if (commonContainer && checkedLevels < 5) {
            const bounds = commonContainer.getBoundingClientRect();

            if (bounds.width <= 700 && bounds.height <= 140) {
                commonContainer.classList.add('gpt-chat-work-switch');
            }
        }
    }

    const module5Observer = new MutationObserver(() => {
        clearTimeout(module5MarkTimer);
        module5MarkTimer = setTimeout(markChatWorkSwitch, 100);
    });

    module5Observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    markChatWorkSwitch();
 /*
    MODULE 6：底部输入区域、工具栏与推荐任务栏修复
    */

    document
        .getElementById('gpt-wallpaper-module-6-style')
        ?.remove();

    const module6Style = document.createElement('style');

    module6Style.id = 'gpt-wallpaper-module-6-style';

    module6Style.textContent = `
        /* 1. Composer 核心输入与外壳清理 */
        html body [data-gpt-composer-v18="clear"],
        html body [data-gpt-composer-v18="shell"],
        html body [data-gpt-composer-v18]::before,
        html body [data-gpt-composer-v18]::after {
            background: transparent !important;
            background-image: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            filter: none !important;
            box-shadow: none !important;
            mask-image: none !important;
            -webkit-mask-image: none !important;
            --tw-shadow: 0 0 transparent !important;
            --tw-ring-shadow: 0 0 transparent !important;
        }

        html body [data-gpt-composer-v18="shell"] {
            background: rgba(13, 19, 30, 0.30) !important;
            background-clip: padding-box !important;
            border-color: rgba(255, 255, 255, 0.18) !important;
        }

        /* 2. 问题 A：Work Composer 工具架 (data-composer-bar-placement="footer") */
        [data-composer-bar-placement="footer"],
        [data-composer-bar-placement],
        [data-composer-bar-placement] > div,
        [data-composer-bar-placement]::before,
        [data-composer-bar-placement]::after {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            filter: none !important;
            mask-image: none !important;
            -webkit-mask-image: none !important;
            --tw-shadow: 0 0 transparent !important;
            --tw-ring-shadow: 0 0 transparent !important;
            border-color: rgba(255, 255, 255, 0.12) !important;
        }

        /* 3. 问题 B：Work 页面底部推荐/建议任务条 (限定于 main 内且包含关闭按钮的条目) */
        main .gpt-work-recommendation-bar,
        main .gpt-work-recommendation-bar > div,
        main .gpt-work-recommendation-bar::before,
        main .gpt-work-recommendation-bar::after {
            background: rgba(13, 19, 30, 0.22) !important;
            background-image: none !important;
            box-shadow: none !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            border: 1px solid rgba(255, 255, 255, 0.14) !important;
        }

        /* 清除推荐栏内部由 Tailwind 强加的实黑背景 token */
        main .gpt-work-recommendation-bar .bg-surface-primary,
        main .gpt-work-recommendation-bar [class*="bg-surface-primary"],
        main .gpt-work-recommendation-bar [class*="bg-token-main-surface"] {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
        }
    `;
    document.documentElement.appendChild(module6Style);

    const composerEditorSelector =
        '#prompt-textarea, [data-lexical-editor="true"][contenteditable="true"], ' +
        'main [role="textbox"][contenteditable="true"], ' +
        'main textarea[placeholder]';
    const composerProtected =
        '[role="dialog"], [role="menu"], [role="listbox"], [role="tooltip"], ' +
        '[data-radix-popper-content-wrapper], aside, nav, article, ' +
        '[data-message-author-role], [data-testid="conversation-turn"]';
    const composerMarks = new Map();
    let module6MarkTimer = 0;
    let composerFrame = 0;
    const composerResize = new ResizeObserver(() => scheduleComposerScan());
    const composerObserved = new Set();

    function scheduleComposerScan() {
        if (!composerFrame) composerFrame = requestAnimationFrame(() => {
            composerFrame = 0;
            markComposerLayers();
        });
    }

    function updateDotLayout(active) {
        const scroller = document.querySelector('.messaging-root.messaging-embedded .messages-scroll');
        const enabled = location.pathname.startsWith('/dots/') && Boolean(scroller);
        if (document.body.hasAttribute('data-gpt-dot-ui') !== enabled)
            document.body.toggleAttribute('data-gpt-dot-ui', enabled);
        if (!enabled) return;
        const rect = scroller.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const setMetric = (key, value) => {
            if (document.body.style.getPropertyValue(key) !== value)
                document.body.style.setProperty(key, value);
        };
        const trigger = Array.from(document.querySelectorAll('[data-orbit-profile-trigger]'))
            .find(element => element.getBoundingClientRect().height > 0 &&
                element.closest('[style*="position-anchor: --orbit-messaging-header"]'));
        if (trigger) {
            const header = trigger.closest('[style*="position-anchor: --orbit-messaging-header"]');
            if (header && !header.hasAttribute('data-gpt-dot-header'))
                header.setAttribute('data-gpt-dot-header', '');
            if (!trigger.parentElement.hasAttribute('data-gpt-dot-avatar'))
                trigger.parentElement.setAttribute('data-gpt-dot-avatar', '');
            active.add(trigger);
            setMetric('--gpt-dot-top-safe', Math.ceil(Math.max(88,
                trigger.getBoundingClientRect().bottom - rect.top + 12)) + 'px');
        }
        let root = scroller.closest('.messaging-root');
        let wrap = null;
        while (root && !wrap) {
            wrap = root.querySelector('.composer-wrap');
            if (!wrap) root = root.parentElement?.closest('.messaging-root');
        }
        if (wrap && wrap.getBoundingClientRect().height > 0) {
            active.add(wrap);
            const occupied = Math.max(0, rect.bottom - wrap.getBoundingClientRect().top);
            setMetric('--gpt-dot-bottom-safe', Math.ceil(occupied) + 'px');
            // Native Dot already has a bottom spacer; reserve only the shortfall.
            const spacer = Array.from(scroller.children)
                .find(element => element.matches('.pointer-events-none.shrink-0'));
            const reserved = spacer?.getBoundingClientRect().height || 0;
            setMetric('--gpt-dot-tail-padding', Math.ceil(Math.max(0, occupied - reserved) + 12) + 'px');
        }
    }

    function markComposerLayers() {
        module6Observer.disconnect();
        try {
            // 恢复属性标记
            for (const [element, previous] of composerMarks) {
                if (previous === null) element.removeAttribute('data-gpt-composer-v18');
                else element.setAttribute('data-gpt-composer-v18', previous);
            }
            composerMarks.clear();

            const mark = (element, kind) => {
                if (!composerMarks.has(element))
                    composerMarks.set(element, element.getAttribute('data-gpt-composer-v18'));
                element.setAttribute('data-gpt-composer-v18', kind);
            };

            const active = new Set();
            updateDotLayout(active);
            for (const editor of document.querySelectorAll(composerEditorSelector)) {
                if (editor.closest(composerProtected)) continue;
                const editorBox = editor.getBoundingClientRect();
                if (!editorBox.width || !editorBox.height) continue;

                // Dot exposes a semantic shell; attachments must share this surface.
                const dotWrap = editor.closest('.messaging-root.messaging-embedded .composer-wrap');
                let shell = dotWrap ? editor.closest('[data-composer-surface-variant]') : null;
                let semantic = null;
                let node = editor.parentElement;
                for (let depth = 0; !shell && node && depth < 10; depth++, node = node.parentElement) {
                    if (node.matches('main, body, html, #root, #__next') ||
                        node.matches(composerProtected) ||
                        node.querySelector('[data-message-author-role], article')) break;
                    if (node.matches('[data-type="unified-composer"], [data-testid="composer"]'))
                        semantic ||= node;
                    const box = node.getBoundingClientRect();
                    const style = getComputedStyle(node);
                    const radius = Math.max(parseFloat(style.borderTopLeftRadius) || 0,
                        parseFloat(style.borderBottomLeftRadius) || 0);
                    if (radius >= 12 && node.querySelector('button, [role="button"]') &&
                        box.width >= editorBox.width && box.height < innerHeight * 0.9) {
                        shell = node;
                        break;
                    }
                }
                shell ||= semantic;
                if (!shell) { mark(editor, 'clear'); continue; }

                active.add(editor);
                active.add(shell);
                const box = shell.getBoundingClientRect();

                const clearChildren = (parent) => {
                    for (const child of parent.children) {
                        if (child.matches(composerProtected) ||
                            child.matches('button, [role="button"], a, img, video, canvas, svg, input')) continue;
                        if (child.matches('div, section, footer, form, textarea') ||
                            child === editor) mark(child, 'clear');
                        if (child.children.length) clearChildren(child);
                    }
                };
                clearChildren(shell);
                mark(editor, 'clear');

                // 标记外层祖先与视觉层
                node = shell.parentElement;
                for (let depth = 0; node && depth < 12; depth++, node = node.parentElement) {
                    if (node.matches('body, html, #root, #__next') ||
                        node.matches(composerProtected)) break;
                    mark(node, 'clear');
                    for (const sibling of node.children) {
                        if (sibling.contains(shell) || sibling === shell ||
                            sibling.matches(composerProtected) ||
                            sibling.querySelector('button, a, input, textarea, img, video, canvas, svg') ||
                            sibling.textContent.trim()) continue;
                        const rect = sibling.getBoundingClientRect();
                        if (rect.width >= box.width * 0.7 &&
                            rect.bottom >= box.top && rect.top <= box.bottom + 160)
                            mark(sibling, 'clear');
                    }
                    if (node.matches('main')) break;
                }
                mark(shell, 'shell');
            }

            // 处理问题 A：关联的 action bar/footer 如果在 shell 外部，予以同步标记
            for (const bar of document.querySelectorAll('[data-composer-bar-placement="footer"], [data-composer-bar-placement]')) {
                if (!bar.closest(composerProtected)) {
                    active.add(bar);
                }
            }

            // 处理问题 B：精确标记推荐卡片容器（具有关闭/消除按钮，且包含 bg-surface-primary）
            const surfaceBars = document.querySelectorAll('main .bg-surface-primary, main [class*="bg-surface-primary"]');
            for (const bar of surfaceBars) {
                if (bar.closest(composerProtected) || bar.closest('[data-gpt-composer-v18="shell"]')) continue;
                // 推荐条通常包含关闭按钮 (svg/cross) 或带文本的窄长条
                const rect = bar.getBoundingClientRect();
                if (rect.height > 20 && rect.height < 150 && rect.width > 200) {
                    bar.classList.add('gpt-work-recommendation-bar');
                    active.add(bar);
                }
            }

            for (const element of composerObserved) {
                if (!active.has(element)) {
                    composerResize.unobserve(element);
                    composerObserved.delete(element);
                }
            }
            for (const element of active) {
                if (!composerObserved.has(element)) {
                    composerResize.observe(element);
                    composerObserved.add(element);
                }
            }
        } finally {
            module6Observer.observe(document.body, {
                childList: true, subtree: true, attributes: true,
                attributeFilter: ['class', 'style', 'contenteditable', 'data-state', 'hidden']
            });
        }
    }

    const module6Observer = new MutationObserver(() => {
        if (module6MarkTimer) return;
        module6MarkTimer = setTimeout(() => {
            module6MarkTimer = 0;
            scheduleComposerScan();
        }, 80);
    });

    document.addEventListener('focusin', scheduleComposerScan, true);
    document.addEventListener('input', scheduleComposerScan, true);
    window.addEventListener('resize', scheduleComposerScan, { passive: true });
    window.addEventListener('popstate', scheduleComposerScan);
    markComposerLayers();
        /*
    ============================================================
    MODULE 7ï¼šæ¶ˆæ¯ä¸Žå†…å®¹ç»„ä»¶æ¯›çŽ»ç’ƒ
    ============================================================

    æœ¬æ¨¡å—å¤„ç†ï¼š

    1. ç”¨æˆ·æ¶ˆæ¯æ°”æ³¡
    2. AI å›žå¤åŒºåŸŸçš„æ–‡å­—æ¸…æ™°åº¦
    3. å¤§åž‹ä»£ç æ¡†
    4. æ–‡å­—ä¸­çš„å°åž‹è¡Œå†…ä»£ç 
    5. è¡¨æ ¼
    6. å¼•ç”¨æ¡†
    7. æ–‡ä»¶å’Œé™„ä»¶å¡ç‰‡
    8. åˆ†å‰²çº¿
    9. æ–‡å­—é˜´å½±

    æœ¬æ¨¡å—ä¸ä¼šä¿®æ”¹æ¶ˆæ¯å®½åº¦ã€ä½ç½®æˆ–é¡µé¢å¸ƒå±€ã€‚
    */


    /*
    åˆ é™¤å¯èƒ½é‡å¤å­˜åœ¨çš„ Module 7 æ ·å¼ã€‚
    */

    const oldModule7Style =
        document.getElementById(
            'gpt-wallpaper-module-7-style'
        );

    if (oldModule7Style) {
        oldModule7Style.remove();
    }


    /*
    åˆ›å»º Module 7 æ ·å¼ã€‚
    */

    const module7Style =
        document.createElement('style');

    module7Style.id =
        'gpt-wallpaper-module-7-style';

    module7Style.textContent = `

        /*
        ========================================================
        ç”¨æˆ·æ¶ˆæ¯èƒŒæ™¯å˜é‡
        ========================================================
        */

        :root {
            --message-surface:
                rgba(
                    20,
                    65,
                    125,
                    ${SETTINGS.userMessageOpacity}
                ) !important;
        }


        /*
        ========================================================
        ç”¨æˆ·æ¶ˆæ¯æ°”æ³¡
        ========================================================
        */

        [data-message-author-role="user"]
        .bg-token-message-surface,

        [data-message-author-role="user"]
        [class~="bg-token-message-surface"] {
            background-color:
                rgba(
                    20,
                    65,
                    125,
                    ${SETTINGS.userMessageOpacity}
                ) !important;

            background-image: none !important;

            backdrop-filter:
                blur(${Math.max(
                    SETTINGS.glassBlur - 4,
                    0
                )}px)
                saturate(135%) !important;

            -webkit-backdrop-filter:
                blur(${Math.max(
                    SETTINGS.glassBlur - 4,
                    0
                )}px)
                saturate(135%) !important;

            border:
                1px solid
                rgba(255, 255, 255, 0.13) !important;

            box-shadow:
                0 6px 20px
                rgba(0, 0, 0, 0.13) !important;
        }


        /*
        ç”¨æˆ·æ¶ˆæ¯ç¼–è¾‘æ¡†ã€‚
        */

        [data-message-author-role="user"]
        textarea {
            background-color:
                rgba(
                    20,
                    50,
                    95,
                    ${SETTINGS.userMessageOpacity}
                ) !important;

            backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(130%) !important;

            -webkit-backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(130%) !important;

            border-color:
                rgba(255, 255, 255, 0.14) !important;
        }


        /*
        ========================================================
        AI å›žå¤åŒºåŸŸ
        ========================================================

        AI å›žå¤æœ¬èº«ä¸æ·»åŠ å®Œæ•´çš„å¤§æ°”æ³¡ï¼Œ
        é¿å…æ•´ç¯‡å›žå¤å˜æˆä¸€ä¸ªå·¨å¤§çš„çŽ»ç’ƒæ–¹æ¡†ã€‚
        */

        [data-message-author-role="assistant"] {
            background-color: transparent !important;
            background-image: none !important;
        }


        /*
        ========================================================
        å¤§åž‹ä»£ç æ¡†
        ========================================================
        */

        pre,
        [data-testid="code-block"],
        [data-testid*="code-block"] {
            background-color:
                rgba(
                    7,
                    12,
                    21,
                    ${SETTINGS.codeBlockOpacity}
                ) !important;

            background-image: none !important;

            backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(120%) !important;

            -webkit-backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(120%) !important;

            border:
                1px solid
                rgba(255, 255, 255, 0.14) !important;

            border-radius: 16px !important;

            box-shadow:
                0 8px 28px
                rgba(0, 0, 0, 0.20) !important;
        }


        /*
        ä»£ç æ¡†é¡¶éƒ¨çš„è¯­è¨€åç§°å’Œå¤åˆ¶æŒ‰é’®åŒºåŸŸã€‚
        */

        pre header,
        [data-testid="code-block"] header,
        [data-testid*="code-block"] header {
            background-color:
                rgba(5, 9, 17, 0.36) !important;

            background-image: none !important;

            backdrop-filter:
                blur(${Math.max(
                    SETTINGS.glassBlur - 4,
                    0
                )}px)
                saturate(120%) !important;

            -webkit-backdrop-filter:
                blur(${Math.max(
                    SETTINGS.glassBlur - 4,
                    0
                )}px)
                saturate(120%) !important;

            border-color:
                rgba(255, 255, 255, 0.10) !important;

            box-shadow: none !important;
        }


        /*
        ä»£ç å†…å®¹ä¿æŒé€æ˜Žï¼Œ
        é¿å…å‡ºçŽ°ä»£ç æ¡†é‡Œé¢åˆå¥—ä¸€ä¸ªå®žè‰²èƒŒæ™¯ã€‚
        */

        pre code {
            background-color: transparent !important;
            background-image: none !important;

            border: none !important;
            box-shadow: none !important;

            text-shadow: none !important;
        }


        /*
        ========================================================
        æ–‡å­—ä¸­çš„è¡Œå†…ä»£ç 
        ========================================================

        ä¾‹å¦‚ï¼š

        SETTINGS
        Command + Shift + R
        background-color
        */

        :not(pre) > code {
            background-color:
                rgba(7, 13, 23, 0.48) !important;

            background-image: none !important;

            border:
                1px solid
                rgba(255, 255, 255, 0.11) !important;

            border-radius: 6px !important;

            box-shadow:
                0 2px 8px
                rgba(0, 0, 0, 0.10) !important;

            backdrop-filter:
                blur(${Math.max(
                    SETTINGS.glassBlur - 6,
                    0
                )}px) !important;

            -webkit-backdrop-filter:
                blur(${Math.max(
                    SETTINGS.glassBlur - 6,
                    0
                )}px) !important;
        }


        /*
        ========================================================
        è¡¨æ ¼
        ========================================================
        */

        table {
            background-color:
                rgba(
                    8,
                    14,
                    24,
                    ${SETTINGS.panelOpacity}
                ) !important;

            background-image: none !important;

            backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(125%) !important;

            -webkit-backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(125%) !important;

            border-color:
                rgba(255, 255, 255, 0.14) !important;

            box-shadow:
                0 6px 20px
                rgba(0, 0, 0, 0.13) !important;
        }


        /*
        è¡¨æ ¼æ ‡é¢˜è¡Œã€‚
        */

        thead,
        th {
            background-color:
                rgba(255, 255, 255, 0.07) !important;

            border-color:
                rgba(255, 255, 255, 0.13) !important;
        }


        /*
        è¡¨æ ¼å†…å®¹å•å…ƒæ ¼ã€‚
        */

        tbody,
        tr,
        td {
            background-color: transparent !important;

            border-color:
                rgba(255, 255, 255, 0.10) !important;
        }


        /*
        è¡¨æ ¼è¡Œæ‚¬åœã€‚
        */

        tbody tr:hover {
            background-color:
                rgba(255, 255, 255, 0.05) !important;
        }


        /*
        ========================================================
        å¼•ç”¨æ¡†
        ========================================================
        */

        blockquote {
            background-color:
                rgba(
                    10,
                    20,
                    35,
                    ${Math.max(
                        SETTINGS.panelOpacity - 0.08,
                        0
                    )}
                ) !important;

            background-image: none !important;

            backdrop-filter:
                blur(${Math.max(
                    SETTINGS.glassBlur - 4,
                    0
                )}px)
                saturate(125%) !important;

            -webkit-backdrop-filter:
                blur(${Math.max(
                    SETTINGS.glassBlur - 4,
                    0
                )}px)
                saturate(125%) !important;

            border-color:
                rgba(130, 185, 255, 0.45) !important;

            border-radius: 8px !important;

            box-shadow:
                0 4px 14px
                rgba(0, 0, 0, 0.10) !important;
        }


        /*
        ========================================================
        æ–‡ä»¶ä¸Žé™„ä»¶å¡ç‰‡
        ========================================================
        */

        [data-message-author-role]
        [data-testid*="attachment"],

        [data-message-author-role]
        [data-testid*="file"] {
            background-color:
                rgba(
                    10,
                    18,
                    31,
                    ${SETTINGS.panelOpacity}
                ) !important;

            background-image: none !important;

            backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(130%) !important;

            -webkit-backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(130%) !important;

            border-color:
                rgba(255, 255, 255, 0.13) !important;

            box-shadow:
                0 5px 18px
                rgba(0, 0, 0, 0.12) !important;
        }


        /*
        ========================================================
        åˆ†å‰²çº¿
        ========================================================
        */

        main hr {
            border-color:
                rgba(255, 255, 255, 0.15) !important;

            background-color:
                rgba(255, 255, 255, 0.15) !important;
        }


        /*
        ========================================================
        æ–‡å­—æ¸…æ™°åº¦
        ========================================================
        */

        ${
            SETTINGS.textShadow
                ? `
                    main p,
                    main li,
                    main h1,
                    main h2,
                    main h3,
                    main h4,
                    main td,
                    main th,
                    main blockquote {
                        text-shadow:
                            0 1px 4px
                            rgba(0, 0, 0, 0.50);
                    }
                `
                : `
                    main p,
                    main li,
                    main h1,
                    main h2,
                    main h3,
                    main h4,
                    main td,
                    main th,
                    main blockquote {
                        text-shadow: none !important;
                    }
                `
        }


        /*
        é“¾æŽ¥åœ¨åŠ¨æ€å£çº¸ä¸Šç¨å¾®äº®ä¸€äº›ã€‚
        */

        main a {
            text-decoration-color:
                rgba(150, 205, 255, 0.70) !important;
        }


        /*
        ä¿è¯å›¾ç‰‡å’Œç”Ÿæˆçš„è§†è§‰å†…å®¹ä¸å—æ¨¡ç³Šå½±å“ã€‚
        */

        [data-message-author-role] img,
        [data-message-author-role] video,
        [data-message-author-role] canvas,
        [data-message-author-role] svg {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }
    `;

    document.documentElement.appendChild(
        module7Style
    );
        /*
    ============================================================
    MODULE 8ï¼šå¼¹çª—ã€èœå•å’Œç»†èŠ‚ä¿®å¤
    ============================================================

    æœ¬æ¨¡å—å¤„ç†ï¼š

    1. å¼¹çª—
    2. ä¸‹æ‹‰èœå•
    3. æ¨¡åž‹é€‰æ‹©èœå•
    4. å³é”®èœå•
    5. Tooltip æç¤ºæ¡†
    6. åº•éƒ¨æç¤ºå°å­—é»‘è‰²èƒŒæ™¯
    7. å°æŒ‰é’®é»‘è‰²èƒŒæ™¯
    8. æ»šåŠ¨æ¡
    9. è¾¹æ¡†å’Œèœå•æ‚¬åœæ•ˆæžœ
    */


    /*
    åˆ é™¤é‡å¤çš„ Module 8 æ ·å¼ã€‚
    */

    const oldModule8Style =
        document.getElementById(
            'gpt-wallpaper-module-8-style'
        );

    if (oldModule8Style) {
        oldModule8Style.remove();
    }


    /*
    åˆ›å»º Module 8 æ ·å¼ã€‚
    */

    const module8Style =
        document.createElement('style');

    module8Style.id =
        'gpt-wallpaper-module-8-style';

    module8Style.textContent = `

        /*
        ========================================================
        å¼¹çª—ã€èœå•å’Œä¸‹æ‹‰åˆ—è¡¨
        ========================================================
        */

        [role="dialog"],
        [role="menu"],
        [role="listbox"],
        [data-radix-menu-content],
        [data-radix-popper-content-wrapper] > div {
            background-color:
                rgba(
                    11,
                    17,
                    29,
                    ${Math.min(
                        SETTINGS.panelOpacity + 0.10,
                        1
                    )}
                ) !important;

            background-image: none !important;

            backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(140%) !important;

            -webkit-backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(140%) !important;

            border-color:
                rgba(255, 255, 255, 0.14) !important;

            box-shadow:
                0 12px 40px
                rgba(0, 0, 0, 0.30) !important;
        }


        /*
        ChatGPT çš„ç¬¬ä¸‰å±‚è¡¨é¢èƒŒæ™¯ã€‚
        å¸¸ç”¨äºŽèœå•ã€å¼¹çª—å’Œå¡ç‰‡ã€‚
        */

        .bg-token-main-surface-tertiary,
        [class~="bg-token-main-surface-tertiary"] {
            background-color:
                rgba(
                    11,
                    17,
                    29,
                    ${SETTINGS.panelOpacity}
                ) !important;

            background-image: none !important;

            backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(135%) !important;

            -webkit-backdrop-filter:
                blur(${SETTINGS.glassBlur}px)
                saturate(135%) !important;

            border-color:
                rgba(255, 255, 255, 0.13) !important;
        }


        /*
        èœå•é¡¹ç›®ã€‚
        */

        [role="menuitem"],
        [role="option"] {
            background-color: transparent !important;
            box-shadow: none !important;
        }


        /*
        èœå•é¡¹ç›®æ‚¬åœå’Œé”®ç›˜é€‰ä¸­æ•ˆæžœã€‚
        */

        [role="menuitem"]:hover,
        [role="option"]:hover,
        [role="menuitem"][data-highlighted],
        [role="option"][data-highlighted] {
            background-color:
                rgba(255, 255, 255, 0.10) !important;
        }


        /*
        å½“å‰è¢«é€‰ä¸­çš„èœå•é¡¹ç›®ã€‚
        */

        [role="option"][aria-selected="true"],
        [role="menuitem"][aria-checked="true"] {
            background-color:
                rgba(85, 145, 230, 0.18) !important;
        }


        /*
        ========================================================
        Tooltip æç¤ºæ¡†
        ========================================================
        */

        [role="tooltip"] {
            background-color:
                rgba(7, 12, 21, 0.78) !important;

            background-image: none !important;

            backdrop-filter:
                blur(${Math.max(
                    SETTINGS.glassBlur - 4,
                    0
                )}px)
                saturate(130%) !important;

            -webkit-backdrop-filter:
                blur(${Math.max(
                    SETTINGS.glassBlur - 4,
                    0
                )}px)
                saturate(130%) !important;

            border:
                1px solid
                rgba(255, 255, 255, 0.12) !important;

            box-shadow:
                0 6px 20px
                rgba(0, 0, 0, 0.22) !important;
        }


        /*
        ========================================================
        åº•éƒ¨æç¤ºå°å­—é»‘åœˆä¿®å¤
        ========================================================

        JavaScript ä¼šç»™æç¤ºæ–‡å­—åŠå…¶å¿…è¦çš„å¤–å±‚æ·»åŠ ï¼š

        gpt-disclaimer-transparent
        */

        .gpt-disclaimer-transparent {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;

            border: none !important;
            box-shadow: none !important;

            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }


        /*
        åº•éƒ¨æç¤ºæ–‡å­—æœ¬èº«ä¸éœ€è¦æ¯›çŽ»ç’ƒã€‚
        */

        .gpt-disclaimer-transparent::before,
        .gpt-disclaimer-transparent::after {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;

            border: none !important;
            box-shadow: none !important;
        }


        /*
        ========================================================
        é€šç”¨å°æŒ‰é’®ä¿®å¤
        ========================================================

        åˆ é™¤ä¸å¿…è¦çš„é‡é˜´å½±ï¼Œä½†ä¸ä¿®æ”¹æŒ‰é’®å°ºå¯¸å’Œä½ç½®ã€‚
        */

        main button,
        header button,
        aside button {
            box-shadow: none !important;
        }


        /*
        ä¿ç•™å‘é€æŒ‰é’®ã€ç¡®è®¤æŒ‰é’®ç­‰ä¸»è¦æŒ‰é’®çš„é¢œè‰²ã€‚
        */

        [data-testid="send-button"],
        button[type="submit"] {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }


        /*
        ç¦ç”¨æŒ‰é’®ä¿æŒè¾ƒä½Žé€æ˜Žåº¦ã€‚
        */

        button:disabled,
        [role="button"][aria-disabled="true"] {
            opacity: 0.50;
        }


        /*
        ========================================================
        è¾“å…¥æ¡†ä¸Žæœç´¢æ¡†
        ========================================================
        */

        [role="dialog"] input,
        [role="menu"] input,
        [role="listbox"] input {
            background-color:
                rgba(255, 255, 255, 0.07) !important;

            border-color:
                rgba(255, 255, 255, 0.12) !important;

            box-shadow: none !important;
        }


        /*
        ========================================================
        èœå•åˆ†å‰²çº¿
        ========================================================
        */

        [role="menu"] hr,
        [role="dialog"] hr,
        [role="separator"] {
            border-color:
                rgba(255, 255, 255, 0.12) !important;

            background-color:
                rgba(255, 255, 255, 0.12) !important;
        }


        /*
        ========================================================
        æ»šåŠ¨æ¡
        ========================================================
        */

        * {
            scrollbar-color:
                rgba(255, 255, 255, 0.22)
                transparent;
        }


        *::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }


        *::-webkit-scrollbar-track {
            background: transparent;
        }


        *::-webkit-scrollbar-thumb {
            background-color:
                rgba(255, 255, 255, 0.20);

            border-radius: 999px;

            border:
                2px solid transparent;

            background-clip: padding-box;
        }


        *::-webkit-scrollbar-thumb:hover {
            background-color:
                rgba(255, 255, 255, 0.34);
        }


        /*
        ========================================================
        Composer ä¸“å±žæœ€ç»ˆè¦†ç›–
        ========================================================

        Module 8 çš„é€šç”¨èœå•/listbox çŽ»ç’ƒè§„åˆ™ä½äºŽ Module 6 ä¹‹åŽã€‚
        Composer å»ºè®®åŒºå¿…é¡»åœ¨è¿™é‡Œå†æ¬¡æŽ’é™¤ï¼Œé¿å…è¢«é‡æ–°æŸ“é»‘ã€‚
        */

        .gpt-composer-form [role="listbox"],
        .gpt-composer-outer [role="listbox"],
        .gpt-composer-suggestions,
        .gpt-composer-suggestions::before,
        .gpt-composer-suggestions::after,
        .gpt-composer-adjacent-layer,
        .gpt-composer-adjacent-layer::before,
        .gpt-composer-adjacent-layer::after {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            filter: none !important;
            -webkit-filter: none !important;
            mask-image: none !important;
            -webkit-mask-image: none !important;
            border-color: transparent !important;
            box-shadow: none !important;
            outline: none !important;
        }

        .gpt-composer-form [role="option"],
        .gpt-composer-outer [role="option"],
        .gpt-composer-suggestions [role="option"] {
            background: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
        }

        .gpt-composer-form [role="option"]:hover,
        .gpt-composer-outer [role="option"]:hover,
        .gpt-composer-suggestions [role="option"]:hover {
            background: rgba(255, 255, 255, 0.07) !important;
        }


        /*
        ========================================================
        é€‰ä¸­æ–‡å­—çš„é¢œè‰²
        ========================================================
        */

        ::selection {
            background-color:
                rgba(75, 145, 245, 0.40);

            color: inherit;
        }
    `;

    document.documentElement.appendChild(
        module8Style
    );


    /*
    ============================================================
    å¯»æ‰¾å¹¶ä¿®å¤åº•éƒ¨æç¤ºå°å­—
    ============================================================

    ChatGPT å¯èƒ½åŠ¨æ€ç”Ÿæˆè¿™è¡Œæ–‡å­—ï¼Œå› æ­¤ä¸èƒ½åªè¿è¡Œä¸€æ¬¡ã€‚
    MutationObserver ä¼šåœ¨é¡µé¢å˜åŒ–åŽé‡æ–°æ£€æŸ¥ã€‚
    */


    let module8DisclaimerTimer;


    function fixDisclaimerBackground() {

        const possibleElements =
            document.querySelectorAll(
                'div, span, p'
            );

        for (const element of possibleElements) {

            const text =
                element.textContent
                    ?.trim()
                    .replace(/\s+/g, ' ');

            const isDisclaimer =
                text ===
                    'ChatGPT can make mistakes. Check important info.' ||

                text ===
                    'ChatGPT can make mistakes. Check important info.' ||

                text ===
                    'ChatGPT å¯èƒ½ä¼šçŠ¯é”™ã€‚è¯·æ ¸æŸ¥é‡è¦ä¿¡æ¯ã€‚';

            if (!isDisclaimer) {
                continue;
            }


            /*
            å…ˆæ¸…é™¤æç¤ºæ–‡å­—æœ¬èº«çš„èƒŒæ™¯ã€‚
            */

            element.classList.add(
                'gpt-disclaimer-transparent'
            );


            /*
            å†å‘å¤–æ£€æŸ¥æœ€å¤šä¸‰å±‚ã€‚

            åªæœ‰å½“å¤–å±‚åŒ…å«çš„æ–‡å­—ä»ç„¶å®Œå…¨ç›¸åŒæ—¶ï¼Œ
            æ‰æ¸…é™¤è¯¥å¤–å±‚èƒŒæ™¯ï¼Œé¿å…è¯¯ä¼¤æ•´ä¸ªè¾“å…¥æ¡†ã€‚
            */

            let parent =
                element.parentElement;

            let checkedLevels = 0;

            while (
                parent &&
                checkedLevels < 3
            ) {
                const parentText =
                    parent.textContent
                        ?.trim()
                        .replace(/\s+/g, ' ');

                if (parentText !== text) {
                    break;
                }

                parent.classList.add(
                    'gpt-disclaimer-transparent'
                );

                parent =
                    parent.parentElement;

                checkedLevels++;
            }
        }
    }


    /*
    é¡µé¢å†…å®¹å‘ç”Ÿå˜åŒ–æ—¶é‡æ–°æ£€æŸ¥ã€‚
    ä½¿ç”¨ 120ms debounceï¼Œé¿å…é¢‘ç¹è¿è¡Œã€‚
    */

    const module8Observer =
        new MutationObserver(() => {

            clearTimeout(
                module8DisclaimerTimer
            );

            module8DisclaimerTimer =
                setTimeout(
                    fixDisclaimerBackground,
                    120
                );
        });


    module8Observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );


    /*
    é¡µé¢é¦–æ¬¡åŠ è½½æ—¶ç«‹å³æ‰§è¡Œä¸€æ¬¡ã€‚
    */

    fixDisclaimerBackground();
        /*
    ============================================================
    MODULE 9ï¼šå…¼å®¹ã€è‡ªåŠ¨æ¢å¤ä¸ŽçŠ¶æ€æ£€æŸ¥
    ============================================================

    æœ¬æ¨¡å—å¤„ç†ï¼š

    1. ChatGPT å†…éƒ¨åˆ‡æ¢é¡µé¢
    2. Chat ä¸Ž Work é¡µé¢åˆ‡æ¢
    3. æ–°å¯¹è¯ä¸Žæ—§å¯¹è¯åˆ‡æ¢
    4. æ ‡ç­¾é¡µæ¢å¤åŽé‡æ–°æ’­æ”¾
    5. è§†é¢‘æ„å¤–æš‚åœåŽçš„æ¢å¤
    6. è§†é¢‘å…ƒç´ è¢«é¡µé¢ç§»é™¤åŽçš„æ¢å¤
    7. è§†é¢‘åŠ è½½å¤±è´¥åŽçš„æœ‰é™é‡è¯•
    8. æ£€æŸ¥æ‰€æœ‰ Module æ˜¯å¦æˆåŠŸå®‰è£…
    9. æä¾›æµè§ˆå™¨ Console è°ƒè¯•å‘½ä»¤
    */


    /*
    ============================================================
    Module 9 æœ€ç»ˆå±‚çº§ä¿æŠ¤
    ============================================================
    */

    const oldModule9Style =
        document.getElementById(
            'gpt-wallpaper-module-9-style'
        );

    if (oldModule9Style) {
        oldModule9Style.remove();
    }


    const module9Style =
        document.createElement('style');

    module9Style.id =
        'gpt-wallpaper-module-9-style';

    module9Style.textContent = `

        /*
        å£çº¸å§‹ç»ˆè¦†ç›–æ•´ä¸ªæµè§ˆå™¨çª—å£ï¼Œ
        ä½†ä¸ä¼šé˜»æŒ¡é¼ æ ‡ç‚¹å‡»ã€‚
        */

        #gpt-video-wallpaper {
            position: fixed !important;
            inset: 0 !important;

            width: 100vw !important;
            height: 100vh !important;

            z-index: -1 !important;
            pointer-events: none !important;
        }


        /*
        å¼¹çª—ã€èœå•å’Œ Tooltip ä¿æŒåœ¨æœ€ä¸Šå±‚ã€‚

        ä¸è®¾ç½® positionï¼Œé¿å…æ”¹å˜ ChatGPT åŽŸæœ¬å¸ƒå±€ã€‚
        */

        [role="dialog"],
        [role="menu"],
        [role="listbox"],
        [role="tooltip"],
        [data-radix-popper-content-wrapper] {
            z-index: 1000;
        }


        /*
        é˜²æ­¢è§†é¢‘èŽ·å¾—é”®ç›˜ç„¦ç‚¹ã€‚
        */

        #gpt-video-wallpaper:focus {
            outline: none !important;
        }
    `;

    document.documentElement.appendChild(
        module9Style
    );


    /*
    ============================================================
    èŽ·å– Module 2 åˆ›å»ºçš„è§†é¢‘
    ============================================================
    */

    const module9Video =
        document.getElementById(
            'gpt-video-wallpaper'
        );


    /*
    è®°å½•è§†é¢‘æ¢å¤æ¬¡æ•°ã€‚
    */

    let module9RetryCount = 0;

    const MODULE9_MAX_RETRIES = 3;

    let module9RecoveryTimer;

    let module9ObserverBusy = false;


    /*
    ============================================================
    æ˜¾ç¤ºé”™è¯¯æç¤º
    ============================================================

    åªæœ‰å‘ç”Ÿé”™è¯¯æ—¶æ‰æ˜¾ç¤ºï¼Œä¸ä¼šæ­£å¸¸å æ®é¡µé¢ã€‚
    */

    function showWallpaperError(message) {

        let errorBox =
            document.getElementById(
                'gpt-wallpaper-error-message'
            );

        if (!errorBox) {
            errorBox =
                document.createElement('div');

            errorBox.id =
                'gpt-wallpaper-error-message';

            Object.assign(
                errorBox.style,
                {
                    position: 'fixed',
                    left: '16px',
                    bottom: '16px',
                    zIndex: '2147483647',
                    maxWidth: '360px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    color: '#ffffff',
                    background:
                        'rgba(170, 35, 35, 0.90)',
                    border:
                        '1px solid rgba(255,255,255,0.18)',
                    boxShadow:
                        '0 8px 24px rgba(0,0,0,0.25)',
                    fontSize: '13px',
                    fontFamily:
                        'Arial, sans-serif'
                }
            );

            document.body.appendChild(
                errorBox
            );
        }

        errorBox.textContent = message;
    }


    /*
    åˆ é™¤é”™è¯¯æç¤ºã€‚
    */

    function removeWallpaperError() {

        document
            .getElementById(
                'gpt-wallpaper-error-message'
            )
            ?.remove();
    }


    /*
    ============================================================
    å°è¯•æ’­æ”¾è§†é¢‘
    ============================================================
    */

    function playWallpaperVideo() {

        if (document.hidden || wallpaperUserPaused ||
            document.getElementById('gpt-image-wallpaper')?.style.display === 'block' ||
            !module9Video?.getAttribute('src')) return;

        if (!module9Video) {
            showWallpaperError(
                'Wallpaper video element was not found.'
            );

            return;
        }


        /*
        å¦‚æžœè§†é¢‘è¢« ChatGPT ç§»å‡ºé¡µé¢ï¼Œ
        é‡æ–°å°†å®ƒæ”¾åˆ° body æœ€å‰é¢ã€‚
        */

        if (!module9Video.isConnected) {
            document.body.prepend(
                module9Video
            );
        }


        /*
        æ¢å¤ Module 1 ä¸­çš„æ’­æ”¾é€Ÿåº¦ã€‚
        */

        module9Video.playbackRate =
            SETTINGS.playbackSpeed;

        module9Video.muted = true;
        module9Video.volume = 0;


        /*
        è§†é¢‘å·²ç»æ­£å¸¸æ’­æ”¾æ—¶ä¸é‡å¤è°ƒç”¨ playã€‚
        */

        if (!module9Video.paused) {
            removeWallpaperError();
            return;
        }


        module9Video
            .play()
            .then(() => {
                if (!wallpaperCanPlay()) module9Video.pause();
                module9RetryCount = 0;
                removeWallpaperError();
            })
            .catch((error) => {
                console.warn(
                    '[Wallpaper Module 9] Playback was blocked:',
                    error
                );
            });
    }


    /*
    ============================================================
    è§†é¢‘åŠ è½½å¤±è´¥åŽçš„æœ‰é™é‡è¯•
    ============================================================

    æœ€å¤šé‡è¯•ä¸‰æ¬¡ï¼Œé¿å…æ— é™åˆ·æ–°è§†é¢‘ã€‚
    */

    function retryWallpaperVideo() {

        if (!wallpaperCanPlay()) return;
        if (!module9Video) {
            return;
        }

        if (
            module9RetryCount >=
            MODULE9_MAX_RETRIES
        ) {
            showWallpaperError(
                'Wallpaper failed after 3 retries. Check the file path and Chrome file access.'
            );

            return;
        }

        module9RetryCount++;

        clearTimeout(
            module9RecoveryTimer
        );

        module9RecoveryTimer =
            setTimeout(() => {
                if (!wallpaperCanPlay()) return;
                console.warn(
                    '[Wallpaper Module 9] Retry:',
                    module9RetryCount
                );

                module9Video.load();

                playWallpaperVideo();

            }, 1500);
    }


    /*
    ============================================================
    è§†é¢‘äº‹ä»¶ç›‘å¬
    ============================================================
    */

    if (module9Video) {

        /*
        æˆåŠŸæ’­æ”¾ã€‚
        */

        module9Video.addEventListener(
            'playing',
            () => {
                module9RetryCount = 0;
                removeWallpaperError();
            }
        );


        /*
        è§†é¢‘æ„å¤–åœæ­¢æ—¶å°è¯•æ¢å¤ã€‚
        */

        module9Video.addEventListener(
            'pause',
            () => {
                if (
                    !document.hidden &&
                    module9Video.isConnected
                ) {
                    setTimeout(
                        playWallpaperVideo,
                        250
                    );
                }
            }
        );


        /*
        è§†é¢‘å‡ºçŽ°åŠ è½½é”™è¯¯æ—¶è¿›è¡Œæœ‰é™é‡è¯•ã€‚
        */

        module9Video.addEventListener(
            'error',
            () => {
                console.error(
                    '[Wallpaper Module 9] Video error:',
                    module9Video.error
                );

                retryWallpaperVideo();
            }
        );


        /*
        è§†é¢‘å¡ä½æ—¶é‡æ–°åŠ è½½ã€‚
        */

        module9Video.addEventListener(
            'stalled',
            () => {
                console.warn(
                    '[Wallpaper Module 9] Video stalled.'
                );

                retryWallpaperVideo();
            }
        );


        /*
        loop æ­£å¸¸æƒ…å†µä¸‹ä¸ä¼šç»“æŸã€‚
        å¦‚æžœæµè§ˆå™¨å¼‚å¸¸è§¦å‘ endedï¼Œåˆ™é‡æ–°æ’­æ”¾ã€‚
        */

        module9Video.addEventListener(
            'ended',
            playWallpaperVideo
        );

    } else {
        showWallpaperError(
            'Module 2 did not create the wallpaper video.'
        );
    }


    /*
    ============================================================
    æ ‡ç­¾é¡µæ¢å¤
    ============================================================
    */

    document.addEventListener(
        'visibilitychange',
        () => {
            if (document.hidden) {
                clearTimeout(module9RecoveryTimer);
                module9Video?.pause();
            } else {
                playWallpaperVideo();
            }
        }
    );


    /*
    æµè§ˆå™¨çª—å£é‡æ–°èŽ·å¾—ç„¦ç‚¹ã€‚
    */

    window.addEventListener(
        'focus',
        playWallpaperVideo
    );


    /*
    æµè§ˆå™¨é€šè¿‡å‰è¿›ã€åŽé€€æˆ–ç¼“å­˜æ¢å¤é¡µé¢ã€‚
    */

    window.addEventListener(
        'pageshow',
        playWallpaperVideo
    );


    /*
    ç”¨æˆ·ç¬¬ä¸€æ¬¡ç‚¹å‡»é¡µé¢æ—¶ï¼Œ
    è§£å†³æµè§ˆå™¨å¯èƒ½å­˜åœ¨çš„è‡ªåŠ¨æ’­æ”¾é™åˆ¶ã€‚
    */

    document.addEventListener(
        'pointerdown',
        playWallpaperVideo,
        {
            once: true,
            passive: true
        }
    );


    /*
    ============================================================
    ChatGPT é¡µé¢å˜åŒ–ç›‘æŽ§
    ============================================================

    ChatGPT æ˜¯ Single-Page Applicationï¼ˆå•é¡µåº”ç”¨ï¼‰ã€‚

    åˆ‡æ¢å¯¹è¯æˆ–è¿›å…¥ Work æ—¶é€šå¸¸ä¸ä¼šå®Œæ•´åˆ·æ–°ç½‘é¡µï¼Œ
    å› æ­¤éœ€è¦ç›‘æŽ§é¡µé¢å†…éƒ¨å˜åŒ–ã€‚
    */

    const module9PageObserver =
        new MutationObserver(() => {

            if (module9ObserverBusy) {
                return;
            }

            module9ObserverBusy = true;

            requestAnimationFrame(() => {

                module9ObserverBusy = false;

                if (
                    module9Video &&
                    !module9Video.isConnected
                ) {
                    document.body.prepend(
                        module9Video
                    );
                }

                if (
                    module9Video &&
                    module9Video.paused &&
                    !document.hidden
                ) {
                    playWallpaperVideo();
                }
            });
        });


    module9PageObserver.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );


    /*
    ============================================================
    æ£€æŸ¥ Module å®‰è£…çŠ¶æ€
    ============================================================
    */

    function getWallpaperModuleStatus() {

        const status = {
            module1Settings:
                typeof SETTINGS === 'object',

            module2Video:
                Boolean(
                    document.getElementById(
                        'gpt-video-wallpaper'
                    )
                ),

            module3MainBackground:
                Boolean(
                    document.getElementById(
                        'gpt-wallpaper-module-3-style'
                    )
                ),

            module4Sidebar:
                Boolean(
                    document.getElementById(
                        'gpt-wallpaper-module-4-style'
                    )
                ),

            module5Header:
                Boolean(
                    document.getElementById(
                        'gpt-wallpaper-module-5-style'
                    )
                ),

            module6Composer:
                Boolean(
                    document.getElementById(
                        'gpt-wallpaper-module-6-style'
                    )
                ),

            module7Messages:
                Boolean(
                    document.getElementById(
                        'gpt-wallpaper-module-7-style'
                    )
                ),

            module8Details:
                Boolean(
                    document.getElementById(
                        'gpt-wallpaper-module-8-style'
                    )
                ),

            module9Compatibility:
                Boolean(
                    document.getElementById(
                        'gpt-wallpaper-module-9-style'
                    )
                ),

            videoConnected:
                Boolean(
                    module9Video?.isConnected
                ),

            videoPaused:
                module9Video
                    ? module9Video.paused
                    : null,

            videoReadyState:
                module9Video
                    ? module9Video.readyState
                    : null,

            videoSource:
                module9Video
                    ? module9Video.currentSrc
                    : null
        };

        console.table(status);

        return status;
    }


    /*
    ============================================================
    æä¾› Console è°ƒè¯•å·¥å…·
    ============================================================

    åœ¨ Chrome Console ä¸­å¯ä»¥ä½¿ç”¨ï¼š

    ChatGPTWallpaper.status()

    æŸ¥çœ‹æ‰€æœ‰æ¨¡å—çŠ¶æ€ã€‚

    ChatGPTWallpaper.restart()

    é‡æ–°åŠ è½½å¹¶æ’­æ”¾å£çº¸ã€‚

    ChatGPTWallpaper.pause()

    æš‚åœåŠ¨æ€å£çº¸ã€‚

    ChatGPTWallpaper.play()

    ç»§ç»­æ’­æ”¾åŠ¨æ€å£çº¸ã€‚
    */

    window.ChatGPTWallpaper = {

        status() {
            return getWallpaperModuleStatus();
        },

        restart() {
            if (!module9Video) {
                showWallpaperError(
                    'Wallpaper video was not found.'
                );

                return;
            }

            wallpaperUserPaused = false;
            module9RetryCount = 0;
            if (!wallpaperCanPlay()) return;
            module9Video.load();

            playWallpaperVideo();

            console.log(
                '[ChatGPT Wallpaper] Restart requested.'
            );
        },

        pause() {
            wallpaperUserPaused = true;
            clearTimeout(module9RecoveryTimer);
            module9Video?.pause();

            console.log(
                '[ChatGPT Wallpaper] Paused.'
            );
        },

        play() {
            wallpaperUserPaused = false;
            playWallpaperVideo();

            console.log(
                '[ChatGPT Wallpaper] Play requested.'
            );
        }
    };


    /*
    é¦–æ¬¡æ‰§è¡Œæ£€æŸ¥å’Œæ’­æ”¾ã€‚
    */

    playWallpaperVideo();

    console.log(
        '[ChatGPT Wallpaper] Module 9 initialized.'
    );

    getWallpaperModuleStatus();
    /*
    ============================================================
    ä»Žè¿™é‡Œå¼€å§‹æ˜¯å…¶ä»–åŠŸèƒ½æ¨¡å—
    ============================================================

    ä»¥åŽä¸éœ€è¦ä¿®æ”¹ä¸Šé¢çš„æ¨¡å—ç»“æž„ï¼Œåªéœ€ç»§ç»­åœ¨è¿™é‡Œæ·»åŠ ï¼š

    MODULE 2ï¼šåŠ è½½åŠ¨æ€å£çº¸
    MODULE 3ï¼šä¸»ç•Œé¢é€æ˜Ž
    MODULE 4ï¼šä¾§è¾¹æ æ¯›çŽ»ç’ƒ
    MODULE 5ï¼šè¾“å…¥æ¡†æ¯›çŽ»ç’ƒ
    MODULE 6ï¼šæ¶ˆæ¯æ¡†å’Œä»£ç æ¡†
    MODULE 7ï¼šä¿®å¤åº•éƒ¨æç¤ºé»‘åœˆ
    */

    // Modern ChatGPT Work surfaces verified in Chrome DevTools.
    // Keep these rules scoped to the conversation footer, Outputs panel,
    // and Work suggestion cards so other dialogs retain their own styling.
    document.getElementById('gpt-wallpaper-module-10-style')?.remove();
    const module10Style = document.createElement('style');
    module10Style.id = 'gpt-wallpaper-module-10-style';
    module10Style.textContent = `
        /* Preserve the user's existing Outputs/Sources visibility preference. */
        html body.gpt-hide-work-summary div:has(> [data-summary-panel-variant]) {
            display: none !important;
        }

        /* The footer can sit beyond Module 6's ancestor limit. Its empty,
           aria-hidden paint layer is decorative; leave controls and layout intact. */
        html body [data-thread-scroll-footer="true"] > div[aria-hidden="true"]:empty,
        html body [data-thread-scroll-footer="true"] > div[aria-hidden="true"]:empty::before,
        html body [data-thread-scroll-footer="true"] > div[aria-hidden="true"]:empty::after {
            background: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }

        /* Collapsed sidebar rail and conversation breadcrumb sit outside the expanded aside. */
        html body nav[class*="group/sidebar-rail"],
        html body nav[aria-label="Breadcrumb"] {
            background-color: transparent !important;
            background-image: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            box-shadow: none !important;
        }

        html body .gpt-chat-work-switch > span {
            background: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
        }

        html body .gpt-chat-work-switch {
            border-color: transparent !important;
        }

        html body aside.app-shell-left-panel {
            background-color: transparent !important;
            background-image: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }

        html body aside.app-shell-left-panel div.absolute.inset-0.bg-surface {
            background-color: transparent !important;
            background-image: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }

        html body aside.app-shell-left-panel .sidebar-item[aria-current="page"],
        html body aside.app-shell-left-panel .sidebar-item[aria-current="page"] a[aria-current="page"] {
            background-color: transparent !important;
            background-image: none !important;
        }

        html body [class*="group/panel-resizer"] > [class*="cursor-col-resize"] {
            background-color: transparent !important;
            background-image: none !important;
            border-color: transparent !important;
        }

        html body [class*="thread-scroll-layout"]
        div.pointer-events-none[class*="bg-gradient-to-t"][class*="from-surface"] {
            background-image: none !important;
        }

        html body div.rounded-2xl.bg-surface-elevated-secondary {
            background: rgba(13, 19, 30, 0.16) !important;
            backdrop-filter: blur(12px) saturate(120%) !important;
            -webkit-backdrop-filter: blur(12px) saturate(120%) !important;
        }

        html body section[class*="work-tasks"] article {
            background: rgba(13, 19, 30, 0.16) !important;
            border-color: rgba(255, 255, 255, 0.12) !important;
            backdrop-filter: blur(10px) saturate(120%) !important;
            -webkit-backdrop-filter: blur(10px) saturate(120%) !important;
        }

        html body section[class*="work-tasks"] article button {
            background: rgba(13, 19, 30, 0.24) !important;
        }
    `;
    document.documentElement.appendChild(module10Style);
})();

// 2026-10-01: current web titlebar surfaces and left navigation divider.
(function () {
    'use strict';
    const id = 'gpt-wallpaper-titlebar-sidebar-fix';
    document.getElementById(id)?.remove();
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
        html body [data-app-shell-titlebar] .bg-surface,
        html body [data-app-shell-titlebar] .bg-surface::before,
        html body [data-app-shell-titlebar] .bg-surface::after {
            background: transparent !important;
            background-image: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            box-shadow: none !important;
        }
        html body [data-app-shell-main-surface="browser"] {
            border-inline-start-color: transparent !important;
            border-left-color: transparent !important;
        }
    `;
    document.documentElement.appendChild(style);
})();


// 2026-10-05: maintain the observed background layers in one repair registry.
// Semantic shell markers and named messaging containers survive SPA remounts.
// Keep surface rules narrow; do not alter geometry, opacity, content or menus.
// CSS automatically covers later mounts, so no polling or MutationObserver is needed.
(function () {
    'use strict';
    const REPAIR_CONFIG = {
        styleId: 'gpt-wallpaper-current-surfaces-fix',
        layers: [
        {
                "name": "workspace-background",
                "selector": "html body [data-app-shell-workspace-row=\"true\"]::before, html body [data-app-shell-workspace=\"true\"]::before",
                "declarations": [
                        [
                                "background-color",
                                "transparent"
                        ],
                        [
                                "background-image",
                                "none"
                        ]
                ]
        },
        {
                "name": "embedded-dot-background",
                "selector": "html body .messaging-root.messaging-embedded",
                "declarations": [
                        [
                                "background-color",
                                "transparent"
                        ],
                        [
                                "background-image",
                                "none"
                        ]
                ]
        },
        {
                "name": "dot-composer-decoration",
                "selector": "html body .messaging-root.messaging-embedded .composer-wrap .pointer-events-none.bg-gradient-to-t",
                "declarations": [
                        [
                                "background-image",
                                "none"
                        ]
                ]
        },
        {
                "name": "qualified-settings-background",
                "selector": "html body [data-app-shell-focus-area=\"main\"] [data-codex-history-swipe-page=\"true\"] > [class~=\"electron:bg-surface\"][class~=\"electron:overflow-hidden\"][class~=\"windows:rounded-tl-lg\"]",
                "declarations": [
                        [
                                "background-color",
                                "transparent"
                        ],
                        [
                                "background-image",
                                "none"
                        ]
                ]
        }
]
    };
    const css = REPAIR_CONFIG.layers.map((layer) => {
        const declarations = layer.declarations.map(([property, value]) =>
            `    ${property}: ${value} !important;`
        ).join('\n');
        return `${layer.selector} {\n${declarations}\n}`;
    }).join('\n\n');
    // A repeated initialization replaces this one sheet; all other styles remain.
    document.getElementById(REPAIR_CONFIG.styleId)?.remove();
    const style = document.createElement('style');
    style.id = REPAIR_CONFIG.styleId;
    style.textContent = css;
    document.documentElement.appendChild(style);
})();

// 2026-11-01: scoped Dot readability, measured avatar/composer safety bounds.
(function () {
    'use strict';
    const id = 'gpt-wallpaper-dot-surfaces-v1';
    document.getElementById(id)?.remove();
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
/* Dot-only surfaces; no geometry resets or blanket descendant transparency. */
html body[data-gpt-dot-ui] {
    --gpt-dot-top-safe: 104px;
    --gpt-dot-bottom-safe: 72px;
}
/* Actual app frame is the opaque child of #root, behind every Dot surface. */
html body[data-gpt-dot-ui] #root > [data-app-shell-frame="true"] {
    background-color: transparent !important;
    background-image: none !important;
}
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .messages-scroll {
    /* Padding alone scrolls away: clip the live viewport below the fixed avatar. */
    clip-path: inset(var(--gpt-dot-top-safe) 0 var(--gpt-dot-bottom-safe) 0);
    padding-block-start: max(112px, calc(var(--gpt-dot-top-safe) + 12px)) !important;
    scroll-padding-block: calc(var(--gpt-dot-top-safe) + 12px) calc(var(--gpt-dot-bottom-safe) + 12px);
}
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .messages-scroll > .message-list {
    padding-block-end: var(--gpt-dot-tail-padding, calc(var(--gpt-dot-bottom-safe) + 12px)) !important;
}

/* Candidate: native empty decorative scrim observed on current Dot DOM. */
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .composer-wrap
[data-codex-composer-root] > .pointer-events-none >
[aria-hidden="true"].pointer-events-none.absolute.inset-x-0.bottom-0:empty {
    background-image: none !important;
}

/* Dot attachment layout only. Preserve native expanded editor and file cards. */
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .composer-wrap
[data-composer-body]:not(:has([data-expanded-composer])) [data-composer-attachments][data-visible-attachments] {
    padding: 8px 8px 0 !important;
}
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .composer-wrap
[data-composer-body]:not(:has([data-expanded-composer])) [data-visible-attachments] > .composer-uploads {
    margin-bottom: 0 !important;
}
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .composer-wrap
[data-composer-body]:not(:has([data-expanded-composer])) [data-composer-attachments-row] >
.composer-attachment-surface[aria-label]:has(> .composer-attachment-surface > img) {
    width: 72px !important;
    height: 72px !important;
}
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .composer-wrap
[data-composer-body]:has([data-visible-attachments]):not(:has([data-expanded-composer]))
[data-composer-input-layout="multiline"] {
    padding-block: 10px !important;
}

html body[data-gpt-dot-ui] [data-gpt-dot-header] {
    background: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}
html body[data-gpt-dot-ui] [data-gpt-dot-avatar] {
    background: rgba(10,15,24,.86) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    border-radius: 18px;
    box-shadow: inset 0 0 0 1px rgba(220,225,255,.14);
}
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .message-row:not(.self) .message-bubble {
    background: rgba(12,18,29,.80) !important;
    color: #f2f3f7 !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    box-shadow: inset 0 0 0 1px rgba(220,225,255,.10), 0 4px 14px rgba(0,0,0,.12);
}
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .message-row.self .message-bubble {
    background: rgba(42,62,92,.94) !important;
    color: #f5f7ff !important;
    box-shadow: inset 0 0 0 1px rgba(165,190,235,.22);
}
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .composer-wrap [data-composer-surface-variant],
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .composer-wrap [data-gpt-composer-v18="shell"] {
    background: rgba(13,20,32,.86) !important;
    backdrop-filter: blur(14px) !important;
    -webkit-backdrop-filter: blur(14px) !important;
    border-radius: 20px !important;
    box-shadow: inset 0 0 0 1px rgba(205,215,245,.20), 0 6px 24px rgba(0,0,0,.20) !important;
}
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .composer-wrap [contenteditable="true"] {
    color: #f2f3f7 !important;
    caret-color: #d9e5ff;
}
html body[data-gpt-dot-ui] nav[data-app-navigation-rail="true"] {
    background: rgba(10,15,24,.58) !important;
    box-shadow: inset -1px 0 0 rgba(220,225,255,.12) !important;
}
html body[data-gpt-dot-ui] :is([role="menu"], [role="listbox"], [role="dialog"]) {
    background: rgba(16,23,36,.98) !important;
    color: #f2f3f7 !important;
}
html body[data-gpt-dot-ui] .messaging-root.messaging-embedded .composer-wrap button:focus-visible {
    outline: 2px solid #b7cbff;
    outline-offset: 2px;
}
`;
    document.documentElement.appendChild(style);
})();


/* v1.9.18: Reduce compositing load on ChatGPT conversation surfaces.
   Keep wallpaper storage and UI geometry unchanged. */
(function () {
    const style = document.createElement('style');
    style.id = 'gpt-wallpaper-low-compositing-v18';
    style.textContent = `
        body.gpt-wallpaper-image-active *,
        body.gpt-wallpaper-image-active *::before,
        body.gpt-wallpaper-image-active *::after,
        body.gpt-wallpaper-image-active::before,
        body.gpt-wallpaper-image-active::after {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }
    `;
    document.documentElement.appendChild(style);
})();

// Footer scrim compatibility: image and video wallpapers.


(() => {
  'use strict';
  const id = 'chatgpt-wallpaper-footer-fix';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    html body:has(#gpt-video-wallpaper, #gpt-image-wallpaper)
      div[class*="footer-"].pointer-events-none.absolute.inset-x-0.bottom-0::before,
    html body:has(#gpt-video-wallpaper, #gpt-image-wallpaper)
      div[class*="footer-"].pointer-events-none.absolute.inset-x-0.bottom-0::after {
      background: transparent !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
})();


// v1.9.20: remove webpage titlebar paint only when a real wallpaper is selected.
// The browser frame, wallpaper media, input and menus are not modified.
(() => {
    'use strict';
    const id = 'gpt-wallpaper-titlebar-paint-v1920';
    if (document.getElementById(id)) return;
    const root = 'html body:has(> #gpt-image-wallpaper[src^="blob:"], > #gpt-video-wallpaper[src^="blob:"])';
    const title = root + ' [data-app-shell-titlebar]';
    const paint = title + ' > .bg-surface:not(:is(button, a, [role="button"], [role="menu"], [role="listbox"], [role="dialog"]))';
    const selectors = [title, title + '::before', title + '::after', paint, paint + '::before', paint + '::after'];
    const style = document.createElement('style');
    style.id = id;
    style.textContent = selectors.join(',\n') + ' { background-color: transparent !important; background-image: none !important; box-shadow: none !important; }';
    (document.head || document.documentElement).appendChild(style);
})();

// v1.9.21: soften four narrow web surfaces without touching the wallpaper,
// native fullscreen chrome, text, tool controls, focus outlines or menus.
(() => {
    'use strict';
    const id = 'gpt-wallpaper-edge-paint-v1921';
    if (document.getElementById(id)) return;

    const wallpaper = 'html body:has(> #gpt-image-wallpaper[src^="blob:"], > #gpt-video-wallpaper[src^="blob:"])';
    const surface = (selector) => wallpaper + ' ' + selector;
    const passive = ':not([role], [tabindex], [contenteditable])';
    const title = surface(':is([data-app-shell-titlebar], [data-testid="page-header"], nav[aria-label="Breadcrumb"])');
    const sidebar = surface(':is(nav[data-app-navigation-rail="true"], nav[class*="group/sidebar-rail"], aside.app-shell-left-panel)');
    const sidebarPaint = surface('aside.app-shell-left-panel div.absolute.inset-0.bg-surface' + passive);
    const divider = surface('[class*="group/panel-resizer"] > [class*="cursor-col-resize"]');
    const activeComposer = surface(':is([data-gpt-composer-v18="shell"], .composer-wrap [data-composer-surface-variant])');
    const footerBar = surface('[data-composer-bar-placement="footer"]');
    const footerInner = footerBar + ' > :is(div, section, footer)' + passive;
    const threadFooterPaint = surface('[data-thread-scroll-footer="true"] > div[aria-hidden="true"]:empty');
    const nativeScrim = surface('div[class*="footer-"].pointer-events-none.absolute.inset-x-0.bottom-0');
    const decoration = (selector) => [selector + '::before', selector + '::after'];
    const clearPaint = [
        title, ...decoration(title),
        sidebar, ...decoration(sidebar), sidebarPaint, ...decoration(sidebarPaint), divider,
        footerBar, ...decoration(footerBar), footerInner, ...decoration(footerInner),
        threadFooterPaint, ...decoration(threadFooterPaint), ...decoration(nativeScrim)
    ];
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
${clearPaint.join(',\n')} {
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
    border-color: transparent !important;
}
${activeComposer} {
    background-color: rgba(13, 19, 30, .34) !important;
    background-image: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
}
${activeComposer}:focus-within {
    border-color: rgba(218, 225, 247, .17) !important;
}
`;
    (document.head || document.documentElement).appendChild(style);
})();
