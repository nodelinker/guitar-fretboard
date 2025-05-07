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
// 新增音阶模式状态
let scaleMode = 'diatonic';

// 新增：五声音阶按钮
const pentatonicBtn = document.createElement('button');
pentatonicBtn.id = 'pentatonicBtn';
pentatonicBtn.textContent = '五声音阶';
pentatonicBtn.style.marginLeft = '10px';
document.querySelector('.controls').appendChild(pentatonicBtn);

// 新增：琶音按钮
const arpeggioBtn = document.createElement('button');
arpeggioBtn.id = 'arpeggioBtn';
arpeggioBtn.textContent = '琶音';
arpeggioBtn.style.marginLeft = '10px';
document.querySelector('.controls').appendChild(arpeggioBtn);

// 五声音阶计算
function getPentatonicScale(root) {
  const intervals = scaleType === 'major' ? [2,2,3,2,3] : [3,2,2,3,2];
  let idx = allNotes.indexOf(root);
  return [root, allNotes[(idx+intervals[0])%12], allNotes[(idx+intervals[0]+intervals[1])%12], 
          allNotes[(idx+intervals[0]+intervals[1]+intervals[2])%12], allNotes[(idx+intervals[0]+intervals[1]+intervals[2]+intervals[3])%12]];
}

// 琶音计算
function getArpeggio(root) {
  const intervals = scaleType === 'major' ? [4,3,4] : [3,4,3];
  let idx = allNotes.indexOf(root);
  return [root, allNotes[(idx+intervals[0])%12], allNotes[(idx+intervals[0]+intervals[1])%12], 
          allNotes[(idx+intervals[0]+intervals[1]+intervals[2])%12]];
}

// 更新音阶标记逻辑
function markScaleNotes(root) {
  clearAllMarkers();
  let scale = [];
  
  if(scaleMode === 'pentatonic') {
    scale = getPentatonicScale(root);
  } else if(scaleMode === 'arpeggio') {
    scale = getArpeggio(root);
  } else {
    scale = scaleType === 'major' ? getMajorScale(root) : getMinorScale(root);
  }

  // 根据模式设置标记规则
  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    for (let fretIndex = 1; fretIndex <= 15; fretIndex++) {
      const note = getNoteAtPosition(stringIndex, fretIndex);
      
      if(note === root) {
        addDot(stringIndex, fretIndex, 'selected', 'R');
      } else if(scaleMode === 'pentatonic' && scale.includes(note)) {
        addDot(stringIndex, fretIndex, 'pentatonic', note);
      } else if(scaleMode === 'arpeggio' && scale.includes(note)) {
        addDot(stringIndex, fretIndex, 'arpeggio', note);
      } else if(scaleMode === 'diatonic') {
        // 保持原有逻辑
        if(note === scale[2]) addDot(stringIndex, fretIndex, 'third', note);
        if(note === scale[4]) addDot(stringIndex, fretIndex, 'fifth', note);
        if(note === scale[6]) addDot(stringIndex, fretIndex, 'seventh', note);
      }
    }
  }
}

// 按钮事件监听
pentatonicBtn.addEventListener('click', () => {
  scaleMode = 'pentatonic';
  updateDisplay();
});

arpeggioBtn.addEventListener('click', () => {
  scaleMode = 'arpeggio';
  updateDisplay();
});

function updateDisplay() {
  clearAllMarkers();
  if(lastRootNote) {
    markScaleNotes(lastRootNote);
    noteInfoEl.innerHTML = `<strong>主音:</strong> ${lastRootNote} | 
      <strong>模式:</strong> ${{
        'diatonic': scaleType === 'major' ? '大调' : '小调',
        'pentatonic': '五声音阶',
        'arpeggio': '琶音'
      }[scaleMode]}`;
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