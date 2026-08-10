## lets make a simple dlc option where users can purchase more sound packs inspired by their favorite retro games, also iets make a logo/icon for this where it's a super famicom controller but shifts into music notes and is a simple pixel art vector that is minimal ,colorful, and stylish even when scaled down, users should also have the ability to add additional patterns by clicking a button beneath pattern 4 on the playlist timeline sequencer 

```html
<!DOCTYPE html>
<html lang="en" data-theme="mario">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Ghettochip Studio - Retro Sound Library & DLC Workstation</title>
    <style>
        /* --- THEME CONFIGURATIONS --- */
        :root[data-theme="mario"] {
            --bg-dark: #1a44b3;
            --panel-bg: #f8f9fa;
            --panel-border: #b0c4de;
            --accent-orange: #e52521;
            --accent-green: #43b02a;
            --accent-cyan: #0099ff;
            --accent-red: #e52521;
            --accent-pink: #f8312f;
            --accent-yellow: #fbd000;
            --step-off-1: #e2e8f0;
            --step-off-2: #cbd5e1;
            --text-main: #1e293b;
            --text-muted: #64748b;
            --btn-bg: #ffffff;
            --btn-hover: #e2e8f0;
        }

        :root[data-theme="pokemon"] {
            --bg-dark: #1e1e2f;
            --panel-bg: #f3f4f6;
            --panel-border: #9ca3af;
            --accent-orange: #cc0000;
            --accent-green: #3b82f6;
            --accent-cyan: #2563eb;
            --accent-red: #dc2626;
            --accent-pink: #db2777;
            --accent-yellow: #f59e0b;
            --step-off-1: #e5e7eb;
            --step-off-2: #d1d5db;
            --text-main: #111827;
            --text-muted: #4b5563;
            --btn-bg: #ffffff;
            --btn-hover: #e5e7eb;
        }

        :root[data-theme="ff"] {
            --bg-dark: #090c15;
            --panel-bg: #101626;
            --panel-border: #3b4d71;
            --accent-orange: #d4af37;
            --accent-green: #22c55e;
            --accent-cyan: #38bdf8;
            --accent-red: #ef4444;
            --accent-pink: #ec4899;
            --accent-yellow: #eab308;
            --step-off-1: #1a2236;
            --step-off-2: #141b2d;
            --text-main: #f1f5f9;
            --text-muted: #94a3b8;
            --btn-bg: #1e293b;
            --btn-hover: #334155;
        }

        :root[data-theme="dark"] {
            --bg-dark: #0f1015;
            --panel-bg: #1a1c23;
            --panel-border: #2c2e3e;
            --accent-orange: #ff6600;
            --accent-green: #39ff14;
            --accent-cyan: #00f3ff;
            --accent-red: #ff2a2a;
            --accent-pink: #ff00ff;
            --accent-yellow: #ffbb00;
            --step-off-1: #252733;
            --step-off-2: #1e2029;
            --text-main: #d0d4e0;
            --text-muted: #62677d;
            --btn-bg: #252733;
            --btn-hover: #323545;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-tap-highlight-color: transparent; }
        
        body {
            background-color: var(--bg-dark); color: var(--text-main);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            height: 100vh; display: flex; flex-direction: column; padding: 6px; overflow: hidden;
            transition: background 0.2s, color 0.2s;
        }

        .panel {
            background: var(--panel-bg); border: 2px solid var(--panel-border);
            border-radius: 6px; box-shadow: 0 4px 15px rgba(0,0,0,0.25); margin-bottom: 6px;
            transition: background 0.2s, border-color 0.2s;
        }
        .panel-header {
            background: rgba(0,0,0,0.06); padding: 6px 10px; border-bottom: 1px solid var(--panel-border);
            font-size: 11px; font-weight: bold; color: var(--text-muted);
            display: flex; justify-content: space-between; align-items: center;
        }

        /* --- VECTOR ICON STYLING --- */
        .v-icon { width: 14px; height: 14px; fill: currentColor; display: inline-block; vertical-align: middle; flex-shrink: 0; }
        .v-icon-lg { width: 22px; height: 22px; }

        /* --- TRANSPORT BAR --- */
        .transport-bar { padding: 6px 10px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .brand { color: var(--accent-orange); font-weight: 900; font-size: 15px; letter-spacing: 1px; display: flex; align-items: center; gap: 6px; }
        .brand span { font-size: 9px; background: rgba(0,0,0,0.08); padding: 2px 4px; border: 1px solid var(--accent-orange); border-radius: 3px; }
        .btn-group { display: flex; gap: 4px; align-items: center; border-right: 1px solid var(--panel-border); padding-right: 8px; }

        .btn {
            background: var(--btn-bg); border: 1px solid var(--panel-border); color: var(--text-main);
            padding: 6px 10px; border-radius: 4px; font-weight: bold; font-size: 11px;
            cursor: pointer; display: flex; align-items: center; gap: 5px; transition: 0.1s;
        }
        .btn:hover, .btn:active { background: var(--btn-hover); border-color: var(--accent-cyan); color: var(--accent-cyan); }
        .btn-play.active { background: var(--accent-green); color: black; border-color: white; box-shadow: 0 0 10px var(--accent-green); }
        .btn-rec.active { background: var(--accent-red); color: white; border-color: white; box-shadow: 0 0 10px var(--accent-red); animation: pulse 1s infinite; }
        .btn-glitch.active { background: var(--accent-pink); color: white; border-color: white; box-shadow: 0 0 10px var(--accent-pink); }
        .btn-library { background: var(--accent-yellow); color: #111; border-color: #b45309; }
        .btn-library:hover { background: #fcd34d; color: #000; }
        .btn-dlc { background: var(--accent-pink); color: white; border-color: #be185d; }
        .btn-dlc:hover { background: #f472b6; color: white; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }

        /* --- LOW-RESOURCE VISUALIZER CANVAS --- */
        #viz-canvas {
            background: var(--btn-bg);
            border: 1px solid var(--panel-border);
            border-radius: 3px;
            width: 70px;
            height: 22px;
            flex-shrink: 0;
        }

        .mode-toggle { display: flex; background: rgba(0,0,0,0.05); border-radius: 4px; border: 1px solid var(--panel-border); overflow: hidden; }
        .mode-toggle div { padding: 4px 8px; font-size: 11px; font-weight: bold; cursor: pointer; color: var(--text-muted); }
        .mode-toggle div.active { background: var(--accent-orange); color: white; }

        .knob-row { display: flex; gap: 8px; font-size: 10px; font-weight: bold; color: var(--text-muted); align-items: center; flex-wrap: wrap; }
        .knob { display: flex; flex-direction: column; gap: 2px; }
        .knob input { accent-color: var(--accent-cyan); width: 50px; cursor: pointer; }
        select { background: var(--btn-bg); color: var(--text-main); border: 1px solid var(--panel-border); padding: 3px 4px; font-size: 11px; border-radius: 3px; }

        /* --- MODALS & SOUND LIBRARY --- */
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.75);
            display: none; justify-content: center; align-items: center; z-index: 1000; padding: 10px;
        }
        .modal-overlay.open { display: flex; }
        .modal-content {
            background: var(--panel-bg); border: 2px solid var(--panel-border); border-radius: 8px;
            width: 100%; max-width: 860px; max-height: 90vh; padding: 10px; box-shadow: 0 0 35px rgba(0,0,0,0.5);
            display: flex; flex-direction: column; overflow: hidden;
        }
        .modal-scroll-area { overflow-x: auto; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 4px; max-height: 72vh; }

        .icon-btn-close {
            background: var(--accent-red); color: white; border: 1px solid white; border-radius: 3px;
            width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer;
            font-weight: bold; font-size: 12px; transition: 0.1s;
        }
        .icon-btn-close:hover { opacity: 0.85; transform: scale(1.05); }

        /* --- SOUND LIBRARY STYLING --- */
        .lib-tabs { display: flex; gap: 6px; margin-bottom: 10px; border-bottom: 1px solid var(--panel-border); padding-bottom: 6px; flex-wrap: wrap; }
        .lib-tab { padding: 6px 12px; background: var(--btn-bg); border: 1px solid var(--panel-border); border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; color: var(--text-muted); }
        .lib-tab.active { background: var(--accent-orange); color: white; border-color: white; }
        
        .lib-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 8px; }
        .lib-card { background: var(--btn-bg); border: 1px solid var(--panel-border); border-radius: 6px; padding: 8px; display: flex; flex-direction: column; gap: 6px; position: relative; }
        .lib-card.locked { opacity: 0.85; border-style: dashed; }
        .lib-card-header { display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: bold; color: var(--text-main); }
        .lib-badge { font-size: 8px; padding: 2px 5px; border-radius: 3px; background: rgba(0,0,0,0.08); border: 1px solid var(--panel-border); color: var(--accent-cyan); text-transform: uppercase; }
        .lib-desc { font-size: 9px; color: var(--text-muted); line-height: 1.2; }
        .lib-actions { display: flex; gap: 4px; margin-top: 4px; }
        
        /* --- NOTE SEQUENCER & PIANO ROLL GRID --- */
        .piano-roll-container { display: flex; flex-direction: column; gap: 2px; margin-top: 8px; width: max-content; }
        .pr-row { display: flex; gap: 2px; align-items: center; }
        .pr-label { width: 50px; font-size: 9px; font-weight: 900; color: var(--text-main); text-align: right; padding-right: 6px; flex-shrink: 0; }
        .pr-steps { display: flex; gap: 2px; }
        .pr-step-btn { width: 22px; height: 20px; background: var(--step-off-2); border: 1px solid var(--panel-border); border-radius: 2px; cursor: pointer; flex-shrink: 0; }
        .pr-step-btn.active { background: var(--accent-cyan); box-shadow: 0 0 6px var(--accent-cyan); border-color: white; }

        /* --- GLITCH SEQUENCER MODAL --- */
        .glitch-grid-container { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; width: max-content; }
        .glitch-row { display: flex; gap: 2px; align-items: center; }
        .glitch-label { width: 80px; font-size: 9px; font-weight: 900; color: var(--text-main); text-align: right; padding-right: 6px; flex-shrink: 0; }
        .glitch-steps { display: flex; gap: 2px; }
        .glitch-step-btn { width: 20px; height: 28px; background: var(--step-off-2); border: 1px solid var(--panel-border); border-radius: 2px; cursor: pointer; flex-shrink: 0; }
        .glitch-step-btn.active { background: var(--accent-pink); box-shadow: 0 0 6px var(--accent-pink); border-color: white; }

        /* --- STEP LED INDICATOR STRIP --- */
        .indicator-strip-row { display: flex; gap: 2px; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px solid var(--panel-border); width: max-content; }
        .indicator-strip-label { width: 90px; font-size: 9px; font-weight: bold; color: var(--text-muted); text-align: right; padding-right: 6px; flex-shrink: 0; }
        .indicator-dots { display: flex; gap: 2px; }
        .ind-dot { width: 18px; height: 6px; background: var(--step-off-2); border-radius: 2px; flex-shrink: 0; border: 1px solid rgba(0,0,0,0.2); }
        .ind-dot.active { background: var(--accent-orange); box-shadow: 0 0 6px var(--accent-orange); border-color: white; }
        .ind-divider { width: 2px; height: 6px; background: var(--accent-red); margin: 0 2px; opacity: 0.4; flex-shrink: 0; }

        /* --- SONG TIMELINE & SCRUBBABLE RULER --- */
        .timeline-grid { display: flex; flex-direction: column; gap: 2px; padding: 6px 8px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .tl-ruler { display: flex; gap: 2px; align-items: center; margin-bottom: 2px; width: max-content; cursor: pointer; }
        .tl-ruler-label { width: 65px; font-size: 9px; font-weight: bold; color: var(--accent-orange); text-align: right; padding-right: 6px; flex-shrink: 0; }
        .tl-ruler-blocks { display: flex; gap: 2px; position: relative; }
        .tl-ruler-num { width: 36px; height: 16px; background: var(--btn-bg); border: 1px solid var(--panel-border); border-radius: 2px; font-size: 9px; font-weight: bold; color: var(--text-muted); display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; }
        .tl-ruler-num:hover { color: var(--text-main); background: var(--btn-hover); }
        .tl-ruler-num.active { background: var(--accent-orange); color: white; border-color: white; }

        .tl-row { display: flex; gap: 2px; align-items: center; width: max-content; }
        .tl-label { width: 65px; font-size: 10px; font-weight: bold; color: var(--text-main); text-align: right; padding-right: 6px; flex-shrink: 0; }
        .tl-blocks { display: flex; gap: 2px; position: relative; }
        .tl-block { width: 36px; height: 16px; background: var(--step-off-2); border: 1px solid var(--panel-border); border-radius: 2px; cursor: pointer; flex-shrink: 0; }
        .tl-block:hover { background: var(--btn-hover); }
        .tl-block.active { background: var(--accent-cyan); box-shadow: inset 0 0 6px rgba(0,0,0,0.3); border-color: white; }

        .add-pattern-row { display: flex; gap: 6px; align-items: center; margin-top: 4px; width: max-content; }
        .add-pattern-btn { width: 65px; height: 18px; background: var(--accent-green); color: white; border: none; font-size: 8px; font-weight: bold; border-radius: 2px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 2px; }
        .add-pattern-btn:hover { opacity: 0.9; }

        /* --- CHANNEL RACK --- */
        .channel-rack { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .tracks-area { overflow-y: auto; overflow-x: auto; padding: 8px; flex: 1; -webkit-overflow-scrolling: touch; }
        .track-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; width: max-content; }
        
        .track-info { width: 95px; background: var(--btn-bg); border: 1px solid var(--panel-border); border-left: 4px solid var(--accent-cyan); padding: 3px; font-size: 9px; font-weight: bold; border-radius: 3px; text-align: center; flex-shrink: 0; color: var(--text-main); display: flex; flex-direction: column; gap: 2px; }
        .track-name-clickable { cursor: pointer; }
        .track-name-clickable:hover { color: var(--accent-cyan); }
        
        .track-controls-inline { display: flex; gap: 2px; justify-content: center; align-items: center; }
        .track-btn-sm { font-size: 7px; padding: 1px 4px; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 2px; cursor: pointer; font-weight: bold; color: var(--text-main); }
        .track-btn-sm:hover { background: var(--btn-hover); }
        .track-btn-sm.muted { background: var(--accent-red); color: white; border-color: white; }
        .track-btn-sm.note-seq-btn { background: var(--accent-cyan); color: white; }

        .track-mix { display: flex; flex-direction: column; gap: 2px; background: rgba(0,0,0,0.03); padding: 3px; border-radius: 3px; border: 1px solid var(--panel-border); flex-shrink: 0; }
        .mix-ctrl { display: flex; align-items: center; gap: 3px; font-size: 8px; color: var(--text-muted); }
        .mix-ctrl input[type="range"] { width: 32px; height: 6px; accent-color: var(--text-main); cursor: pointer; }
        
        .step-container { display: flex; gap: 2px; }
        .step-btn { width: 18px; height: 28px; border-radius: 2px; border: 1px solid rgba(0,0,0,0.2); cursor: pointer; flex-shrink: 0; }
        .step-btn.group-a { background: var(--step-off-1); }
        .step-btn.group-b { background: var(--step-off-2); }
        .step-btn.active { background: var(--accent-orange) !important; box-shadow: 0 0 4px var(--accent-orange); border-color: white; }
        .bar-divider { width: 2px; height: 28px; background: var(--accent-red); margin: 0 2px; opacity: 0.4; flex-shrink: 0; }

        /* ADD CHANNEL ROW */
        .add-channel-row { display: flex; gap: 6px; align-items: center; margin-top: 8px; width: max-content; }
        .add-channel-btn { width: 105px; height: 28px; background: var(--accent-cyan); color: white; border: none; font-size: 9px; font-weight: bold; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.15); }
        .add-channel-btn:hover { opacity: 0.9; }

        input[type="file"] { display: none; }
    </style>
</head>
<body>

    <!-- TRANSPORT -->
    <div class="panel">
        <div class="transport-bar">
            <div class="brand">
                <!-- SUPER FAMICOM CONTROLLER SHIFTING INTO MUSIC NOTES LOGO -->
                <svg class="v-icon v-icon-lg" viewBox="0 0 32 32" style="width:22px; height:22px;">
                    <rect x="2" y="10" width="28" height="14" rx="3" fill="var(--panel-border)" stroke="var(--text-muted)" stroke-width="1.5"/>
                    <path d="M6 14h2v6H6z M4 16h6v2H4z" fill="var(--text-main)"/>
                    <circle cx="23" cy="15" r="1.5" fill="#e52521"/>
                    <circle cx="26" cy="18" r="1.5" fill="#43b02a"/>
                    <circle cx="20" cy="18" r="1.5" fill="#0099ff"/>
                    <circle cx="23" cy="21" r="1.5" fill="#fbd000"/>
                    <path d="M28 8v6a2 2 0 1 1-2-2h2V6h3V4h-3z" fill="var(--accent-cyan)"/>
                </svg>
                1337 <span>G-CHIP</span>
            </div>
            <div class="btn-group">
                <button class="btn btn-play" id="btn-play">
                    <svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg> PLAY
                </button>
                <button class="btn btn-rec" id="btn-export">
                    <svg class="v-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="currentColor"/></svg> EXPORT
                </button>
            </div>
            <!-- LOW-RESOURCE VISUALIZER -->
            <div class="btn-group" title="Low-Resource Audio Visualizer">
                <canvas id="viz-canvas" width="70" height="22"></canvas>
            </div>
            <div class="btn-group">
                <button class="btn btn-library" id="btn-open-library">
                    <svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg> LIBRARY
                </button>
                <button class="btn btn-dlc" id="btn-open-dlc">
                    <svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z"/></svg> DLC PACKS
                </button>
                <button class="btn btn-glitch" id="btn-open-glitch">
                    <svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2v11h3v9l7-12h-4l4-8z"/></svg> GLITCH SEQ
                </button>
                <button class="btn" id="btn-theme-toggle" title="Switch Theme">
                    <svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19h4.28c1.01.62 2.22 1 3.37 1 4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg> THEME
                </button>
            </div>
            <div class="mode-toggle" id="mode-toggle">
                <div class="active" data-mode="pat">PAT</div>
                <div data-mode="song">SONG</div>
            </div>
            <div class="btn-group">
                <button class="btn" id="btn-save" title="Save Project">
                    <svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
                </button>
                <button class="btn" id="btn-load" title="Load Project">
                    <svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
                </button>
                <button class="btn" id="btn-midi" title="Import MIDI">
                    <svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-3 3h2v2H5v-2zm3 0h2v2H8v-2zm3 0h2v2h-2v-2zm3 0h2v2h-3v-2zm0-3h2v2h-2v-2zm0-3h2v2h-2V8z"/></svg> MIDI
                </button>
                <input type="file" id="file-upload" accept=".gcp">
                <input type="file" id="midi-upload" accept=".mid,.midi">
                <input type="file" id="sample-upload" accept=".wav,.mp3,.ogg">
            </div>
            <div class="knob-row">
                <div class="knob"><label>BPM: <span id="val-bpm" style="color:var(--accent-cyan)">120</span></label><input type="range" id="sl-bpm" min="60" max="200" value="120"></div>
                <div class="knob"><label>LPF: <span id="val-lpf" style="color:var(--accent-cyan)">3200Hz</span></label><input type="range" id="sl-lpf" min="500" max="8000" step="100" value="3200"></div>
                <div class="knob"><label>DIST: <span id="val-dist" style="color:var(--accent-red)">15%</span></label><input type="range" id="sl-dist" min="0" max="100" value="15"></div>
                <div class="knob" style="justify-content: flex-end;">
                    <select id="sel-pattern">
                        <option value="0">Pattern 1</option><option value="1">Pattern 2</option><option value="2">Pattern 3</option><option value="3">Pattern 4</option>
                    </select>
                </div>
            </div>
        </div>
    </div>

    <!-- SOUND LIBRARY POPUP MODAL -->
    <div class="modal-overlay" id="library-modal">
        <div class="modal-content">
            <div class="panel-header">
                <span style="display:flex; align-items:center; gap:6px;">
                    <svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
                    RETRO SOUND LIBRARY & KITS
                </span>
                <button class="icon-btn-close" id="btn-close-library" title="Close">✕</button>
            </div>
            <div class="modal-scroll-area">
                <div class="lib-tabs" id="lib-tabs">
                    <div class="lib-tab active" data-kit="mario">🍄 Super Mario World Kit</div>
                    <div class="lib-tab" data-kit="pokemon">⚡ Pokémon Red/Blue Kit</div>
                    <div class="lib-tab" data-kit="ff">⚔️ Final Fantasy III Kit</div>
                </div>
                <div class="lib-grid" id="lib-grid"></div>
            </div>
        </div>
    </div>

    <!-- DLC SOUND PACKS MARKETPLACE MODAL -->
    <div class="modal-overlay" id="dlc-modal">
        <div class="modal-content">
            <div class="panel-header" style="background: rgba(236,72,153,0.15);">
                <span style="display:flex; align-items:center; gap:6px; color:var(--accent-pink);">
                    <svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z"/></svg>
                    RETRO DLC EXPANSION PACKS (MARKETPLACE)
                </span>
                <button class="icon-btn-close" id="btn-close-dlc" title="Close">✕</button>
            </div>
            <div class="modal-scroll-area">
                <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 8px;">Unlock premium DLC sound kits inspired by legendary retro console classics. Instantly add custom drum kits, arps, and sound FX to your workstation channels!</div>
                <div class="lib-grid" id="dlc-grid"></div>
            </div>
        </div>
    </div>

    <!-- GLITCH SEQUENCER POPUP MODAL -->
    <div class="modal-overlay" id="glitch-modal">
        <div class="modal-content">
            <div class="panel-header">
                <span>GLITCH SEQ (PAT <span id="glitch-pat-label">1</span>)</span>
                <button class="icon-btn-close" id="btn-close-glitch" title="Close">✕</button>
            </div>
            <div class="modal-scroll-area">
                <div class="glitch-grid-container" id="glitch-grid"></div>
                <div class="indicator-strip-row">
                    <div class="indicator-strip-label">STEP LED INDICATOR</div>
                    <div class="indicator-dots" id="glitch-indicator-dots"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- NOTE SEQUENCER & PIANO ROLL MODAL -->
    <div class="modal-overlay" id="note-seq-modal">
        <div class="modal-content">
            <div class="panel-header">
                <span>NOTE SEQUENCER / PIANO ROLL: <span id="modal-track-name">LEAD</span> (PAT <span id="note-seq-pat-label">1</span>)</span>
                <button class="icon-btn-close" id="btn-close-note-seq" title="Close">✕</button>
            </div>
            <div class="modal-scroll-area">
                <div class="piano-roll-container" id="piano-roll-grid"></div>
            </div>
            <div class="indicator-strip-row">
                <div class="indicator-strip-label">STEP LED INDICATOR</div>
                <div class="indicator-dots" id="note-seq-indicator-dots"></div>
            </div>
        </div>
    </div>

    <!-- SONG TIMELINE & CLIP ARRANGER -->
    <div class="panel">
        <div class="panel-header">SONG ARRANGEMENT & PLAYLIST (Click ruler numbers to scrub playback) <span id="song-pos">POS: 01</span></div>
        <div class="timeline-grid" id="timeline-container"></div>
    </div>

    <!-- RACK -->
    <div class="panel channel-rack">
        <div class="panel-header">CHANNEL RACK, MIXER & PATTERN MUTES <span id="pat-pos">STEP: 01 / 32</span></div>
        <div class="tracks-area" id="rack-container">
            <div id="tracks-list"></div>
            <!-- + ADD CHANNEL ROW -->
            <div class="add-channel-row">
                <button class="add-channel-btn" id="btn-add-channel">
                    <svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> ADD SAMPLE
                </button>
                <div style="font-size: 9px; color: var(--text-muted);">Import audio or pick from the Sound Library / DLC Packs to populate channels.</div>
            </div>
            <div class="indicator-strip-row" style="margin-top: 12px;">
                <div class="indicator-strip-label">STEP LED INDICATOR</div>
                <div class="indicator-dots" id="pat-indicator-dots"></div>
            </div>
        </div>
    </div>

<script>
    // --- SOUND LIBRARY DATA (SMW, POKEMON, FF III) & DLC PACKS ---
    const soundLibraryKits = {
        mario: [
            { id: 'mario_coin', name: 'Coin Chime', category: 'Sound FX', desc: 'Classic Super Mario World coin collection ping.' },
            { id: 'mario_jump', name: 'Super Jump', category: 'Synth Lead', desc: 'Rising frequency spring sound effect.' },
            { id: 'mario_kick', name: 'Spin Kick Drum', category: 'Drum Kit', desc: 'Thumping SNES low bass drum thud.' },
            { id: 'mario_snare', name: 'Yoshi Snare', category: 'Drum Kit', desc: 'Crisp acoustic-chip snare snap.' },
            { id: 'mario_powerup', name: 'Mushroom Power', category: 'Sound FX', desc: 'Ascending 16-bit square wave arpeggio.' },
            { id: 'mario_bongo', name: 'Athletic Bongo', category: 'Other Noises', desc: 'Fast melodic wooden percussive pulse.' }
        ],
        pokemon: [
            { id: 'poke_select', name: 'Menu Select', category: 'Sound FX', desc: 'Classic GameBoy UI cursor beep.' },
            { id: 'poke_heal', name: 'Pokecenter Chime', category: 'Synth Lead', desc: 'Restoration healing arpeggio sequence.' },
            { id: 'poke_kick', name: 'Encounter Kick', category: 'Drum Kit', desc: 'Punchy 8-bit battle initialization kick.' },
            { id: 'poke_snare', name: 'Trainer Snare', category: 'Drum Kit', desc: 'Sharp white noise battle hit.' },
            { id: 'poke_bike', name: 'Cycling Gear', category: 'Other Noises', desc: 'Fast rhythmic pedal whir noise.' },
            { id: 'poke_item', name: 'Item Get', category: 'Sound FX', desc: 'Bright celebratory jingle chime.' }
        ],
        ff: [
            { id: 'ff_cursor', name: 'FF3 Crystal Cursor', category: 'Sound FX', desc: 'Royal menu selection blip.' },
            { id: 'ff_magic', name: 'Aero Magic Cast', category: 'Synth Lead', desc: 'Shimmering crystal chord arpeggio.' },
            { id: 'ff_kick', name: 'Battle Heavy Kick', category: 'Drum Kit', desc: 'Cinematic deep low-end impact drum.' },
            { id: 'ff_bell', name: 'Victory Fanfare Bell', category: 'Synth Lead', desc: 'Crystal tower celebratory bell tone.' },
            { id: 'ff_airship', name: 'Airship Engine', category: 'Other Noises', desc: 'Low rumbling retro propulsion hum.' },
            { id: 'ff_chocobo', name: 'Chocobo Stomp', category: 'Drum Kit', desc: 'Quirky march percussion beat.' }
        ]
    };

    const dlcSoundPacks = [
        {
            id: 'dlc_chrono',
            name: 'Chrono Trigger: 1999 A.D. Pack',
            game: 'SNES Classic',
            price: 'FREE DLC',
            desc: 'Time portal ambient synths, 16-bit epoch drums, and futuristic Blade FX.',
            unlocked: true,
            items: [
                { id: 'chrono_portal', name: 'Time Portal', category: 'Sound FX', desc: 'Swirling pitch-bend time warp synth.' },
                { id: 'chrono_snare', name: 'Epoch Snare', category: 'Drum Kit', desc: 'Punchy SNES 16-bit acoustic snare.' },
                { id: 'chrono_bell', name: 'Zeal Kingdom Bell', category: 'Synth Lead', desc: 'Heavenly floating sky palace chime.' }
            ]
        },
        {
            id: 'dlc_megaman',
            name: 'Mega Man X: Maverick Arsenal',
            game: 'SNES Action',
            price: 'FREE DLC',
            desc: 'Charging buster blasts, metallic industrial drum loops, and dash sound FX.',
            unlocked: true,
            items: [
                { id: 'mm_charge', name: 'Buster Charge', category: 'Synth Lead', desc: 'Rising energy oscillation pulse.' },
                { id: 'mm_dash', name: 'X-Dash SFX', category: 'Sound FX', desc: 'High-speed directional air dash.' },
                { id: 'mm_kick', name: 'Maverick Kick', category: 'Drum Kit', desc: 'Heavy industrial boss stage bass drum.' }
            ]
        },
        {
            id: 'dlc_zelda',
            name: 'Zelda: Link to the Past Triforce Kit',
            game: 'Adventure RPG',
            price: 'FREE DLC',
            desc: 'Secret discovery jingles, fairy sparkles, and subterranean dungeon drums.',
            unlocked: true,
            items: [
                { id: 'zelda_secret', name: 'Secret Chime', category: 'Sound FX', desc: 'The iconic puzzle solved triumphant fanfare.' },
                { id: 'zelda_fairy', name: 'Fairy Sparkle', category: 'Synth Lead', desc: 'Magical twinkling high-frequency arpeggio.' },
                { id: 'zelda_drum', name: 'Dungeon Thud', category: 'Drum Kit', desc: 'Echoing deep crypt percussion hit.' }
            ]
        }
    ];

    // --- STATE MANAGEMENT ---
    const TOTAL_STEPS = 32, TL_BLOCKS = 16;
    let themesList = ['mario', 'pokemon', 'ff', 'dark'];
    let themeNames = { 'mario': 'Super Mario World', 'pokemon': 'Pokémon Red/Blue', 'ff': 'Final Fantasy III', 'dark': 'Classic Dark' };
    
    let state = {
        theme: localStorage.getItem('ghettochip_theme') || 'mario',
        bpm: 120, lpf: 3200, dist: 15,
        tracks: [
            { id: 'kick', name: 'KICK', color: '#e52521', vol: 0.8, pan: 0, stepsCount: 32 },
            { id: 'snare', name: 'SNARE', color: '#f5d000', vol: 0.7, pan: 0, stepsCount: 32 },
            { id: 'hat', name: 'HIHAT', color: '#43b02a', vol: 0.5, pan: 0, stepsCount: 32 },
            { id: 'glitch', name: 'GLITCH', color: '#0099ff', vol: 0.6, pan: 0, stepsCount: 32 },
            { id: 'bass', name: 'BASS', color: '#7b1fa2', vol: 0.8, pan: 0, stepsCount: 32 },
            { id: 'lead', name: 'LEAD', color: '#0097a7', vol: 0.6, pan: 0, stepsCount: 32 },
            { id: 'arp', name: 'ARP FX', color: '#e65100', vol: 0.6, pan: 0, stepsCount: 32 },
            { id: 'noise', name: 'NOISE', color: '#5d4037', vol: 0.5, pan: 0, stepsCount: 32 }
        ],
        patterns: Array(4).fill(0).map(() => {
            let p = {}; ['kick','snare','hat','glitch','bass','lead','arp','noise'].forEach(t => p[t] = Array(TOTAL_STEPS).fill(false)); return p;
        }),
        patternMutes: Array(4).fill(0).map(() => ({})),
        patternMidiNotes: Array(4).fill(0).map(() => ({})),
        glitchPatterns: Array(4).fill(0).map(() => ({
            tapestop: Array(TOTAL_STEPS).fill(false),
            retrigger: Array(TOTAL_STEPS).fill(false),
            reverser: Array(TOTAL_STEPS).fill(false),
            crusher: Array(TOTAL_STEPS).fill(false),
            gater: Array(TOTAL_STEPS).fill(false)
        })),
        songTimeline: Array(4).fill(0).map(() => Array(TL_BLOCKS).fill(false))
    };

    // Apply theme
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeButtonText();

    let currentPattern = 0, isPlaying = false, isSongMode = false, isRecording = false;
    let currentStep = 0, currentBlock = 0, nextNoteTime = 0.0, timerId = null;
    let customAudioBuffers = {};
    let activeNoteSeqTech = 'lead';

    // Default beat setup
    for(let i=0; i<TOTAL_STEPS; i++) {
        if(i%8===0) state.patterns[0].kick[i] = true;
        if(i%8===4) state.patterns[0].snare[i] = true;
        if(i%2===0) state.patterns[0].hat[i] = true;
    }
    state.songTimeline[0][0] = true;

    // --- AUDIO ENGINE ---
    class AudioEngine {
        constructor() {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.streamDest = this.ctx.createMediaStreamDestination();
            
            this.lowPass = this.ctx.createBiquadFilter(); this.lowPass.type = 'lowpass';
            this.distortion = this.ctx.createWaveShaper();
            
            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 64;

            this.masterGain = this.ctx.createGain(); this.masterGain.gain.value = 0.8;
            
            this.distortion.connect(this.lowPass);
            this.lowPass.connect(this.masterGain);
            this.masterGain.connect(this.analyser);
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.connect(this.streamDest);

            this.channels = {};
            state.tracks.forEach(t => this.initChannelNode(t.id));
            this.updateFX();
        }

        initChannelNode(id) {
            let tObj = state.tracks.find(x => x.id === id);
            let gain = this.ctx.createGain(), pan = this.ctx.createStereoPanner();
            gain.gain.value = tObj ? tObj.vol : 0.7; pan.pan.value = tObj ? tObj.pan : 0;
            pan.connect(gain); gain.connect(this.distortion);
            this.channels[id] = { gain, pan };
        }

        updateFX() {
            this.lowPass.frequency.value = state.lpf;
            let k = state.dist, n = 44100, curve = new Float32Array(n), deg = Math.PI / 180;
            for (let i=0; i<n; ++i) { let x = i*2/n - 1; curve[i] = (3+k)*x*20*deg/(Math.PI+k*Math.abs(x)); }
            this.distortion.curve = curve;
        }
        updateMix(id, type, val) {
            if(!this.channels[id]) this.initChannelNode(id);
            if(type === 'vol') this.channels[id].gain.gain.value = val;
            if(type === 'pan') this.channels[id].pan.pan.value = val;
        }

        trigger(sound, time, pitchMod = 1) {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const t = time || this.ctx.currentTime;
            if(!this.channels[sound]) this.initChannelNode(sound);
            const dest = this.channels[sound].pan; 
            
            if (customAudioBuffers[sound]) {
                let src = this.ctx.createBufferSource();
                src.buffer = customAudioBuffers[sound];
                src.playbackRate.value = pitchMod;
                src.connect(dest);
                src.start(t);
                return;
            }

            // Synthesized sounds including Library Sound Kits & DLC Packs
            switch(sound) {
                case 'mario_coin': {
                    let o1 = this.ctx.createOscillator(), o2 = this.ctx.createOscillator(), g = this.ctx.createGain();
                    o1.type = 'square'; o2.type = 'square';
                    o1.frequency.setValueAtTime(987.77 * pitchMod, t); o1.frequency.setValueAtTime(1318.51 * pitchMod, t + 0.08);
                    o2.frequency.setValueAtTime(987.77 * pitchMod, t); o2.frequency.setValueAtTime(1318.51 * pitchMod, t + 0.08);
                    g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                    o1.connect(g); o2.connect(g); g.connect(dest);
                    o1.start(t); o2.start(t); o1.stop(t + 0.3); o2.stop(t + 0.3); break;
                }
                case 'mario_jump': {
                    let o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'square';
                    o.frequency.setValueAtTime(150 * pitchMod, t);
                    o.frequency.exponentialRampToValueAtTime(600 * pitchMod, t + 0.15);
                    g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.15); break;
                }
                case 'mario_powerup': {
                    let notes = [330, 392, 659, 523, 587, 784];
                    notes.forEach((f, idx) => {
                        let o = this.ctx.createOscillator(), g = this.ctx.createGain();
                        o.type = 'square'; o.frequency.value = f * pitchMod;
                        g.gain.setValueAtTime(0.2, t + idx * 0.04);
                        g.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.04 + 0.05);
                        o.connect(g); g.connect(dest);
                        o.start(t + idx * 0.04); o.stop(t + idx * 0.04 + 0.05);
                    });
                    break;
                }
                case 'poke_select': {
                    let o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'square';
                    o.frequency.setValueAtTime(1760 * pitchMod, t);
                    g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
                    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.06); break;
                }
                case 'poke_heal': {
                    let notes = [523, 659, 784, 1046];
                    notes.forEach((f, idx) => {
                        let o = this.ctx.createOscillator(), g = this.ctx.createGain();
                        o.type = 'triangle'; o.frequency.value = f * pitchMod;
                        g.gain.setValueAtTime(0.3, t + idx * 0.07);
                        g.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.07 + 0.1);
                        o.connect(g); g.connect(dest);
                        o.start(t + idx * 0.07); o.stop(t + idx * 0.07 + 0.1);
                    });
                    break;
                }
                case 'poke_bike':
                case 'noise': {
                    let b = this.ctx.createBuffer(1, this.ctx.sampleRate*0.15, this.ctx.sampleRate), d = b.getChannelData(0);
                    for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
                    let n = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
                    n.buffer = b; f.type = 'bandpass'; f.frequency.value = 1200;
                    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                    n.connect(f); f.connect(g); g.connect(dest); n.start(t); break;
                }
                case 'ff_cursor': {
                    let o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'sine';
                    o.frequency.setValueAtTime(880 * pitchMod, t); o.frequency.exponentialRampToValueAtTime(440 * pitchMod, t + 0.08);
                    g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
                    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.08); break;
                }
                case 'ff_magic':
                case 'arp': {
                    let o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'triangle';
                    o.frequency.setValueAtTime(523.25 * pitchMod, t); o.frequency.setValueAtTime(659.25 * pitchMod, t+0.05);
                    g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.01, t+0.15);
                    o.connect(g); g.connect(dest); o.start(t); o.stop(t+0.15); break;
                }
                case 'ff_bell': {
                    let o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'sine';
                    o.frequency.setValueAtTime(2093 * pitchMod, t);
                    g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
                    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.4); break;
                }
                case 'chrono_portal': {
                    let o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'sawtooth';
                    o.frequency.setValueAtTime(300 * pitchMod, t); o.frequency.exponentialRampToValueAtTime(900 * pitchMod, t + 0.25);
                    g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
                    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.25); break;
                }
                case 'mm_charge': {
                    let o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'square';
                    o.frequency.setValueAtTime(440 * pitchMod, t); o.frequency.linearRampToValueAtTime(880 * pitchMod, t + 0.2);
                    g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.2); break;
                }
                case 'zelda_secret': {
                    let notes = [523, 587, 659, 698, 784, 880, 988, 1046];
                    notes.forEach((f, idx) => {
                        let o = this.ctx.createOscillator(), g = this.ctx.createGain();
                        o.type = 'triangle'; o.frequency.value = f * pitchMod;
                        g.gain.setValueAtTime(0.2, t + idx * 0.04);
                        g.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.04 + 0.05);
                        o.connect(g); g.connect(dest);
                        o.start(t + idx * 0.04); o.stop(t + idx * 0.04 + 0.05);
                    });
                    break;
                }
                case 'kick':
                case 'mario_kick':
                case 'poke_kick':
                case 'ff_kick':
                case 'chrono_snare':
                case 'mm_kick':
                case 'zelda_drum': {
                    let osc = this.ctx.createOscillator(), gain = this.ctx.createGain(); osc.connect(gain); gain.connect(dest);
                    osc.frequency.setValueAtTime(140 * pitchMod, t); osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.25);
                    gain.gain.setValueAtTime(1, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
                    osc.start(t); osc.stop(t + 0.25); break;
                }
                case 'snare':
                case 'mario_snare':
                case 'poke_snare':
                case 'mm_dash':
                case 'zelda_fairy': {
                    let b = this.ctx.createBuffer(1, this.ctx.sampleRate*0.12, this.ctx.sampleRate), d = b.getChannelData(0);
                    for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
                    let n = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
                    n.buffer = b; f.type = 'highpass'; f.frequency.value = 1200;
                    g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
                    n.connect(f); f.connect(g); g.connect(dest); n.start(t); break;
                }
                case 'hat': {
                    let b = this.ctx.createBuffer(1, this.ctx.sampleRate*0.04, this.ctx.sampleRate), d = b.getChannelData(0);
                    for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
                    let n = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
                    n.buffer = b; f.type = 'highpass'; f.frequency.value = 7000;
                    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
                    n.connect(f); f.connect(g); g.connect(dest); n.start(t); break;
                }
                case 'glitch': {
                    let o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'square'; 
                    o.frequency.setValueAtTime((1200+Math.random()*800)*pitchMod, t); o.frequency.setValueAtTime(150, t+0.05);
                    g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.01, t+0.1);
                    o.connect(g); g.connect(dest); o.start(t); o.stop(t+0.1); break;
                }
                case 'bass': {
                    let o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = 55 * pitchMod;
                    g.gain.setValueAtTime(0.8, t); g.gain.exponentialRampToValueAtTime(0.01, t+0.3);
                    o.connect(g); g.connect(dest); o.start(t); o.stop(t+0.3); break;
                }
                case 'lead': {
                    let o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'square'; o.frequency.value = 440 * pitchMod;
                    g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.01, t+0.2);
                    o.connect(g); g.connect(dest); o.start(t); o.stop(t+0.2); break;
                }
            }
        }
    }

    let audio = null, mediaRecorder = null, recordedChunks = [];

    // --- LOW-RESOURCE VISUALIZER LOOP ---
    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);
        const canvas = document.getElementById('viz-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;

        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--btn-bg').trim() || '#ffffff';
        ctx.fillRect(0, 0, w, h);

        if (!audio || !audio.analyser || !isPlaying) {
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#64748b';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
            return;
        }

        const bufferLength = audio.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        audio.analyser.getByteFrequencyData(dataArray);

        const barWidth = (w / bufferLength) * 1.8;
        let x = 0;
        const barColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-cyan').trim() || '#0099ff';
        ctx.fillStyle = barColor;

        for (let i = 0; i < bufferLength; i++) {
            let barHeight = (dataArray[i] / 255) * h;
            ctx.fillRect(x, h - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
    requestAnimationFrame(drawVisualizer);

    // --- SOUND LIBRARY MODAL LOGIC ---
    const libraryModal = document.getElementById('library-modal');
    document.getElementById('btn-open-library').onclick = () => { renderLibraryKit('mario'); libraryModal.classList.add('open'); };
    document.getElementById('btn-close-library').onclick = () => libraryModal.classList.remove('open');

    document.querySelectorAll('.lib-tab').forEach(tab => {
        tab.onclick = (e) => {
            document.querySelectorAll('.lib-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderLibraryKit(e.target.dataset.kit);
        };
    });

    function renderLibraryKit(kitKey) {
        const grid = document.getElementById('lib-grid');
        grid.innerHTML = '';
        let items = soundLibraryKits[kitKey] || [];
        
        items.forEach(item => {
            let card = document.createElement('div'); card.className = 'lib-card';
            card.innerHTML = `
                <div class="lib-card-header">
                    <span>${item.name}</span>
                    <span class="lib-badge">${item.category}</span>
                </div>
                <div class="lib-desc">${item.desc}</div>
                <div class="lib-actions">
                    <button class="btn preview-btn" style="flex:1; font-size:9px; padding:3px;" data-id="${item.id}">PREVIEW</button>
                    <button class="btn add-lib-btn" style="flex:1; font-size:9px; padding:3px; background:var(--accent-cyan); color:white; border-color:white;" data-id="${item.id}" data-name="${item.name}">+ ADD TO CHANNEL</button>
                </div>
            `;
            
            card.querySelector('.preview-btn').onclick = () => {
                if(!audio) audio = new AudioEngine();
                audio.trigger(item.id);
            };

            card.querySelector('.add-lib-btn').onclick = () => {
                let customId = item.id + '_' + Date.now();
                let randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                
                state.tracks.push({
                    id: customId,
                    name: item.name.substring(0, 8).toUpperCase(),
                    color: randomColor,
                    vol: 0.8,
                    pan: 0,
                    stepsCount: 32
                });

                state.patterns.forEach(pat => {
                    pat[customId] = Array(32).fill(false);
                    pat[customId][0] = true;
                });

                if(!audio) audio = new AudioEngine();
                audio.initChannelNode(customId);
                customAudioBuffers[customId] = null;
                
                renderRack();
                libraryModal.classList.remove('open');
                alert(`Added "${item.name}" as a new channel to your rack!`);
            };

            grid.appendChild(card);
        });
    }

    // --- DLC SOUND PACKS MARKETPLACE LOGIC ---
    const dlcModal = document.getElementById('dlc-modal');
    document.getElementById('btn-open-dlc').onclick = () => { renderDlcMarketplace(); dlcModal.classList.add('open'); };
    document.getElementById('btn-close-dlc').onclick = () => dlcModal.classList.remove('open');

    function renderDlcMarketplace() {
        const grid = document.getElementById('dlc-grid');
        grid.innerHTML = '';
        
        dlcSoundPacks.forEach(pack => {
            let card = document.createElement('div');
            card.className = `lib-card ${pack.unlocked ? '' : 'locked'}`;
            
            let itemsHtml = pack.items.map(it => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.03); padding:4px; border-radius:3px; margin-top:3px;">
                    <div>
                        <div style="font-weight:bold; font-size:9px;">${it.name} <span class="lib-badge">${it.category}</span></div>
                        <div style="font-size:8px; color:var(--text-muted);">${it.desc}</div>
                    </div>
                    <div style="display:flex; gap:2px;">
                        <button class="btn" style="font-size:7px; padding:2px 5px;" onclick="previewDlcItem('${it.id}')">TEST</button>
                        ${pack.unlocked ? `<button class="btn" style="font-size:7px; padding:2px 5px; background:var(--accent-cyan); color:white;" onclick="addDlcItemToChannel('${it.id}', '${it.name}')">+ ADD</button>` : ''}
                    </div>
                </div>
            `).join('');

            card.innerHTML = `
                <div class="lib-card-header">
                    <span>${pack.name}</span>
                    <span class="lib-badge" style="background:var(--accent-pink); color:white;">${pack.price}</span>
                </div>
                <div class="lib-desc">Console: <b>${pack.game}</b> — ${pack.desc}</div>
                <div style="margin-top:4px;">${itemsHtml}</div>
                ${!pack.unlocked ? `<button class="btn" style="margin-top:6px; background:var(--accent-pink); color:white; font-size:9px; width:100%; justify-content:center;" onclick="unlockDlcPack('${pack.id}')">UNLOCK & INSTALL DLC PACK</button>` : '<div style="margin-top:6px; font-size:8px; color:var(--accent-green); font-weight:bold; text-align:center;">✓ INSTALLED & UNLOCKED</div>'}
            `;
            grid.appendChild(card);
        });
    }

    window.previewDlcItem = (id) => {
        if(!audio) audio = new AudioEngine();
        audio.trigger(id);
    };

    window.addDlcItemToChannel = (id, name) => {
        let customId = id + '_' + Date.now();
        let randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        
        state.tracks.push({
            id: customId,
            name: name.substring(0, 8).toUpperCase(),
            color: randomColor,
            vol: 0.8,
            pan: 0,
            stepsCount: 32
        });

        state.patterns.forEach(pat => {
            pat[customId] = Array(32).fill(false);
            pat[customId][0] = true;
        });

        if(!audio) audio = new AudioEngine();
        audio.initChannelNode(customId);
        customAudioBuffers[customId] = null;
        
        renderRack();
        dlcModal.classList.remove('open');
        alert(`Successfully added DLC sound "${name}" to your rack channels!`);
    };

    window.unlockDlcPack = (packId) => {
        let p = dlcSoundPacks.find(x => x.id === packId);
        if(p) {
            p.unlocked = true;
            renderDlcMarketplace();
            alert(`Congratulations! "${p.name}" has been unlocked and added to your sound library.`);
        }
    };

    // --- UI RENDERING & INDICATORS ---
    function initIndicatorDots(containerId) {
        const dotsContainer = document.getElementById(containerId);
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < TOTAL_STEPS; i++) {
            if (i > 0 && i % 16 === 0) {
                let div = document.createElement('div'); div.className = 'ind-divider';
                dotsContainer.appendChild(div);
            }
            let dot = document.createElement('div'); dot.className = 'ind-dot'; dot.dataset.step = i;
            dotsContainer.appendChild(dot);
        }
    }

    function renderTimeline() {
        const c = document.getElementById('timeline-container');
        c.innerHTML = '';

        let ruler = document.createElement('div'); ruler.className = 'tl-ruler';
        let rulerLabel = document.createElement('div'); rulerLabel.className = 'tl-ruler-label'; rulerLabel.innerText = 'SCRUB TIMELINE';
        let rulerBlocks = document.createElement('div'); rulerBlocks.className = 'tl-ruler-blocks';
        
        for(let b=0; b<TL_BLOCKS; b++) {
            let num = document.createElement('div'); num.className = 'tl-ruler-num';
            if(currentBlock === b && isSongMode) num.classList.add('active');
            num.innerText = String(b+1).padStart(2, '0');
            num.onclick = () => {
                currentBlock = b; currentStep = 0;
                if(audio) nextNoteTime = audio.ctx.currentTime + 0.05;
                renderTimeline(); updatePlayheads(currentStep, currentBlock);
            };
            rulerBlocks.appendChild(num);
        }
        ruler.append(rulerLabel, rulerBlocks); c.appendChild(ruler);

        let totalPatterns = state.songTimeline.length;
        let trackColors = ['#e52521','#43b02a','#0099ff','#7b1fa2','#f5d000','#e65100','#0097a7','#ec4899'];

        for(let p=0; p<totalPatterns; p++) {
            let row = document.createElement('div'); row.className = 'tl-row';
            let color = trackColors[p % trackColors.length];
            row.innerHTML = `<div class="tl-label" style="color:${color}">PAT ${p+1}</div>`;
            let blocks = document.createElement('div'); blocks.className = 'tl-blocks';
            for(let b=0; b<TL_BLOCKS; b++) {
                let blk = document.createElement('div'); blk.className = 'tl-block';
                if(state.songTimeline[p][b]) blk.classList.add('active');
                blk.onclick = () => {
                    state.songTimeline[p][b] = !state.songTimeline[p][b];
                    blk.classList.toggle('active', state.songTimeline[p][b]);
                };
                blocks.appendChild(blk);
            }
            row.appendChild(blocks); c.appendChild(row);
        }

        // Add Pattern button precisely beneath Pattern 4 (or the last pattern row)
        let addRow = document.createElement('div');
        addRow.className = 'add-pattern-row';
        addRow.innerHTML = `
            <div style="width: 65px;"></div>
            <button class="add-pattern-btn" id="btn-add-pattern">
                <svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> ADD PAT
            </button>
            <div style="font-size: 8px; color: var(--text-muted);">Create new song arrangement pattern row</div>
        `;
        c.appendChild(addRow);

        document.getElementById('btn-add-pattern').onclick = () => {
            let newPatIdx = state.songTimeline.length;
            let emptyPat = {};
            state.tracks.forEach(t => emptyPat[t.id] = Array(TOTAL_STEPS).fill(false));
            
            state.patterns.push(emptyPat);
            state.patternMutes.push({});
            state.patternMidiNotes.push({});
            state.glitchPatterns.push({
                tapestop: Array(TOTAL_STEPS).fill(false),
                retrigger: Array(TOTAL_STEPS).fill(false),
                reverser: Array(TOTAL_STEPS).fill(false),
                crusher: Array(TOTAL_STEPS).fill(false),
                gater: Array(TOTAL_STEPS).fill(false)
            });
            state.songTimeline.push(Array(TL_BLOCKS).fill(false));

            updatePatternDropdown();
            renderTimeline();
            alert(`Pattern ${newPatIdx + 1} added successfully!`);
        };
    }

    function updatePatternDropdown() {
        let sel = document.getElementById('sel-pattern');
        sel.innerHTML = '';
        state.patterns.forEach((_, idx) => {
            let opt = document.createElement('option');
            opt.value = idx;
            opt.innerText = `Pattern ${idx + 1}`;
            if(idx === currentPattern) opt.selected = true;
            sel.appendChild(opt);
        });
    }

    function renderRack() {
        const c = document.getElementById('tracks-list'); c.innerHTML = '';
        state.tracks.forEach(track => {
            let row = document.createElement('div'); row.className = 'track-row';
            
            let info = document.createElement('div'); info.className = 'track-info';
            info.style.borderLeftColor = track.color; 

            let isMuted = !!(state.patternMutes[currentPattern] && state.patternMutes[currentPattern][track.id]);

            info.innerHTML = `
                <div class="track-name-clickable" title="Click to open Piano Roll">${track.name}</div>
                <div class="track-controls-inline">
                    <button class="track-btn-sm ${isMuted ? 'muted' : ''}" data-mute-id="${track.id}" title="Toggle Mute">${isMuted ? 'MUTED' : 'MUTE'}</button>
                    <button class="track-btn-sm note-seq-btn" data-notes-id="${track.id}" title="Open Note Sequencer">NOTE</button>
                </div>
            `;
            
            info.querySelector('[data-mute-id]').onclick = (e) => {
                e.stopPropagation();
                if(!state.patternMutes[currentPattern]) state.patternMutes[currentPattern] = {};
                state.patternMutes[currentPattern][track.id] = !state.patternMutes[currentPattern][track.id];
                renderRack();
            };

            info.querySelector('[data-notes-id]').onclick = (e) => {
                e.stopPropagation();
                activeNoteSeqTech = track.id;
                openNoteSequencerModal(track);
            };

            info.querySelector('.track-name-clickable').onclick = () => {
                activeNoteSeqTech = track.id;
                openNoteSequencerModal(track);
            };
            
            let mix = document.createElement('div'); mix.className = 'track-mix';
            mix.innerHTML = `<div class="mix-ctrl">V <input type="range" min="0" max="1" step="0.05" value="${track.vol}" data-id="${track.id}" data-type="vol"></div>
                             <div class="mix-ctrl">P <input type="range" min="-1" max="1" step="0.1" value="${track.pan}" data-id="${track.id}" data-type="pan"></div>`;
            mix.querySelectorAll('input').forEach(inp => {
                inp.oninput = (e) => {
                    let v = parseFloat(e.target.value), id = e.target.dataset.id, type = e.target.dataset.type;
                    state.tracks.find(x => x.id === id)[type] = v;
                    if(audio) audio.updateMix(id, type, v);
                };
            });

            let steps = document.createElement('div'); steps.className = 'step-container';
            let numSteps = track.stepsCount || TOTAL_STEPS;
            
            if(!state.patterns[currentPattern][track.id]) {
                state.patterns[currentPattern][track.id] = Array(numSteps).fill(false);
            }

            for (let i = 0; i < numSteps; i++) {
                if (i > 0 && i % 16 === 0) steps.appendChild(document.createElement('div')).className = 'bar-divider';
                let btn = document.createElement('div');
                btn.className = `step-btn ${(Math.floor(i/4)%2===0) ? 'group-a' : 'group-b'}`;
                btn.dataset.track = track.id;
                btn.dataset.step = i;
                if (state.patterns[currentPattern][track.id][i]) btn.classList.add('active');
                
                btn.onclick = () => {
                    state.patterns[currentPattern][track.id][i] = !state.patterns[currentPattern][track.id][i];
                    btn.classList.toggle('active', state.patterns[currentPattern][track.id][i]);
                    if(state.patterns[currentPattern][track.id][i] && audio && !isMuted) {
                        let triggerKey = customAudioBuffers[track.id] !== undefined ? track.id : track.id;
                        audio.trigger(triggerKey);
                    }
                };
                steps.appendChild(btn);
            }
            row.append(info, mix, steps); c.appendChild(row);
        });
        initIndicatorDots('pat-indicator-dots');
    }

    // --- NOTE SEQUENCER MODAL ---
    const noteSeqModal = document.getElementById('note-seq-modal');
    const pianoRollGrid = document.getElementById('piano-roll-grid');
    const noteNames = ['B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 'E5', 'D#5', 'D5', 'C#5', 'C5'];
    
    function openNoteSequencerModal(track) {
        document.getElementById('modal-track-name').innerText = track.name;
        document.getElementById('note-seq-pat-label').innerText = currentPattern + 1;
        renderPianoRollGrid(track.id);
        initIndicatorDots('note-seq-indicator-dots');
        noteSeqModal.classList.add('open');
    }

    function renderPianoRollGrid(trackId) {
        pianoRollGrid.innerHTML = '';
        if(!state.patternMidiNotes[currentPattern]) state.patternMidiNotes[currentPattern] = {};
        if(!state.patternMidiNotes[currentPattern][trackId]) {
            state.patternMidiNotes[currentPattern][trackId] = Array(12).fill(0).map(() => Array(TOTAL_STEPS).fill(false));
        }
        let gridData = state.patternMidiNotes[currentPattern][trackId];

        noteNames.forEach((nName, pIdx) => {
            let row = document.createElement('div'); row.className = 'pr-row';
            row.innerHTML = `<div class="pr-label">${nName}</div>`;
            let stepsDiv = document.createElement('div'); stepsDiv.className = 'pr-steps';
            
            for(let s=0; s<TOTAL_STEPS; s++) {
                if (s > 0 && s % 16 === 0) stepsDiv.appendChild(document.createElement('div')).className = 'bar-divider';
                let btn = document.createElement('div'); btn.className = 'pr-step-btn';
                if(gridData[pIdx][s]) btn.classList.add('active');

                btn.onclick = () => {
                    gridData[pIdx][s] = !gridData[pIdx][s];
                    btn.classList.toggle('active', gridData[pIdx][s]);
                    if(gridData[pIdx][s]) {
                        state.patterns[currentPattern][trackId][s] = true;
                        if(audio) {
                            let pitchMult = Math.pow(2, (6 - pIdx) / 12);
                            audio.trigger(trackId, null, pitchMult);
                        }
                    }
                    renderRack();
                };
                stepsDiv.appendChild(btn);
            }
            row.appendChild(stepsDiv);
            pianoRollGrid.appendChild(row);
        });
    }

    document.getElementById('btn-close-note-seq').onclick = () => noteSeqModal.classList.remove('open');

    // --- GLITCH SEQUENCER MODAL ---
    const glitchModal = document.getElementById('glitch-modal');
    document.getElementById('btn-open-glitch').onclick = () => { renderGlitchModal(); glitchModal.classList.add('open'); };
    document.getElementById('btn-close-glitch').onclick = () => glitchModal.classList.remove('open');

    function renderGlitchModal() {
        const c = document.getElementById('glitch-grid'); c.innerHTML = '';
        document.getElementById('glitch-pat-label').innerText = currentPattern + 1;
        const fxKeys = [
            { key: 'tapestop', label: 'TAPE STOP' },
            { key: 'retrigger', label: 'RETRIG' },
            { key: 'reverser', label: 'REVERSE' },
            { key: 'crusher', label: 'CRUSHER' },
            { key: 'gater', label: 'GATE' }
        ];

        fxKeys.forEach(fx => {
            let row = document.createElement('div'); row.className = 'glitch-row';
            row.innerHTML = `<div class="glitch-label">${fx.label}</div>`;
            let stepsDiv = document.createElement('div'); stepsDiv.className = 'glitch-steps';
            for(let i=0; i<TOTAL_STEPS; i++) {
                if (i > 0 && i % 16 === 0) stepsDiv.appendChild(document.createElement('div')).className = 'bar-divider';
                let btn = document.createElement('div'); btn.className = 'glitch-step-btn';
                if(state.glitchPatterns[currentPattern][fx.key][i]) btn.classList.add('active');
                
                btn.onclick = () => {
                    state.glitchPatterns[currentPattern][fx.key][i] = !state.glitchPatterns[currentPattern][fx.key][i];
                    btn.classList.toggle('active', state.glitchPatterns[currentPattern][fx.key][i]);
                };
                stepsDiv.appendChild(btn);
            }
            row.appendChild(stepsDiv);
            c.appendChild(row);
        });
        initIndicatorDots('glitch-indicator-dots');
    }

    // --- SCHEDULER & PLAYHEAD UPDATER ---
    function scheduler() {
        while (nextNoteTime < audio.ctx.currentTime + 0.1) {
            scheduleStep(currentStep, currentBlock, nextNoteTime);
            advanceNote();
        }
        timerId = setTimeout(scheduler, 25);
    }

    function advanceNote() {
        const spb = 60.0 / state.bpm;
        nextNoteTime += 0.25 * spb; 
        currentStep++;
        if (currentStep >= TOTAL_STEPS) {
            currentStep = 0;
            if (isSongMode) {
                currentBlock++;
                if (currentBlock >= TL_BLOCKS) {
                    if (isRecording) stopRecording();
                    currentBlock = 0;
                }
            }
        }
    }

    function scheduleStep(step, block, time) {
        let activePat = currentPattern;
        if (isSongMode) {
            for(let p=0; p<state.songTimeline.length; p++) {
                if (state.songTimeline[p] && state.songTimeline[p][block]) activePat = p;
            }
        }

        let gfx = state.glitchPatterns[activePat] || state.glitchPatterns[0];
        let isRetrig = gfx && gfx.retrigger[step];
        let isTape = gfx && gfx.tapestop[step];
        let isRev = gfx && gfx.reverser[step];
        let isCrush = gfx && gfx.crusher[step];
        let isGate = gfx && gfx.gater[step];

        if(!isGate) {
            state.tracks.forEach(t => { 
                let isTrackMuted = state.patternMutes[activePat] && state.patternMutes[activePat][t.id];
                if(isTrackMuted) return;

                let patArr = state.patterns[activePat] ? state.patterns[activePat][t.id] : null;
                let trackStep = step % (patArr ? patArr.length : TOTAL_STEPS);
                
                let midiNotesObj = state.patternMidiNotes[activePat] && state.patternMidiNotes[activePat][t.id];
                let playedFromPianoRoll = false;

                if (midiNotesObj) {
                    for(let pIdx=0; pIdx<12; pIdx++) {
                        if (midiNotesObj[pIdx] && midiNotesObj[pIdx][trackStep]) {
                            let pitch = Math.pow(2, (6 - pIdx) / 12) * (isRev ? 0.5 : (isCrush ? 2.0 : 1.0));
                            audio.trigger(t.id, time, pitch);
                            playedFromPianoRoll = true;
                        }
                    }
                }

                if (!playedFromPianoRoll && patArr && patArr[trackStep]) {
                    let pitch = isRev ? 0.5 : (isCrush ? 2.0 : 1.0);
                    audio.trigger(t.id, time, pitch);
                    if(isRetrig) {
                        audio.trigger(t.id, time + ((60.0 / state.bpm) * 0.125), pitch);
                    }
                } 
            });
        }

        if(isTape) {
            audio.lowPass.frequency.setValueAtTime(200, time);
            audio.lowPass.frequency.exponentialRampToValueAtTime(3200, time + 0.2);
        }

        let ds = step, db = block, diff = (time - audio.ctx.currentTime) * 1000;
        setTimeout(() => updatePlayheads(ds, db), Math.max(0, diff));
    }

    function updatePlayheads(step, block) {
        document.getElementById('pat-pos').innerText = `STEP: ${String(step+1).padStart(2,'0')} / 32`;
        document.getElementById('song-pos').innerText = `POS: ${String(block+1).padStart(2,'0')}`;

        document.querySelectorAll('.tracks-area .step-btn').forEach(btn => {
            btn.classList.toggle('playhead', parseInt(btn.dataset.step) === step);
        });

        document.querySelectorAll('.indicator-dots').forEach(container => {
            container.querySelectorAll('.ind-dot').forEach(dot => {
                dot.classList.toggle('active', parseInt(dot.dataset.step) === step);
            });
        });

        if (isSongMode) {
            document.querySelectorAll('.tl-ruler-num').forEach((numEl, idx) => {
                numEl.classList.toggle('active', idx === block);
            });
        } else {
            document.querySelectorAll('.tl-ruler-num').forEach(numEl => numEl.classList.remove('active'));
        }
    }

    function togglePlay() {
        if (!audio) audio = new AudioEngine();
        isPlaying = !isPlaying;
        const btn = document.getElementById('btn-play');
        if (isPlaying) {
            currentStep = 0; 
            if(!isSongMode) currentBlock = 0;
            nextNoteTime = audio.ctx.currentTime + 0.05;
            scheduler();
            btn.classList.add('active'); 
            btn.innerHTML = '<svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M6 6h12v12H6z"/></svg> STOP';
        } else {
            clearTimeout(timerId); 
            btn.classList.remove('active'); 
            btn.innerHTML = '<svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg> PLAY';
            updatePlayheads(-1, -1); if(isRecording) stopRecording();
        }
    }

    // --- THEME ROTATION HANDLER ---
    function updateThemeButtonText() {
        const btn = document.getElementById('btn-theme-toggle');
        if(btn) btn.innerHTML = `<svg class="v-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19h4.28c1.01.62 2.22 1 3.37 1 4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg> ${themeNames[state.theme] || 'THEME'}`;
    }

    document.getElementById('btn-theme-toggle').onclick = () => {
        let idx = themesList.indexOf(state.theme);
        state.theme = themesList[(idx + 1) % themesList.length];
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('ghettochip_theme', state.theme);
        updateThemeButtonText();
    };

    // --- FILE & SAMPLE UPLOADS ---
    document.getElementById('btn-add-channel').onclick = () => document.getElementById('sample-upload').click();
    document.getElementById('sample-upload').onchange = e => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            if(!audio) audio = new AudioEngine();
            audio.ctx.decodeAudioData(ev.target.result, buffer => {
                let customId = 'custom_' + Date.now();
                let channelName = file.name.substring(0, 8).toUpperCase();
                let randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                
                customAudioBuffers[customId] = buffer;
                
                state.tracks.push({
                    id: customId,
                    name: channelName,
                    color: randomColor,
                    vol: 0.8,
                    pan: 0,
                    stepsCount: 32
                });

                state.patterns.forEach(pat => {
                    pat[customId] = Array(32).fill(false);
                    pat[customId][0] = true;
                });

                audio.initChannelNode(customId);
                renderRack();
                alert(`Custom sample "${channelName}" added successfully!`);
            }, err => alert("Error decoding audio file."));
        };
        reader.readAsArrayBuffer(file);
    };

    // --- RECORDING & EXPORT ---
    function startRecording() {
        if (!audio) audio = new AudioEngine();
        recordedChunks = []; mediaRecorder = new MediaRecorder(audio.streamDest.stream);
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            const a = document.createElement('a'); a.style.display = 'none'; 
            a.href = URL.createObjectURL(new Blob(recordedChunks, { type: 'audio/webm' })); 
            a.download = 'ghettochip_export.webm'; document.body.appendChild(a); a.click();
        };
        mediaRecorder.start(); isRecording = true; document.getElementById('btn-export').classList.add('active');
        if(!isPlaying) { isSongMode = true; document.querySelectorAll('.mode-toggle div')[1].click(); togglePlay(); }
    }
    function stopRecording() { if (mediaRecorder) mediaRecorder.stop(); isRecording = false; document.getElementById('btn-export').classList.remove('active'); }
    
    document.getElementById('btn-export').onclick = () => { isRecording ? stopRecording() : startRecording(); };
    document.getElementById('btn-play').onclick = togglePlay;

    document.querySelectorAll('.mode-toggle div').forEach(btn => {
        btn.onclick = (e) => { 
            document.querySelectorAll('.mode-toggle div').forEach(b => b.classList.remove('active')); 
            e.target.classList.add('active'); 
            isSongMode = e.target.dataset.mode === 'song'; 
            renderTimeline(); 
        }
    });

    const bindKnob = (id, prop, unit="", fxUpdate=false) => {
        document.getElementById('sl-'+id).oninput = e => {
            state[prop] = parseInt(e.target.value); document.getElementById('val-'+id).innerText = state[prop] + unit;
            if(fxUpdate && audio) audio.updateFX();
        };
    };
    bindKnob('bpm', 'bpm'); bindKnob('lpf', 'lpf', 'Hz', true); bindKnob('dist', 'dist', '%', true);
    
    document.getElementById('sel-pattern').onchange = e => { 
        currentPattern = parseInt(e.target.value); 
        renderRack(); 
        if(glitchModal.classList.contains('open')) renderGlitchModal();
    };

    document.getElementById('btn-save').onclick = () => {
        const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state)); a.download = "beat.gcp"; a.click();
    };
    document.getElementById('btn-load').onclick = () => document.getElementById('file-upload').click();
    document.getElementById('file-upload').onchange = e => {
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                state = JSON.parse(ev.target.result);
                document.documentElement.setAttribute('data-theme', state.theme || 'mario');
                updateThemeButtonText();
                document.getElementById('sl-bpm').value = state.bpm; document.getElementById('val-bpm').innerText = state.bpm;
                document.getElementById('sl-lpf').value = state.lpf; document.getElementById('val-lpf').innerText = state.lpf + 'Hz';
                document.getElementById('sl-dist').value = state.dist; document.getElementById('val-dist').innerText = state.dist + '%';
                updatePatternDropdown();
                if(audio) { audio.updateFX(); state.tracks.forEach(t => { audio.updateMix(t.id, 'vol', t.vol); audio.updateMix(t.id, 'pan', t.pan); }); }
                renderTimeline(); renderRack();
            } catch(err) { alert("Invalid Project File!"); }
        };
        reader.readAsText(e.target.files[0]);
    };

    updatePatternDropdown();
    renderTimeline(); 
    renderRack();
</script>
</body>
</html>

```

