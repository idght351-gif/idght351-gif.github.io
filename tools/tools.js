/* 백호 무료 양식 공통 도구. 입력한 숫자는 이 기기 브라우저(localStorage)에만 저장되고 어디로도 보내지 않는다. */
const BH = (() => {
  const num = s => { const n = Number(String(s ?? '').replace(/[^\d.-]/g, '')); return isFinite(n) ? n : 0; };
  const won = n => Math.round(n).toLocaleString('ko-KR');
  // 12,345,678 -> "1,234만 원" / 1억 이상 -> "1억 2,345만 원"
  const man = n => {
    const neg = n < 0; n = Math.abs(Math.round(n));
    if (n === 0) return '0원';
    const eok = Math.floor(n / 1e8), m = Math.floor((n % 1e8) / 1e4), rest = n % 1e4;
    let s = '';
    if (eok) s += eok.toLocaleString('ko-KR') + '억 ';
    if (m) s += m.toLocaleString('ko-KR') + '만 ';
    if (!eok && !m) s += rest.toLocaleString('ko-KR');
    return (neg ? '−' : '') + s.trim() + ' 원';
  };
  const pct = (a, b) => (b ? (a / b) * 100 : 0);
  const pctTxt = v => v.toFixed(1) + '%';
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  // 금액 입력칸: 쉼표 자동, 옆에 'O만 원' 읽기
  function moneyInput(input, onChange) {
    const say = (input.closest('[data-say]') || input.parentElement).querySelector('.say');
    const show = () => { const n = num(input.value); if (say) say.textContent = input.value ? man(n) : ''; };
    input.addEventListener('input', () => {
      const raw = input.value.replace(/[^\d]/g, '');
      const pos = input.value.length - input.selectionStart;
      input.value = raw ? Number(raw).toLocaleString('ko-KR') : '';
      const p = Math.max(0, input.value.length - pos);
      try { input.setSelectionRange(p, p); } catch (e) {}
      show(); onChange && onChange();
    });
    show();
  }

  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1800);
  }

  // 결과 카드 이미지(1080x1350) 저장
  async function saveCard({ title, big, bigNeg, lines, bars }) {
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1350;
    const g = c.getContext('2d');
    const F = (w, s) => `${w} ${s}px "Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`;
    try { await document.fonts.load(F(900, 96), '0원'); await document.fonts.load(F(600, 34), '가'); } catch (e) {}
    g.fillStyle = '#0B1F17'; g.fillRect(0, 0, 1080, 1350);
    try {
      const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = 'logo.png'; });
      g.save(); g.beginPath(); g.arc(130, 140, 62, 0, Math.PI * 2); g.clip(); g.drawImage(img, 68, 78, 124, 124); g.restore();
    } catch (e) {}
    g.fillStyle = '#fff'; g.font = F(800, 46); g.fillText(title, 218, 130);
    g.fillStyle = '#A9C2B8'; g.font = F(500, 30); g.fillText(new Date().toLocaleDateString('ko-KR') + ' 기준', 218, 178);
    g.fillStyle = '#73FDC1'; g.fillRect(68, 270, 10, 150);
    g.fillStyle = '#A9C2B8'; g.font = F(600, 34); g.fillText(big.label, 104, 310);
    g.fillStyle = bigNeg ? '#FF8A8A' : '#73FDC1'; g.font = F(900, 96); g.fillText(big.value, 100, 410);
    let y = 520;
    lines.forEach(([k, v]) => {
      g.fillStyle = '#A9C2B8'; g.font = F(600, 34); g.fillText(k, 104, y);
      g.fillStyle = '#fff'; g.font = F(800, 40); g.textAlign = 'right'; g.fillText(v, 976, y); g.textAlign = 'left';
      g.fillStyle = '#23392F'; g.fillRect(104, y + 24, 872, 2); y += 86;
    });
    y += 20;
    (bars || []).forEach(([k, v]) => {
      g.fillStyle = '#fff'; g.font = F(600, 30); g.fillText(k, 104, y);
      g.textAlign = 'right'; g.fillText(pctTxt(v), 976, y); g.textAlign = 'left';
      g.fillStyle = '#23392F'; g.fillRect(104, y + 16, 872, 14);
      g.fillStyle = '#73FDC1'; g.fillRect(104, y + 16, 872 * Math.min(1, Math.max(0, v / 100)), 14); y += 74;
    });
    g.fillStyle = '#5E7A6E'; g.font = F(500, 26);
    g.fillText('백호의 1년 돈관리 · 유튜브 @내돈은내손으로', 104, 1290);
    const a = document.createElement('a'); a.download = title.replace(/\s/g, '_') + '.png'; a.href = c.toDataURL('image/png'); a.click();
    toast('이미지를 저장했어요');
  }

  function csv(name, rows) {
    const body = rows.map(r => r.map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' }));
    a.download = name + '.csv'; a.click(); toast('엑셀용 파일(CSV)을 저장했어요');
  }

  return { num, won, man, pct, pctTxt, load, save, moneyInput, toast, saveCard, csv };
})();
