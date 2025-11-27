const COLS = 10;
const ROWS = 6;

// --- BASE DE DATOS DE ÍTEMS ---
const ITEM_POOL = [
    // ARMAS GRANDES
    { name: "Chicago Typewriter", w: 7, h: 3, color: "#17202a", type: "weapon" },
    { name: "Lanzacohetes", w: 8, h: 2, color: "#212f3c", type: "weapon" },
    { name: "Rifle Semi-Auto", w: 9, h: 2, color: "#566573", type: "weapon" },
    { name: "Escopeta", w: 8, h: 2, color: "#7b241c", type: "weapon" },
    { name: "Striker", w: 5, h: 2, color: "#6e2c00", type: "weapon" },
    { name: "TMP", w: 3, h: 2, color: "#2e4053", type: "weapon" },

    // PISTOLAS & ARMAS MEDIANAS
    { name: "Red9", w: 4, h: 2, color: "#922b21", type: "pistol" },
    { name: "Cañón de Mano", w: 4, h: 2, color: "#7f8c8d", type: "pistol" },
    { name: "Blacktail", w: 3, h: 2, color: "#283747", type: "pistol" },
    { name: "Pistola", w: 3, h: 2, color: "#34495e", type: "pistol" },

    // OBJETOS CURATIVOS
    { name: "Spray", w: 1, h: 2, color: "#ecf0f1", textColor: "#333", type: "heal" },
    { name: "Hierba M.", w: 1, h: 1, color: "#f1c40f", textColor: "#7d6608", type: "heal" }, // Mixed
    { name: "Hierba R.", w: 1, h: 1, color: "#a93226", type: "heal" },
    { name: "Hierba V.", w: 1, h: 1, color: "#229954", type: "heal" },
    { name: "Huevo", w: 1, h: 1, color: "#f9e79f", textColor: "#7d6608", type: "heal" },
    { name: "Perca", w: 3, h: 1, color: "#85929e", type: "heal" }, // Black Bass

    // MUNICIÓN Y GRANADAS
    { name: "Granada Frag", w: 1, h: 2, color: "#1e8449", type: "ammo" },
    { name: "Granada Inc.", w: 1, h: 2, color: "#c0392b", type: "ammo" },
    { name: "Granada Ceg.", w: 1, h: 2, color: "#2980b9", type: "ammo" },
    { name: "Munición", w: 2, h: 1, color: "#d35400", type: "ammo" },
    { name: "Munición Esc.", w: 2, h: 1, color: "#145a32", type: "ammo" }
];

let items = [];
let selectedItemId = null;
let idCounter = 1;

let drag = {
    active: false,
    hasMoved: false,
    item: null,
    element: null,
    offsetX: 0,
    offsetY: 0
};

const inventoryEl = document.getElementById('inventory');
const gridBgEl = document.getElementById('grid-bg');
const nameDisplay = document.getElementById('selected-name');

function init() {
    createGridBackground();
    generateNewLoot();

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onMouseMove, { passive: false });
    document.addEventListener('touchend', onMouseUp);

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r') rotateSelectedItem();
        if (e.key.toLowerCase() === 's') autoSort();
    });

    window.addEventListener('resize', () => {
        renderItems();
    });
}

// Helper para convertir HEX a RGBA con transparencia personalizada
function hexToRgba(hex, alpha) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    }
    return hex; // Fallback
}

// --- SISTEMA DE GENERACIÓN DE LOOT ---

function generateNewLoot() {
    items = [];
    selectedItemId = null;
    nameDisplay.innerText = "---";
    idCounter = 1;

    const bigWeapons = ITEM_POOL.filter(i => i.type === 'weapon');
    const randBig = bigWeapons[Math.floor(Math.random() * bigWeapons.length)];
    addItemToLoot(randBig);

    const maxArea = COLS * ROWS;
    let currentArea = randBig.w * randBig.h;
    let attempts = 0;

    const targetFill = 0.4 + (Math.random() * 0.3);

    while (currentArea / maxArea < targetFill && attempts < 100) {
        const randItem = ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)];

        const currentBigs = items.filter(i => ITEM_POOL.find(p => p.name === i.name).type === 'weapon').length;
        if (randItem.type === 'weapon' && currentBigs >= 2) {
            attempts++;
            continue;
        }

        addItemToLoot(randItem);
        currentArea += (randItem.w * randItem.h);
        attempts++;
    }

    scrambleItems();
}

function addItemToLoot(poolItem) {
    items.push({
        id: idCounter++,
        name: poolItem.name,
        w: poolItem.w,
        h: poolItem.h,
        color: poolItem.color,
        textColor: poolItem.textColor || null,
        x: -100,
        y: -100,
        rotated: false
    });
}

// --- FUNCIONES CORE ---

function getCellSize() {
    const sampleCell = gridBgEl.children[0];
    return sampleCell ? sampleCell.getBoundingClientRect().width : 50;
}

function getGapSize() { return 2; }

function createGridBackground() {
    gridBgEl.innerHTML = '';
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            gridBgEl.appendChild(cell);
        }
    }
}

function renderItems() {
    const oldItems = document.querySelectorAll('.item');
    oldItems.forEach(el => el.remove());

    items.forEach(item => {
        const el = document.createElement('div');
        el.classList.add('item');
        el.dataset.id = item.id;
        el.innerText = item.name;

        // Aplicamos el color con transparencia (0.65 de opacidad para que se vea la cuadrícula detrás)
        el.style.backgroundColor = hexToRgba(item.color, 0.65);

        if (item.textColor) el.style.color = item.textColor;
        else el.style.color = 'rgba(236, 240, 241, 0.95)'; // Texto casi opaco

        const effectiveW = item.rotated ? item.h : item.w;
        const effectiveH = item.rotated ? item.w : item.h;

        el.style.left = `calc(${item.x} * (var(--cell-size) + var(--gap)))`;
        el.style.top = `calc(${item.y} * (var(--cell-size) + var(--gap)))`;
        el.style.width = `calc(${effectiveW} * var(--cell-size) + (${effectiveW} - 1) * var(--gap))`;
        el.style.height = `calc(${effectiveH} * var(--cell-size) + (${effectiveH} - 1) * var(--gap))`;

        el.addEventListener('mousedown', (e) => onMouseDown(e, item, el));
        el.addEventListener('touchstart', (e) => onMouseDown(e, item, el), { passive: false });

        if (item.id === selectedItemId) el.classList.add('selected');

        inventoryEl.appendChild(el);
    });
}

// --- DRAG SYSTEM ---

function onMouseDown(e, item, element) {
    if (e.type === 'mousedown') e.preventDefault();
    selectItem(item.id);

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    const rect = element.getBoundingClientRect();

    drag.active = true;
    drag.hasMoved = false;
    drag.item = item;
    drag.element = element;

    drag.offsetX = clientX - rect.left;
    drag.offsetY = clientY - rect.top;
}

function onMouseMove(e) {
    if (!drag.active) return;
    e.preventDefault();

    if (!drag.hasMoved) {
        drag.hasMoved = true;
        drag.element.classList.add('dragging');
    }

    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    const containerRect = inventoryEl.getBoundingClientRect();
    const x = clientX - containerRect.left - drag.offsetX;
    const y = clientY - containerRect.top - drag.offsetY;

    drag.element.style.left = `${x}px`;
    drag.element.style.top = `${y}px`;

    const cellSize = getCellSize();
    const gap = getGapSize();
    const unit = cellSize + gap;

    const gridX = Math.round(x / unit);
    const gridY = Math.round(y / unit);

    const w = drag.item.rotated ? drag.item.h : drag.item.w;
    const h = drag.item.rotated ? drag.item.w : drag.item.h;

    if (isValidPosition(drag.item, gridX, gridY, w, h)) {
        drag.element.classList.add('valid-pos');
        drag.element.classList.remove('invalid-pos');
    } else {
        drag.element.classList.add('invalid-pos');
        drag.element.classList.remove('valid-pos');
    }
}

function onMouseUp(e) {
    if (!drag.active) return;

    if (!drag.hasMoved) {
        drag.active = false;
        drag.item = null;
        drag.element = null;
        return;
    }

    drag.element.classList.remove('dragging', 'valid-pos', 'invalid-pos');

    const currentLeft = parseFloat(drag.element.style.left);
    const currentTop = parseFloat(drag.element.style.top);

    if (isNaN(currentLeft)) { renderItems(); drag.active = false; return; }

    const cellSize = getCellSize();
    const gap = getGapSize();
    const unit = cellSize + gap;

    const targetX = Math.round(currentLeft / unit);
    const targetY = Math.round(currentTop / unit);

    const w = drag.item.rotated ? drag.item.h : drag.item.w;
    const h = drag.item.rotated ? drag.item.w : drag.item.h;

    if (isValidPosition(drag.item, targetX, targetY, w, h)) {
        drag.item.x = targetX;
        drag.item.y = targetY;
        renderItems();
    } else {
        triggerErrorAnimation(drag.item.id);
    }

    drag.active = false;
    drag.item = null;
    drag.element = null;
}

// --- LOGIC ---

function selectItem(id) {
    selectedItemId = id;
    const item = items.find(i => i.id === id);
    nameDisplay.innerText = item ? item.name : "---";

    document.querySelectorAll('.item').forEach(el => {
        if (parseInt(el.dataset.id) === id) el.classList.add('selected');
        else el.classList.remove('selected');
    });
}

function rotateSelectedItem() {
    if (!selectedItemId) return;
    const item = items.find(i => i.id === selectedItemId);

    const newW = item.rotated ? item.w : item.h;
    const newH = item.rotated ? item.h : item.w;

    if (isValidPosition(item, item.x, item.y, newW, newH)) {
        item.rotated = !item.rotated;
        renderItems();
    } else {
        triggerErrorAnimation(item.id);
    }
}

function isValidPosition(itemToCheck, x, y, w, h) {
    if (x < 0 || y < 0 || x + w > COLS || y + h > ROWS) return false;

    for (let other of items) {
        if (other.x < 0) continue;
        if (other.id === itemToCheck.id) continue;

        const otherW = other.rotated ? other.h : other.w;
        const otherH = other.rotated ? other.w : other.h;

        const aLeft = x;
        const aRight = x + w;
        const aTop = y;
        const aBottom = y + h;

        const bLeft = other.x;
        const bRight = other.x + otherW;
        const bTop = other.y;
        const bBottom = other.y + otherH;

        if (aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop) {
            return false;
        }
    }
    return true;
}

function triggerErrorAnimation(id) {
    renderItems();
    setTimeout(() => {
        const el = document.querySelector(`.item[data-id="${id}"]`);
        if (el) {
            el.classList.add('error');
            setTimeout(() => el.classList.remove('error'), 400);
        }
    }, 10);
}

// --- ALGORITMOS DE ORDENAMIENTO ---

function autoSort() {
    const activeItems = items.filter(i => i.x >= 0);

    activeItems.sort((a, b) => (b.w * b.h) - (a.w * a.h));
    let occupied = Array(ROWS).fill().map(() => Array(COLS).fill(false));

    for (let item of activeItems) {
        let placed = false;
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (placed) break;
                if (canPlaceInVirtualGrid(x, y, item.w, item.h, occupied)) {
                    item.x = x; item.y = y; item.rotated = false;
                    markVirtualGrid(x, y, item.w, item.h, occupied);
                    placed = true;
                }
                else if (canPlaceInVirtualGrid(x, y, item.h, item.w, occupied)) {
                    item.x = x; item.y = y; item.rotated = true;
                    markVirtualGrid(x, y, item.h, item.w, occupied);
                    placed = true;
                }
            }
            if (placed) break;
        }
    }
    renderItems();
}

function scrambleItems() {
    items.forEach(i => { i.x = -100; i.y = -100; });
    items.sort(() => Math.random() - 0.5);

    items.forEach(item => {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 50) {
            const tryRotated = Math.random() < 0.5;
            const w = tryRotated ? item.h : item.w;
            const h = tryRotated ? item.w : item.h;

            if (h > ROWS) { attempts++; continue; }

            const maxX = COLS - w;
            const maxY = ROWS - h;

            if (maxX < 0 || maxY < 0) { attempts++; continue; }

            const rX = Math.floor(Math.random() * (maxX + 1));
            const rY = Math.floor(Math.random() * (maxY + 1));

            const tempItem = { ...item, rotated: tryRotated };
            if (isValidPosition(tempItem, rX, rY, w, h)) {
                item.x = rX; item.y = rY; item.rotated = tryRotated;
                placed = true;
            }
            attempts++;
        }

        if (!placed) {
            const rotations = [false, true];
            for (let r of rotations) {
                if (placed) break;
                const w = r ? item.h : item.w;
                const h = r ? item.w : item.h;
                if (h > ROWS) continue;

                for (let y = 0; y < ROWS; y++) {
                    for (let x = 0; x < COLS; x++) {
                        const tempItem = { ...item, rotated: r };
                        if (isValidPosition(tempItem, x, y, w, h)) {
                            item.x = x; item.y = y; item.rotated = r;
                            placed = true;
                            break;
                        }
                    }
                    if (placed) break;
                }
            }
        }
    });
    renderItems();
}

function canPlaceInVirtualGrid(x, y, w, h, occupiedGrid) {
    if (x + w > COLS || y + h > ROWS) return false;
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            if (occupiedGrid[y + i][x + j]) return false;
        }
    }
    return true;
}

function markVirtualGrid(x, y, w, h, occupiedGrid) {
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            occupiedGrid[y + i][x + j] = true;
        }
    }
}

// ARRANQUE DEL JUEGO
init();
