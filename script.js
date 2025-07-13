/* 시간대별 k값 테이블 (0~23시) */
const kTable = [
  0.6,0.6,0.6,0.6,0.6,0.6,    // 00–05
  1.2,1.2,1.2,1.2,            // 06–09
  1.0,1.0,1.0,1.0,1.0,        // 10–14
  1.4,1.4,1.4,                // 15–17
  1.5,1.5,1.5,                // 18–20
  0.7,0.7,0.7                 // 21–23
];

/* 24칸(6x4) 그리드 생성 */
const grid   = document.getElementById('grid');
const states = Array(24).fill(0);           // 0 빈,1 대기,2 방출,3 충전

for(let h=0; h<24; h++){
  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.title = `${String(h).padStart(2,'0')}:00`;

  cell.addEventListener('click', ()=>{
    states[h] = (states[h]+1)%4;            // 0→1→2→3→0
    cell.className = 'cell '+
      (states[h]===1 ? 'standby' :
       states[h]===2 ? 'discharge' :
       states[h]===3 ? 'charge'    : '');
    updateSummary();
  });

  const lbl = document.createElement('div');
  lbl.className = 'time-label';
  const end = (h+1)%24;
  lbl.textContent = `${String(h).padStart(2,'0')}:00\n~${String(end).padStart(2,'0')}:00`;

  wrap.appendChild(cell);
  wrap.appendChild(lbl);
  grid.appendChild(wrap);
}

/* 요약·k합계 갱신 */
function updateSummary(){
  let standby=0, discharge=0, charge=0, kSum=0;
  states.forEach((st,i)=>{
    if(st===1){ standby++;   kSum+=kTable[i]; }
    if(st===2)  discharge++;
    if(st===3)  charge++;
  });
  summary.innerHTML =
    `대기 ${standby}h | 방출 ${discharge}h | 충전 ${charge}h&nbsp;&nbsp;Σk = ${kSum.toFixed(1)}`;
  return {standby, discharge, kSum};
}

/* 계산 버튼 */
calcBtn.addEventListener('click', ()=>{
  const {standby, discharge, kSum} = updateSummary();

  const P = parseFloat(pRated.value);   // 정격출력(MW)
  const H = 4, W = 1;

  const A  = standby  / 24;   // 대기 비율
  const CF = discharge / 24;  // 방출 비율

  /* 일간 VIC 발급량 */
  const vicDay = H * P * A * CF * W * kSum;

  /* 의무 VIC: P * 방출시간 * CF  */
  const vicObl = P * discharge * CF;

  /* 수익 */
  const unit = 18000;
  const revenue = (vicDay - vicObl) * unit;

  result.innerHTML =
    `일간 VIC 발급량: <b>${vicDay.toFixed(3)}</b> VIC<br>`+
    `일간 VIC 의무량: <b>${vicObl.toFixed(3)}</b> VIC<br>`+
    `오늘 VIC 수익: <b>${revenue.toLocaleString()} 원</b>`;
});
