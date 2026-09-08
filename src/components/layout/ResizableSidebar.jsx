import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'cardgame-sidebar-width';
const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 260;
const MAX_WIDTH = 520;

function readStoredWidth() {
    if (typeof window === 'undefined') {
        return DEFAULT_WIDTH;
    }

    const stored = Number.parseInt(window.localStorage.getItem(STORAGE_KEY) ?? '', 10);
    if (!Number.isFinite(stored)) {
        return DEFAULT_WIDTH;
    }

    return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, stored));
}

function ResizableSidebar({ main, sidebar, className = '' }) {
    const [width, setWidth] = useState(readStoredWidth);
    const dragging = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(DEFAULT_WIDTH);

    const clampWidth = useCallback((next) => {
        const maxAllowed = Math.min(MAX_WIDTH, Math.floor(window.innerWidth * 0.48));
        return Math.min(maxAllowed, Math.max(MIN_WIDTH, next));
    }, []);

    const onPointerDown = useCallback((event) => {
        dragging.current = true;
        startX.current = event.clientX;
        startWidth.current = width;
        event.currentTarget.setPointerCapture(event.pointerId);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [width]);

    const onPointerMove = useCallback((event) => {
        if (!dragging.current) {
            return;
        }

        const delta = startX.current - event.clientX;
        setWidth(clampWidth(startWidth.current + delta));
    }, [clampWidth]);

    const onPointerUp = useCallback((event) => {
        if (!dragging.current) {
            return;
        }

        dragging.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, String(width));
    }, [width]);

    useEffect(() => {
        const onResize = () => {
            setWidth((current) => clampWidth(current));
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [clampWidth]);

    return (
        <div
            className={`game-shell ${className}`}
            style={{ '--sidebar-width': `${width}px` }}
        >
            <div className="game-table-column">{main}</div>

            <div
                className="hidden shrink-0 touch-none md:block"
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize settings panel"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                <div className="group flex h-full w-2 cursor-col-resize items-stretch justify-center">
                    <div className="w-px bg-white/10 transition group-hover:bg-cyan-400/50 group-active:bg-cyan-400" />
                </div>
            </div>

            <aside className="game-rail" data-testid="settings-panel">
                {sidebar}
            </aside>
        </div>
    );
}

export default ResizableSidebar;
