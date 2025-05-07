// 定义吉他标准调弦的音符
const standardTuning = ['E', 'B', 'G', 'D', 'A', 'E'];

// 所有音符的数组（用于计算音程）
const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 初始化DOM元素
const fretboardEl = document.getElementById('fretboard');
const fretMarkersEl = document.querySelector('.fret-markers');
const randomNoteBtn = document.getElementById('randomNote');
const noteInfoEl = document.getElementById('noteInfo');

// 新增：调性切换
let scaleType = 'major'; // 'major' 或 'minor'
const scaleToggleBtn = document.createElement('button');
scaleToggleBtn.id = 'scaleToggle';
scaleToggleBtn.textContent = '切换为小调';
scaleToggleBtn.style.marginLeft = '10px';
document.querySelector('.controls').appendChild(scaleToggleBtn);

scaleToggleBtn.addEventListener('click', () => {
    scaleType = scaleType === 'major' ? 'minor' : 'major';
    scaleToggleBtn.textContent = scaleType === 'major' ? '切换为小调' : '切换为大调';
    clearAllMarkers();
    if (lastRootNote !== null) {
        markScaleNotes(lastRootNote);
    }
});

let lastRootNote = null;

// 创建指板
function createFretboard() {
    // 清空现有内容
    fretboardEl.innerHTML = '';
    fretMarkersEl.innerHTML = '';
    // 创建品位标记（去掉0品）
    for (let i = 0; i <= 15; i++) {
        const markerEl = document.createElement('div');
        markerEl.className = 'fret-marker';
        markerEl.textContent = i;
        fretMarkersEl.appendChild(markerEl);
    }
    // 创建弦和品位（去掉0品，顶部加空弦音名）
    for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
        const stringEl = document.createElement('div');
        stringEl.className = 'string';
        // 顶部空弦音名
        const openNoteEl = document.createElement('div');
        openNoteEl.className = 'open-string-note';
        openNoteEl.textContent = standardTuning[stringIndex];
        openNoteEl.style.display = 'flex';
        openNoteEl.style.alignItems = 'center';
        openNoteEl.style.justifyContent = 'center';
        openNoteEl.style.fontWeight = 'bold';
        openNoteEl.style.background = '#f9f9f9';
        openNoteEl.style.borderRadius = '4px';
        openNoteEl.style.minWidth = '40px';
        openNoteEl.style.height = '40px';
        stringEl.appendChild(openNoteEl);
        for (let fretIndex = 1; fretIndex <= 15; fretIndex++) {
            const fretEl = document.createElement('div');
            fretEl.className = 'fret';
            fretEl.dataset.string = stringIndex;
            fretEl.dataset.fret = fretIndex;
            // 添加点击事件
            fretEl.addEventListener('click', () => handleFretClick(stringIndex, fretIndex));
            stringEl.appendChild(fretEl);
        }
        fretboardEl.appendChild(stringEl);
    }
}

// 计算指定弦和品位的音符（fretIndex=1为原1品）
function getNoteAtPosition(stringIndex, fretIndex) {
    const openStringNote = standardTuning[stringIndex];
    const openStringNoteIndex = allNotes.indexOf(openStringNote);
    const noteIndex = (openStringNoteIndex + fretIndex) % 12;
    return allNotes[noteIndex];
}

// 获取大调音阶音名
function getMajorScale(root) {
    const intervals = [2,2,1,2,2,2,1];
    let idx = allNotes.indexOf(root);
    const scale = [root];
    for (let i = 0; i < 6; i++) {
        idx = (idx + intervals[i]) % 12;
        scale.push(allNotes[idx]);
    }
    return scale;
}
// 获取小调音阶音名
function getMinorScale(root) {
    const intervals = [2,1,2,2,1,2,2];
    let idx = allNotes.indexOf(root);
    const scale = [root];
    for (let i = 0; i < 6; i++) {
        idx = (idx + intervals[i]) % 12;
        scale.push(allNotes[idx]);
    }
    return scale;
}

// 清除所有标记
function clearAllMarkers() {
    const dots = document.querySelectorAll('.fret .dot');
    dots.forEach(dot => dot.remove());
}

// 在指板上标记音阶音符
function markScaleNotes(root) {
    clearAllMarkers();
    let scale = scaleType === 'major' ? getMajorScale(root) : getMinorScale(root);
    // 3、5、7度索引
    const third = scaleType === 'major' ? scale[2] : scale[2];
    const fifth = scaleType === 'major' ? scale[4] : scale[4];
    const seventh = scaleType === 'major' ? scale[6] : scale[6];
    for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
        for (let fretIndex = 1; fretIndex <= 15; fretIndex++) {
            const noteAtPosition = getNoteAtPosition(stringIndex, fretIndex);
            if (noteAtPosition === root) {
                addDot(stringIndex, fretIndex, 'selected', 'R');
            } else if (noteAtPosition === third) {
                addDot(stringIndex, fretIndex, 'third', noteAtPosition);
            } else if (noteAtPosition === fifth) {
                addDot(stringIndex, fretIndex, 'fifth', noteAtPosition);
            } else if (noteAtPosition === seventh) {
                addDot(stringIndex, fretIndex, 'seventh', noteAtPosition);
            }
        }
    }
}

function addDot(stringIndex, fretIndex, className, noteName) {
    const fretEl = document.querySelector(`.fret[data-string="${stringIndex}"][data-fret="${fretIndex}"]`);
    if (fretEl) {
        const dotEl = document.createElement('span');
        dotEl.className = `dot ${className}`;
        dotEl.textContent = noteName;
        fretEl.appendChild(dotEl);
    }
}

// 处理品位点击事件
function handleFretClick(stringIndex, fretIndex) {
    const note = getNoteAtPosition(stringIndex, fretIndex);
    lastRootNote = note;
    markScaleNotes(note);
    noteInfoEl.innerHTML = `<strong>主音:</strong> ${note} | <strong>调性:</strong> ${scaleType === 'major' ? '大调' : '小调'}`;
}

// 随机选择一个音符
function selectRandomNote() {
    const randomString = Math.floor(Math.random() * 6);
    const randomFret = Math.floor(Math.random() * 15) + 1;
    handleFretClick(randomString, randomFret);
    const fretEl = document.querySelector(`.fret[data-string="${randomString}"][data-fret="${randomFret}"]`);
    fretEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

randomNoteBtn.addEventListener('click', selectRandomNote);
document.addEventListener('DOMContentLoaded', () => {
    createFretboard();
});