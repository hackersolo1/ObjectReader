/* =============================================
   OBJECT READER — script.js
   ============================================= */

const API_BASE = 'https://objectreader.onrender.com';

// ─────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────
function badgeClass(state) {
    if (!state) return '';
    const s = state.toLowerCase();
    return s === 'novo' ? 'badge-novo' : s === 'usado' ? 'badge-usado' : 'badge-velho';
}

function badgeLabel(state) {
    if (!state) return '—';
    const map = { novo: 'Novo', used: 'Usado', usado: 'Usado', old: 'Velho', velho: 'Velho' };
    return map[state.toLowerCase()] ?? state;
}

// ─────────────────────────────────────────────
// API CALLS
// ─────────────────────────────────────────────

// Busca objeto pelo código escaneado
async function fetchByCode(code) {
    const res = await fetch(`${API_BASE}/codequery/${encodeURIComponent(code)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json(); // null se não encontrado
}

// Busca lista do histórico
async function fetchHistory() {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json(); // array
}

// Busca estatísticas de contagem
async function fetchStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json(); // { total, novo, usado, velho }
}

// Adiciona novo item
async function addItem(payload) {
    const res = await fetch(`${API_BASE}/additem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
}

// ─────────────────────────────────────────────
// RENDER — lista de cards (mobile)
// ─────────────────────────────────────────────
function renderCardList(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="inbox"></i>
                <span>Nenhum item encontrado</span>
            </div>`;
        lucide.createIcons();
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="recent-item">
            <div class="item-img">${item.emoji ?? '📦'}</div>
            <div class="item-info">
                <div class="item-name">${item.objName ?? '—'}</div>
                <div class="item-meta">${item.objLocal ?? '—'}</div>
            </div>
            <span class="item-badge ${badgeClass(item.objState)}">${badgeLabel(item.objState)}</span>
        </div>
    `).join('');
    lucide.createIcons();
}

// ─────────────────────────────────────────────
// RENDER — tabela desktop
// ─────────────────────────────────────────────
function renderTable(tbodyId, items, showActions = false) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:28px;color:var(--gray-400);">
                    Nenhum item encontrado
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => {
        const name = item.objName ?? '—';
        const local = item.objLocal ?? '—';
        const state = item.objState ?? '—';
        const code = item.objCode ?? '—';
        const emoji = item.emoji ?? '📦';

        return `
        <tr>
            <td>
                <span class="table-item-emoji">${emoji}</span>
                <span class="table-item-name">${name}</span>
            </td>
            <td>${local}</td>
            <td>${state}</td>
            <td><span class="item-badge ${badgeClass(state)}">${badgeLabel(state)}</span></td>
            <td>
                ${showActions
                ? `<div class="table-actions">
                           <button class="btn-icon" title="Editar"><i data-lucide="pencil"></i></button>
                           <button class="btn-icon danger" title="Excluir" data-code="${code}"><i data-lucide="trash-2"></i></button>
                       </div>`
                : `<span class="table-code">${code}</span>`}
            </td>
        </tr>`;
    }).join('');

    lucide.createIcons();
}

// ─────────────────────────────────────────────
// RENDER — painel de resultado (após "Usar Código")
// ─────────────────────────────────────────────
function showObjResult(context, data) {
    const loading = document.getElementById(`${context}ObjLoading`);
    const content = document.getElementById(`${context}ObjContent`);
    const error = document.getElementById(`${context}ObjError`);

    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'none';
    if (error) error.style.display = 'none';

    if (!data) {
        if (error) error.style.display = 'flex';
        return;
    }

    const nameEl = document.getElementById(`${context}ObjName`);
    const codeEl = document.getElementById(`${context}ObjCode`);
    const localEl = document.getElementById(`${context}ObjLocal`);
    const stateEl = document.getElementById(`${context}ObjState`);

    if (nameEl) nameEl.textContent = data.objName ?? '—';
    if (codeEl) codeEl.textContent = data.objCode ?? '—';
    if (localEl) localEl.textContent = data.objLocal ?? '—';
    if (stateEl) {
        const lbl = badgeLabel(data.objState ?? '');
        const cls = badgeClass(data.objState ?? '');
        stateEl.innerHTML = `<span class="item-badge ${cls}">${lbl}</span>`;
    }

    if (content) content.style.display = 'flex';
    lucide.createIcons();
}

// ─────────────────────────────────────────────
// SCANNER — factory reutilizável
// ─────────────────────────────────────────────
function createScanner({
    context,
    videoId, btnStartId, btnStopId, btnUseId,
    resultSpanId, resultDisplayId, statusMsgId,
    badgeId, idleScreenId, laserId,
    scannerViewId, objPanelId, objLoadingId, btnBackId,
}) {
    const video = document.getElementById(videoId);
    const btnStart = document.getElementById(btnStartId);
    const btnStop = document.getElementById(btnStopId);
    const btnUse = document.getElementById(btnUseId);
    const resultSpan = document.getElementById(resultSpanId);
    const resultDisplay = document.getElementById(resultDisplayId);
    const statusMsg = document.getElementById(statusMsgId);
    const badge = document.getElementById(badgeId);
    const idleScreen = document.getElementById(idleScreenId);
    const laser = document.getElementById(laserId);
    const scannerView = document.getElementById(scannerViewId);
    const objPanel = document.getElementById(objPanelId);
    const objLoading = document.getElementById(objLoadingId);
    const btnBack = document.getElementById(btnBackId);

    let stream = null;
    let intervalId = null;
    let lastCode = null;

    function setBadgeActive(active) {
        if (!badge) return;
        badge.classList.toggle('active', active);
        badge.innerHTML = active
            ? '<span class="badge-dot"></span> Ativo'
            : '<span class="badge-dot"></span> Inativo';
    }

    function setDetectedCode(value) {
        lastCode = value;
        if (resultSpan) resultSpan.textContent = value;
        if (resultDisplay) resultDisplay.classList.add('has-result');
        if (btnUse) btnUse.style.display = 'inline-flex';
    }

    async function start() {
        if (!('BarcodeDetector' in window)) {
            if (statusMsg) {
                statusMsg.textContent = '❌ Navegador não suportado. Use Chrome ou Edge.';
                statusMsg.style.color = '#C0392B';
            }
            if (idleScreen) {
                const p = idleScreen.querySelector('p');
                const s = idleScreen.querySelector('span');
                if (p) p.textContent = 'Scanner indisponível';
                if (s) s.textContent = 'Use Google Chrome ou Microsoft Edge';
            }
            return;
        }

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            if (video) { video.srcObject = stream; video.style.display = 'block'; }
            if (idleScreen) idleScreen.style.display = 'none';
            if (laser) laser.style.display = 'block';
            if (btnStart) btnStart.style.display = 'none';
            if (btnStop) btnStop.style.display = 'inline-flex';
            setBadgeActive(true);
            if (statusMsg) { statusMsg.textContent = '✅ Scanner ativo. Aponte para o código.'; statusMsg.style.color = ''; }

            const detector = new BarcodeDetector({
                formats: ['code_128', 'ean_13', 'code_39', 'qr_code'],
            });

            intervalId = setInterval(async () => {
                try {
                    const barcodes = await detector.detect(video);
                    if (barcodes.length > 0) setDetectedCode(barcodes[0].rawValue);
                } catch (_) { }
            }, 200);

        } catch (err) {
            console.error(err);
            if (statusMsg) {
                statusMsg.textContent = '❌ Erro ao acessar câmera. Verifique as permissões.';
                statusMsg.style.color = '#C0392B';
            }
        }
    }

    function stop() {
        clearInterval(intervalId);
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
        if (video) { video.srcObject = null; video.style.display = 'none'; }
        if (idleScreen) idleScreen.style.display = 'flex';
        if (laser) laser.style.display = 'none';
        if (btnStop) btnStop.style.display = 'none';
        if (btnStart) btnStart.style.display = 'inline-flex';
        setBadgeActive(false);
        if (statusMsg) { statusMsg.textContent = 'Scanner pausado.'; statusMsg.style.color = ''; }
    }

    async function useCode() {
        if (!lastCode) return;
        stop();

        // Mobile: esconde a view do scanner e mostra o painel
        if (scannerView) scannerView.style.display = 'none';
        // Desktop: esconde painéis laterais de espera
        const waitingPanel = document.getElementById('desktopWaitingPanel');
        const instructionsPanel = document.getElementById('desktopInstructionsPanel');
        if (waitingPanel) waitingPanel.style.display = 'none';
        if (instructionsPanel) instructionsPanel.style.display = 'none';

        if (objPanel) { objPanel.style.display = 'block'; }
        if (objLoading) { objLoading.style.display = 'flex'; }
        lucide.createIcons();

        try {
            const data = await fetchByCode(lastCode);
            showObjResult(context, data ?? null);
        } catch (err) {
            console.error(`[scanner:${context}] useCode error:`, err);
            showObjResult(context, null);
        }
    }

    function backToScanner() {
        // Mobile
        if (scannerView) scannerView.style.display = 'block';
        // Desktop
        const waitingPanel = document.getElementById('desktopWaitingPanel');
        const instructionsPanel = document.getElementById('desktopInstructionsPanel');
        if (waitingPanel) waitingPanel.style.display = 'block';
        if (instructionsPanel) instructionsPanel.style.display = 'block';

        if (objPanel) objPanel.style.display = 'none';

        lastCode = null;
        if (resultSpan) resultSpan.textContent = 'Aguardando leitura...';
        if (resultDisplay) resultDisplay.classList.remove('has-result');
        if (btnUse) btnUse.style.display = 'none';
    }

    btnStart?.addEventListener('click', start);
    btnStop?.addEventListener('click', stop);
    btnUse?.addEventListener('click', useCode);
    btnBack?.addEventListener('click', backToScanner);
}

// ─────────────────────────────────────────────
// STATS — atualiza contadores das telas
// ─────────────────────────────────────────────
async function loadStats() {
    try {
        const s = await fetchStats();
        const total = s.total ?? 0;

        // Início desktop/mobile
        const els = {
            desktopStatTotal: total.toLocaleString('pt-BR'),
            desktopStatSub: 'itens catalogados',
            mobileStatTotal: total.toLocaleString('pt-BR'),
            mobileStatSub: 'itens catalogados',
            desktopStatNovo: (s.novo ?? 0).toLocaleString('pt-BR'),
            desktopStatUsado: (s.usado ?? 0).toLocaleString('pt-BR'),
            desktopStatVelho: (s.velho ?? 0).toLocaleString('pt-BR'),
            mobileStatNovo: (s.novo ?? 0).toLocaleString('pt-BR'),
            mobileStatUsado: (s.usado ?? 0).toLocaleString('pt-BR'),
            mobileStatVelho: (s.velho ?? 0).toLocaleString('pt-BR'),
        };

        Object.entries(els).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        });

    } catch (err) {
        console.warn('[stats] Falhou:', err);
        const fallback = { desktopStatTotal: '—', mobileStatTotal: '—' };
        Object.entries(fallback).forEach(([id, v]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = v;
        });
    }
}

// ─────────────────────────────────────────────
// HISTÓRICO — carrega e renderiza
// ─────────────────────────────────────────────
async function loadHistory() {
    try {
        const items = await fetchHistory();

        // Início desktop: últimas 5 como cards
        const desktopRecentList = document.getElementById('desktopRecentList');
        if (desktopRecentList) {
            const slice = items.slice(0, 5);
            if (slice.length === 0) {
                desktopRecentList.innerHTML = `<div class="empty-state"><i data-lucide="inbox"></i><span>Nenhuma leitura ainda</span></div>`;
            } else {
                desktopRecentList.innerHTML = slice.map(item => `
                    <div class="recent-item">
                        <div class="item-img">${item.emoji ?? '📦'}</div>
                        <div class="item-info">
                            <div class="item-name">${item.objName ?? '—'}</div>
                            <div class="item-meta">${item.objLocal ?? '—'}</div>
                        </div>
                        <span class="item-badge ${badgeClass(item.objState)}">${badgeLabel(item.objState)}</span>
                    </div>
                `).join('');
            }
            lucide.createIcons();
        }

        // Histórico desktop: tabela completa
        renderTable('desktopHistoryBody', items, false);

        // Dados desktop: tabela com ações
        renderTable('desktopDataBody', items, true);

        // Mobile início: 3 últimos
        renderCardList('mobileRecentList', items.slice(0, 3));

        // Mobile histórico: lista completa
        renderCardList('mobileHistoryList', items);

        // Mobile dados: lista completa
        renderCardList('mobileDataList', items);

    } catch (err) {
        console.warn('[history] Falhou:', err);
        const ids = ['mobileRecentList', 'mobileHistoryList', 'mobileDataList'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="wifi-off"></i>
                    <span>Sem conexão com o servidor</span>
                </div>`;
        });
        lucide.createIcons();
    }
}

// ─────────────────────────────────────────────
// NAVEGAÇÃO DESKTOP
// ─────────────────────────────────────────────
function initDesktopNav() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const desktopPages = document.querySelectorAll('.desktop-page[data-desktop-page]');
    const headerTitle = document.getElementById('headerTitle');

    const PAGE_LABELS = {
        inicio: 'Início',
        historico: 'Histórico',
        scanner: 'Scanner',
        dados: 'Gerenciar Dados',
        informacoes: 'Informações Técnicas',
    };

    function goToPage(page) {
        navItems.forEach(i => i.classList.toggle('active', i.dataset.page === page));
        desktopPages.forEach(p => p.classList.toggle('active', p.dataset.desktopPage === page));
        if (headerTitle) headerTitle.textContent = PAGE_LABELS[page] ?? page;
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            goToPage(item.dataset.page);
            closeSidebar();
        });
    });

    document.querySelectorAll('[data-goto]').forEach(el => {
        el.addEventListener('click', () => goToPage(el.dataset.goto));
    });
}

// ─────────────────────────────────────────────
// NAVEGAÇÃO MOBILE
// ─────────────────────────────────────────────
function initMobileNav() {
    const bottomBtns = document.querySelectorAll('.bottom-nav-item[data-nav]');
    const scanBtn = document.getElementById('scanBtn');
    const screens = document.querySelectorAll('[reference-page]');

    function showScreen(page) {
        screens.forEach(s => s.style.display = 'none');
        const target = document.querySelector(`[reference-page="${page}"]`);
        if (target) target.style.display = 'block';
    }

    showScreen('inicio');

    bottomBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            bottomBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showScreen(btn.dataset.nav);
        });
    });

    scanBtn?.addEventListener('click', () => {
        bottomBtns.forEach(b => b.classList.remove('active'));
        showScreen('scanner');
        scanBtn.style.transform = 'scale(0.9)';
        setTimeout(() => { scanBtn.style.transform = ''; }, 150);
    });

    document.querySelectorAll('.mobile-goto').forEach(el => {
        el.addEventListener('click', () => {
            const target = el.dataset.goto;
            bottomBtns.forEach(b => b.classList.toggle('active', b.dataset.nav === target));
            showScreen(target);
        });
    });
}

// ─────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const menuBtn = document.getElementById('mobileMenuBtn');

    window.closeSidebar = function () {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    };

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    menuBtn?.addEventListener('click', () =>
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar()
    );
    overlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', e => e.key === 'Escape' && closeSidebar());
}

// ─────────────────────────────────────────────
// FILTROS
// ─────────────────────────────────────────────
function initFilters() {
    document.querySelectorAll('.filter-row').forEach(row => {
        row.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                row.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });
    });
}

// ─────────────────────────────────────────────
// FORMULÁRIO DADOS
// ─────────────────────────────────────────────
function initDadosForm() {
    // ── Desktop ──
    const addForm = document.getElementById('desktopAddForm');
    const btnAdd = document.getElementById('desktopBtnAddItem');
    const btnClose = document.getElementById('desktopCloseForm');
    const btnCancel = document.getElementById('desktopCancelForm');
    const btnSave = document.getElementById('desktopBtnSave');

    btnAdd?.addEventListener('click', () => { if (addForm) addForm.style.display = 'block'; });
    btnClose?.addEventListener('click', () => { if (addForm) addForm.style.display = 'none'; });
    btnCancel?.addEventListener('click', () => { if (addForm) addForm.style.display = 'none'; });

    btnSave?.addEventListener('click', async () => {
        const name = document.getElementById('desktopObjNameInput')?.value.trim();
        const code = document.getElementById('desktopObjCodeInput')?.value.trim();
        const local = document.getElementById('desktopObjLocalInput')?.value;
        const state = document.getElementById('desktopObjStateInput')?.value;
        const obs = document.getElementById('desktopObjObsInput')?.value.trim();

        if (!name || !code) { alert('Preencha pelo menos Nome e Código.'); return; }

        try {
            btnSave.disabled = true;
            btnSave.textContent = 'Salvando...';
            await addItem({ objName: name, objCode: code, objLocal: local, objState: state, objObs: obs });
            if (addForm) addForm.style.display = 'none';
            await Promise.all([loadHistory(), loadStats()]);
        } catch (err) {
            alert('Erro ao salvar item. Verifique o servidor.');
            console.error(err);
        } finally {
            btnSave.disabled = false;
            btnSave.innerHTML = '<i data-lucide="save"></i> Salvar Item';
            lucide.createIcons();
        }
    });

    // ── Mobile ──
    const mobileForm = document.getElementById('mobileAddForm');
    const mobileBtnAdd = document.getElementById('mobileBtnAddItem');
    const mobileClose = document.getElementById('mobileCloseForm');
    const mobileCancel = document.getElementById('mobileCancelForm');
    const mobileSave = document.getElementById('ObjAddSave');

    mobileBtnAdd?.addEventListener('click', () => { if (mobileForm) mobileForm.style.display = 'flex'; });
    mobileClose?.addEventListener('click', () => { if (mobileForm) mobileForm.style.display = 'none'; });
    mobileCancel?.addEventListener('click', () => { if (mobileForm) mobileForm.style.display = 'none'; });

    mobileSave?.addEventListener('click', async () => {
        const name = document.getElementById('ObjName')?.value.trim();
        const code = document.getElementById('ObjCode')?.value.trim();
        const local = document.getElementById('ObjLocal')?.value;
        const state = document.getElementById('ObjState')?.value;

        if (!name || !code) { alert('Preencha pelo menos Nome e Código.'); return; }

        try {
            mobileSave.disabled = true;
            mobileSave.textContent = 'Salvando...';
            await addItem({ objName: name, objCode: code, objLocal: local, objState: state });
            if (mobileForm) mobileForm.style.display = 'none';
            await Promise.all([loadHistory(), loadStats()]);
        } catch (err) {
            alert('Erro ao salvar item. Verifique o servidor.');
            console.error(err);
        } finally {
            mobileSave.disabled = false;
            mobileSave.innerHTML = '<i data-lucide="save"></i> Salvar';
            lucide.createIcons();
        }
    });
}

// ─────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

    lucide.createIcons();
    initSidebar();
    initDesktopNav();
    initMobileNav();
    initFilters();
    initDadosForm();

    createScanner({
        context: 'desktop',
        videoId: 'desktopVideo',
        btnStartId: 'desktopBtnStart',
        btnStopId: 'desktopBtnStop',
        btnUseId: 'desktopBtnUse',
        resultSpanId: 'desktopResultSpan',
        resultDisplayId: 'desktopResultDisplay',
        statusMsgId: 'desktopStatusMsg',
        badgeId: 'desktopScannerBadge',
        idleScreenId: 'desktopIdleScreen',
        laserId: 'desktopLaser',
        scannerViewId: null,               // desktop não tem wrapper separado
        objPanelId: 'desktopObjPanel',
        objLoadingId: 'desktopObjLoading',
        btnBackId: 'desktopBtnBack',
    });

    createScanner({
        context: 'mobile',
        videoId: 'mobileVideo',
        btnStartId: 'mobileBtnStart',
        btnStopId: 'mobileBtnStop',
        btnUseId: 'mobileBtnUse',
        resultSpanId: 'mobileResultSpan',
        resultDisplayId: 'mobileResultDisplay',
        statusMsgId: 'mobileStatusMsg',
        badgeId: 'mobileScannerBadge',
        idleScreenId: 'mobileIdleScreen',
        laserId: 'mobileLaser',
        scannerViewId: 'mobileScannerView',
        objPanelId: 'mobileObjPanel',
        objLoadingId: 'mobileObjLoading',
        btnBackId: 'mobileBtnBack',
    });

    // Carrega dados reais
    await Promise.all([loadStats(), loadHistory()]);
});
