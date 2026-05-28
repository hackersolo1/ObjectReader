document.addEventListener('DOMContentLoaded', () => {


    const supabaseC = supabase.createClient('https://ymsyjydtpfvckmfrluvj.supabase.co', 'sb_publishable_DF1WMDX9qH_FgtXFllllrw_GFuQnrsD');

    const statusMsg = document.getElementById('statusMsg');
    const idleScreen = document.getElementById('idleScreenId');
    const video = document.getElementById('scannerVideo');
    const pages = document.querySelectorAll('aside [data-page]');
    const bottomNavItem = document.querySelectorAll('[data-nav]');
    const statTotal = document.querySelector('#statTotal');
    const statSub = document.querySelector('#statSub');
    const dataTableBody = document.getElementById('dataTableBody');
    const btnAddItem = document.getElementById('btnAddItem');
    const addForm = document.getElementById('addForm');
    const closeForm = document.getElementById('closeForm');
    const cancelForm = document.getElementById('cancelForm');
    const headerAvatarImg = document.getElementById('headerAvatarImg');
    const AvatarImgBottom = document.getElementById('AvatarImgBottom');
    const headerAvatarIcon = document.getElementById('headerAvatarIcon');
    const AvatarIconBottom = document.getElementById('AvatarIconBottom');
    const heroGreeting = document.getElementById('heroGreeting');
    const loginBanner = document.getElementById('loginBanner');
    const btnLoginGoogle = document.getElementById('btnLoginGoogle');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const objNameInput = document.getElementById('objNameInput');
    const objCodeInput = document.getElementById('objCodeInput');
    const objLocalInput = document.getElementById('objLocalInput');
    const objStateInput = document.getElementById('objStateInput');
    const btnSave = document.getElementById('btnSave');
    const objObsInput = document.getElementById('objObsInput');
    const dataList = document.getElementById('dataList');

    btnAddItem.addEventListener('click', () => {
        addForm.style.display = 'block';
    });

    [closeForm, cancelForm].forEach(b => {
        b.addEventListener('click', () => {
            addForm.style.display = 'none';
        });
    });

    btnLoginGoogle.addEventListener('click', async () => {
        const { error } = await supabaseC.auth.signInWithOAuth({
            provider: 'google'
        });
        if (error) {
            console.log(error);
        }
    });

    btnSave.addEventListener('click', async () => {
        const name = objNameInput.value.trim();
        const code = objCodeInput.value.trim();
        const local = objLocalInput.value.trim();
        const state = objStateInput.value.trim();
        const obs = objObsInput.value.trim();

        if (!name || !code) {
            alert("Insira pelo menos o nome e o código do objeto.");
            return;
        }

        await saveObj(name, code, local, state, obs);
    });


    pages.forEach(p => {
        p.addEventListener('click', (e) => {
            pages.forEach(pa => {
                pa.classList.remove('active');
                e.currentTarget.classList.add('active');
            });
            el = e.currentTarget.dataset.page;
            document.querySelectorAll('.app-wrapper .page').forEach(bpa => {
                bpa.classList.remove('active');
                document.querySelector(`.app-wrapper [data-page="${el}"]`).classList.add('active');
            });
        });
    });

    bottomNavItem.forEach(b => {
        b.addEventListener('click', (e) => {
            bottomNavItem.forEach(bo => {
                bo.classList.remove('active');
                e.currentTarget.classList.add('active');
            });
            el = e.currentTarget.dataset.nav;
            console.log(el);
            document.querySelectorAll('.app-wrapper [data-page]').forEach(bpa => {
                bpa.classList.remove('active');
                document.querySelector(`.app-wrapper [data-page="${el}"]`).classList.add('active');
            });
        });
    });


    function loadScanner() {
        if (!("BarcodeDetector" in window)) {
            if (statusMsg) {
                statusMsg.textContent = '❌ Navegador não suportado. Use Chrome ou Edge.';
                statusMsg.style.color = '#C0392B';
            }
            return;
        } else {
            console.log('s')
        }
    }

    async function loadObjects() {
        const { data, error } = await supabaseC.from('ObjInfo').select("*");
        if (data) {
            statTotal.innerText = data.length;
            statSub.style.display = 'none';
        }

        data.forEach(d => {
            mobileRender(d);
            desktopRender(d);
        });
        if (error) {
            console.log(error);
        }
    }

    function desktopRender(d) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <span class="table-item-emoji">📦</span>
                <span class="table-item-name">${d.objName}</span>
            </td>
            <td>${d.objCode}</td>
            <td>${d.objLocal}</td>
            <td><span class="item-badge">${d.objState}</span></td>
            <td>
                <span class="table-code">${d.objState}</span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" title="Editar"><i data-lucide="pencil"></i></button>
                    <button class="btn-icon danger" title="Excluir" data-code="${d.objCode}"><i data-lucide="trash-2"></i></button>
                </div>
            </td>
        `;

        dataTableBody.appendChild(tr);
        lucide.createIcons();
    }

    function mobileRender(d) {
        const div = document.createElement('div');
        div.classList.add('recent-item');
        div.innerHTML = `
            <div class="item-img">📦</div>
            <div class="item-info">
                <div class="item-name">${d.objName}</div>
                <div class="item-meta">${d.objLocal} | ${d.objState}</div>
            </div>
        `;
        dataList.appendChild(div);
    }

    supabaseC.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            const user = session.user;
            const userInfo = {
                id: user.id,
                email: user.email,
                name: user.user_metadata.full_name || user.user_metadata.name,
                avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture
            };

            document.getElementById('headerAvatarIcon').style.display = 'none';
            document.getElementById('AvatarIconBottom').style.display = 'none';
            heroGreeting.innerText = `Olá, ${userInfo.name}!`;
            if (userInfo.avatar_url) {
                headerAvatarIcon.style.display = 'none';
                headerAvatarImg.style.display = 'block';
                headerAvatarImg.src = userInfo.avatar_url;
                AvatarIconBottom.style.display = 'none';
                AvatarImgBottom.style.display = 'block';
                AvatarImgBottom.src = userInfo.avatar_url;
            };

            loginBanner.style.display = 'none';

            btnAddItem.disabled = false;
            btnAddItem.style.opacity = '1';
            btnAddItem.style.cursor = 'pointer';
            btnAddItem.title = 'Adicionar mais itens.';

            userName.textContent = userInfo.name;
            userRole.textContent = 'Criador'
        } else {
            heroGreeting.innerText = 'Olá, visitante!';
            headerAvatarImg.style.display = 'none';
            AvatarImgBottom.style.display = 'none';
            document.getElementById('AvatarIconBottom').style.display = 'block';
            loginBanner.style.display = 'flex';

            btnAddItem.disabled = true;
            btnAddItem.style.opacity = '0.5';
            btnAddItem.style.cursor = 'not-allowed';
            btnAddItem.title = 'Faça login para adicionar mais itens.'
        }
    });

    async function saveObj(name, code, local, state, obs) {

        const { error } = await supabaseC.from('ObjInfo').insert({
            objCode: code,
            objName: name,
            objState: state || 'Descinhecido',
            objLocal: local || 'Desconhecido',
            objObs: obs || 'Sem observações'
        });
        if (error) {
            console.log(error);
            alert(`Erro ao salvar o objeto. ${error}`);
        } else {
            alert('Objeto salvo com êxito.');
            addForm.style.display = 'none';

            objNameInput.value = '';
            objCodeInput.value = '';
            objLocalInput.value = '';
            objObsInput.value = '';

            // Atualiza a tabela na tela para mostrar o novo item
            dataTableBody.innerHTML = '';
            loadObjects();
        }
    }

    loadObjects()
    lucide.createIcons();
    loadScanner()

    // ==========================================
    // SISTEMA DE SCANNER (CÂMERA)
    // ==========================================

    // Capturando os botões da interface
    const btnStart = document.getElementById('btnStart');
    const btnStop = document.getElementById('btnStop');
    const resultSpan = document.getElementById('resultSpan');
    const resultDisplay = document.getElementById('objPanel');
    const btnUse = document.getElementById('btnUse');

    const objPanel = document.getElementById('objPanel');
    const objPanelName = document.getElementById('objName');
    const objPanelCode = document.getElementById('objCode');
    const objPanelLocal = document.getElementById('objLocal');
    const objPanelState = document.getElementById('objState');

    let stream = null;
    let barcodeDetector = null;
    let scanInterval = null;
    let scannedCode = '';

    // 1. Verifica se o navegador suporta o leitor nativo
    if (!('BarcodeDetector' in window)) {
        statusMsg.innerText = "Navegador não suporta leitura nativa. Use o Chrome no Android.";
        statusMsg.style.color = "var(--red-text)";
        btnStart.disabled = true;
    } else {
        barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'code_128', 'qr_code', 'upc_a'] });
    }

    // 2. Função para Ligar a Câmera
    async function startScanner() {
        try {
            // Pede a câmera traseira (environment)
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            video.srcObject = stream;
            idleScreen.style.display = 'none';

            btnStart.style.display = 'none';
            btnStop.style.display = 'flex';
            objPanel.style.display = 'none';
            statusMsg.innerText = "Aponte para o código...";

            // Loop que tenta ler o código a cada 500ms
            scanInterval = setInterval(async () => {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    const barcodes = await barcodeDetector.detect(video);
                    if (barcodes.length > 0) {
                        const code = barcodes[0].rawValue;
                        stopScanner(); // Desliga a câmera na mesma hora

                        scannedCode = code;
                        resultSpan.innerText = code;
                        objPanel.style.display = 'block';
                        statusMsg.innerText = "Código capturado!";
                    }
                }
            }, 500);

        } catch (err) {
            console.error("Erro na câmera:", err);
            statusMsg.innerText = "Erro ao acessar a câmera. Permissão negada?";
        }
    }

    // 3. Função para Desligar a Câmera
    function stopScanner() {
        if (scanInterval) clearInterval(scanInterval);
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        btnStart.style.display = 'flex';
        btnStop.style.display = 'none';
        idleScreen.style.display = 'block';
    }

    // Eventos dos botões
    btnStart.addEventListener('click', startScanner);
    btnStop.addEventListener('click', stopScanner);

    // 4. Buscar o Objeto no Supabase!
    btnUse.addEventListener('click', async () => {
        if (!scannedCode) return;

        statusMsg.innerText = "Buscando no banco de dados...";

        const { data, error } = await supabaseC
            .from('ObjInfo')
            .select('*')
            .eq('objCode', scannedCode)
            .single();

        if (error || !data) {
            alert(`Poxa, nenhum objeto com o código ${scannedCode} foi encontrado.`);
            statusMsg.innerText = "Objeto não cadastrado.";
        } else {
            // Objeto encontrado! Mostramos os dados:
            showObjInfo(data);
            alert(`📦 Objeto Encontrado!\n\nNome: ${data.objName}\nLocal: ${data.objLocal}\nEstado: ${data.objState}\nObs: ${data.objObs}`);
            statusMsg.innerText = "Pronto para o próximo!";
        }
    });

    function showObjInfo(d) {
        objPanelName.textContent = d.objName;
        objPanelCode.textContent = d.objCode;
        objPanelLocal.textContent = d.objLocal;
        objPanelState.textContent = d.objState;

        objPanel.style.display = 'block';
    }

});
