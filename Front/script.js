document.addEventListener("DOMContentLoaded", () => {
  const supabaseC = supabase.createClient(
    "https://ymsyjydtpfvckmfrluvj.supabase.co",
    "sb_publishable_DF1WMDX9qH_FgtXFllllrw_GFuQnrsD",
  );

  const statusMsg = document.getElementById("statusMsg");
  const idleScreen = document.getElementById("idleScreenId");
  const video = document.getElementById("scannerVideo");
  const pages = document.querySelectorAll("aside [data-page]");
  const bottomNavItem = document.querySelectorAll("[data-nav]");
  const statTotal = document.querySelector("#statTotal");
  const statSub = document.querySelector("#statSub");
  const dataTableBody = document.getElementById("dataTableBody");
  const btnAddItem = document.getElementById("btnAddItem");
  const addForm = document.getElementById("addForm");
  const closeForm = document.getElementById("closeForm");
  const cancelForm = document.getElementById("cancelForm");
  const iconBtn = document.getElementById('icon-btn');
  const bottomIconBtn = document.getElementById('bottom-icon-btn');
  const headerAvatarImg = document.getElementById("headerAvatarImg");
  const AvatarImgBottom = document.getElementById("AvatarImgBottom");
  const headerAvatarIcon = document.getElementById("headerAvatarIcon");
  const AvatarIconBottom = document.getElementById("AvatarIconBottom");
  const heroGreeting = document.getElementById("heroGreeting");
  const loginBanner = document.getElementById("loginBanner");
  const btnLoginGoogle = document.getElementById("btnLoginGoogle");
  const userName = document.getElementById("userName");
  const userRole = document.getElementById("userRole");
  const objNameInput = document.getElementById("objNameInput");
  const objCodeInput = document.getElementById("objCodeInput");
  const goToScanner = document.getElementById("goToScanner");
  const objLocalInput = document.getElementById("objLocalInput");
  const objStateInput = document.getElementById("objStateInput");
  const objImageInput = document.getElementById("objImageInput");
  const btnSave = document.getElementById("btnSave");
  const objObsInput = document.getElementById("objObsInput");
  const dataList = document.getElementById("dataList");
  const editForm = document.getElementById('editForm');
  const closeEditForm = document.getElementById('closeEditForm');
  const cancelEditForm = document.getElementById('cancelEditForm');
  const objNameInputEdit = document.getElementById('objNameInputEdit');
  const objCodeInputEdit = document.getElementById('objCodeInputEdit');
  const objLocalInputEdit = document.getElementById('objLocalInputEdit');
  const objStateInputEdit = document.getElementById('objStateInputEdit');
  const objObsInputEdit = document.getElementById('objObsInputEdit');
  const btnSaveEdit = document.getElementById('btnSaveEdit');

  btnAddItem.addEventListener("click", () => {
    addForm.style.display = "inline-block";
    editForm.style.display = 'none';
  });

  goToScanner.addEventListener("click", () => {
    document.querySelector('[data-page="scanner"]').click();
  });

  [iconBtn, bottomIconBtn].forEach((b) => {
    b.addEventListener("click", logout);
  });

  [closeForm, cancelForm].forEach((b) => {
    b.addEventListener("click", () => {
      addForm.style.display = "none";
    });
  });

  [closeEditForm, cancelEditForm].forEach((b) => {
    b.addEventListener('click', () => {
      editForm.style.display = 'none';
    });
  });

  btnLoginGoogle.addEventListener("click", async () => {
    const { error } = await supabaseC.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      console.log(error);
    }
  });



  btnSave.addEventListener("click", async () => {
    const name = objNameInput.value.trim();
    const code = objCodeInput.value.trim();
    const local = objLocalInput.value.trim();
    const state = objStateInput.value.trim();
    const obs = objObsInput.value.trim();
    const image = objImageInput.files[0];
    if (image) {
      const imageName = image.name;
    } else {
      imageName = null;
    }

    if (!name || !code) {
      alert("Insira pelo menos o nome e o código do objeto.");
      return;
    }

    await saveObj(name, code, local, state, obs, imageName, image);
    btnSave.innerHTML = '<i data-lucide="loader-circle" class="loaderI"></i>'
    btnSave.style = "opacity: 0.5; cursor: not-allowed";
    btnSave.disabled = true;
  });

  let oldC = null;
  btnSaveEdit.addEventListener('click', async () => {
    const name = objNameInputEdit.value.trim();
    const code = objCodeInputEdit.value.trim();
    const local = objLocalInputEdit.value.trim();
    const state = objStateInputEdit.value.trim();
    const obs = objObsInputEdit.value.trim();

    console.log(oldC);

    await updateObjInfo(oldC, name, code, local, state, obs);
    btnSaveEdit.innerHTML = '<i data-lucide="loader-circle" class="loaderI"></i>'
    btnSaveEdit.style = "opacity: 0.5; cursor: not-allowed";
    btnSaveEdit.disabled = true;
  });

  pages.forEach((p) => {
    p.addEventListener("click", (e) => {
      pages.forEach((pa) => {
        pa.classList.remove("active");
        e.currentTarget.classList.add("active");
      });
      el = e.currentTarget.dataset.page;
      document.querySelectorAll(".app-wrapper .page").forEach((bpa) => {
        bpa.classList.remove("active");
        document
          .querySelector(`.app-wrapper [data-page="${el}"]`)
          .classList.add("active");
      });
    });
  });

  bottomNavItem.forEach((b) => {
    b.addEventListener("click", (e) => {
      bottomNavItem.forEach((bo) => {
        bo.classList.remove("active");
        e.currentTarget.classList.add("active");
      });
      el = e.currentTarget.dataset.nav;
      console.log(el);
      document.querySelectorAll(".app-wrapper [data-page]").forEach((bpa) => {
        bpa.classList.remove("active");
        document
          .querySelector(`.app-wrapper [data-page="${el}"]`)
          .classList.add("active");
      });
    });
  });

  function loadScanner() {
    if (!("BarcodeDetector" in window)) {
      if (statusMsg) {
        statusMsg.textContent =
          "❌ Navegador não suportado. Use Chrome ou Edge.";
        statusMsg.style.color = "#C0392B";
      }
      return;
    } else {
      console.log("s");
    }
  }

  async function loadObjects() {
    const { data, error } = await supabaseC.from("ObjInfo").select("*");
    if (data) {
      statTotal.innerText = data.length;
      statSub.style.display = "none";
    }

    data.forEach((d) => {
      mobileRender(d);
      desktopRender(d);
    });
    if (error) {
      console.log(error);
    }
  }

  function desktopRender(d) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>
                <span class="table-item-emoji">📦</span>
                <span class="table-item-name">${d.objName}</span>
            </td>
            <td>${d.objCode}</td>
            <td>${d.objLocal}</td>
            <td><span class="item-badge">${d.objState}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon editObjBtn" title="Editar" data-code="${d.objCode}"><i data-lucide="pencil"></i></button>
                    <button class="btn-icon danger deleteObjBtn" title="Excluir" data-code="${d.objCode}"><i data-lucide="trash-2"></i></button>
                </div>
            </td>
        `;


    dataTableBody.appendChild(tr);
    lucide.createIcons();
    document.querySelectorAll('.editObjBtn').forEach((b) => {
      b.addEventListener('click', (e) => {
        const objCode = e.currentTarget.dataset.code;
        editObjShow(objCode);
        oldC = objCode;
      });
    });

    document.querySelectorAll('.deleteObjBtn').forEach((b) => {
      b.addEventListener('click', (e) => {
        const objCode = e.currentTarget.dataset.code;
        deleteObj(objCode);
      });
    });

    supabaseC.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        document.querySelectorAll('.btn-icon').forEach((bi) => {
          bi.disabled = false;
          bi.style = 'opacity: 1; cursor: pointer';
          bi.title = ''
        });
      } else {
        document.querySelectorAll('.btn-icon').forEach((bi) => {
          bi.disabled = true;
          bi.style = 'opacity: 0.5; cursor: not-allowed';
          bi.title = 'Faça login para realizar essa ação'
        });
      }
    });
  }

  function mobileRender(d) {
    const div = document.createElement("div");
    div.classList.add("recent-item");
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
        avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture,
      };

      document.getElementById("headerAvatarIcon").style.display = "none";
      document.getElementById("AvatarIconBottom").style.display = "none";
      heroGreeting.innerText = `Olá, ${userInfo.name}!`;
      if (userInfo.avatar_url) {
        headerAvatarIcon.style.display = "none";
        headerAvatarImg.style.display = "block";
        headerAvatarImg.src = userInfo.avatar_url;
        AvatarIconBottom.style.display = "none";
        AvatarImgBottom.style.display = "block";
        AvatarImgBottom.src = userInfo.avatar_url;
      }

      loginBanner.style.display = "none";

      btnAddItem.disabled = false;
      btnAddItem.style.opacity = "1";
      btnAddItem.style.cursor = "pointer";
      btnAddItem.title = "Adicionar mais itens.";

      userName.textContent = userInfo.name;
      userRole.textContent = "Administrador";

    } else {
      heroGreeting.innerText = "Olá, visitante!";
      headerAvatarImg.style.display = "none";
      AvatarImgBottom.style.display = "none";
      document.getElementById("AvatarIconBottom").style.display = "block";
      loginBanner.style.display = "flex";

      btnAddItem.disabled = true;
      btnAddItem.style.opacity = "0.5";
      btnAddItem.style.cursor = "not-allowed";
      btnAddItem.title = "Faça login para adicionar mais itens.";

      userName.textContent = 'Olá, visitante!';
      userRole.textContent = "Visitante";
    }
  });

  function logout() {
    const { error } = supabaseC.auth.signOut();
    if (error) {
      console.log("Erro ao sair:", error);
    } else {
      addForm.style.display = 'none';
      document.querySelectorAll(".app-wrapper .page").forEach((bpa) => {
        bpa.classList.remove("active");
      });
      document.querySelector(`.app-wrapper [data-page="inicio"]`).classList.add("active");

      pages.forEach((p) => {
        p.classList.remove('active');
      });
      document.querySelector('aside [data-page="inicio"]').classList.add('active');

      bottomNavItem.forEach((b) => {
        b.classList.remove("active");
      });
      document.querySelector(`[data-nav="inicio"]`).classList.add("active");
    }
  }

  let imgn = null;

  async function saveObj(name, code, local, state, obs, imageName, image) {
    if (imageName != null && image) {

      const { data: upoloadData, error: uploadError } = await supabaseC.storage
        .from("codeReaderImgFiles")
        .upload(`private/${imageName}`, image);

      if (uploadError) {
        alert(`Erro ao salvar imagem: ${uploadError}`);
        return;
      }

      const { data: urlData } = await supabaseC.storage
        .from("codeReaderImgFiles")
        .getPublicUrl(`private/${imageName}`);
      if (urlData) {
        imgn = urlData.publicUrl;
      }

      const { error } = await supabaseC.from("ObjInfo").insert({
        objCode: code,
        objName: name,
        objState: state || "Descinhecido",
        objLocal: local || "Desconhecido",
        objObs: obs || "Sem observações",
        img_url: imgn || "Sem imagem",
      });
      if (error) {
        console.log(error);
        alert(`Erro ao salvar o objeto. ${error}`);
      } else {
        addForm.style.display = "none";

        objNameInput.value = "";
        objCodeInput.value = "";
        objLocalInput.value = "";
        objObsInput.value = "";

        dataTableBody.innerHTML = "";
        dataList.innerHTML = '';
        loadObjects();

        btnSave.innerHTML = '<i data-lucide="save"></i> Salvar item'
        btnSave.style = "opacity: 1; cursor: cursor";
        btnSave.disabled = false;
      }
    } else {
      const { error } = await supabaseC.from("ObjInfo").insert({
        objCode: code,
        objName: name,
        objState: state || "Descinhecido",
        objLocal: local || "Desconhecido",
        objObs: "Sem observações",
        img_url: "Sem imagem",
      });
      if (error) {
        console.log(error);
        alert(`Erro ao salvar o objeto. ${error}`);
      } else {
        addForm.style.display = "none";

        objNameInput.value = "";
        objCodeInput.value = "";
        objLocalInput.value = "";
        objObsInput.value = "";

        dataTableBody.innerHTML = "";
        dataList.innerHTML = '';
        loadObjects();

        btnSave.innerHTML = '<i data-lucide="save"></i> Salvar item'
        btnSave.style = "opacity: 1; cursor: cursor";
        btnSave.disabled = false;
      }
    }
    btnSave.innerHTML = '<i data-lucide="save"></i> Salvar item'
    btnSave.style = "opacity: 1; cursor: cursor";
    btnSave.disabled = false;
  }

  async function updateObjInfo(oldC, name, code, local, state, obs) {
    const { data, error } = await supabaseC.from('ObjInfo').update({
      objCode: code,
      objName: name,
      objState: state || 'Desconhecido',
      objLocal: local || 'Desconhecido',
      objObs: obs || 'Sem observações'
    }).eq('objCode', oldC);

    if (error) {
      alert(`Não foi possível atualizar as informações do objeto: ${error}`);
      console.log(error);
      return;
    }

    editForm.style.display = 'none';

    dataTableBody.innerHTML = '';
    dataList.innerHTML = '';
    loadObjects();

    btnSaveEdit.innerHTML = '<i data-lucide="save"></i> Atualizar item'
    btnSaveEdit.style = "opacity: 1; cursor: cursor";
    btnSaveEdit.disabled = false;
  }

  async function editObjShow(c) {
    const { data, error } = await supabaseC.from('ObjInfo').select('*').eq('objCode', c);

    if (error) {
      alert(`Erro ao consultar informações do objeto: ${error}`);
      return;
    }

    const objInfo = data[0];

    objNameInputEdit.value = objInfo.objName;
    objCodeInputEdit.value = objInfo.objCode;
    objLocalInputEdit.value = objInfo.objLocal;
    objStateInputEdit.value = objInfo.objState;
    objObsInputEdit.value = objInfo.objObs || 'Sem observações salvas';
    editForm.style.display = 'inline-block';
    addForm.style.display = 'none';
  }

  async function deleteObj(c) {
    const { data, error } = await supabaseC.from('ObjInfo').delete().eq('objCode', c);

    if (error) {
      alert(`Erro ao deletar objeto: ${error}`);
      console.log(error);
      return;
    }

    editForm.style.display = 'none';
    dataTableBody.innerHTML = '';
    loadObjects();
  }

  loadObjects();
  lucide.createIcons();
  loadScanner();

  // ==========================================
  // SISTEMA DE SCANNER (CÂMERA)
  // ==========================================

  // Capturando os botões da interface
  const btnStart = document.getElementById("btnStart");
  const btnStop = document.getElementById("btnStop");
  const resultSpan = document.getElementById("resultSpan");
  const resultDisplay = document.getElementById("objPanel");
  const btnUse = document.getElementById("btnUse");
  const goToBellow = document.getElementById('goToBellow');

  const objPanel = document.getElementById("objPanel");
  const objPanelName = document.getElementById("objName");
  const objPanelCode = document.getElementById("objCode");
  const objPanelLocal = document.getElementById("objLocal");
  const objPanelState = document.getElementById("objState");
  const objPanelImage = document.getElementById("objImage");
  const objPanelObs = document.getElementById('objObs');
  const objLoading = document.getElementById("objLoading");
  const objContent = document.getElementById("objContent");


  let stream = null;
  let barcodeDetector = null;
  let scanInterval = null;
  let scannedCode = "";

  // 1. Verifica se o navegador suporta o leitor nativo
  if (!("BarcodeDetector" in window)) {
    statusMsg.innerText =
      "Navegador não suporta leitura nativa. Use o Chrome no Android.";
    statusMsg.style.color = "var(--red-text)";
    btnStart.disabled = true;

    btnStart.style.opacity = "0.5";
    btnStart.style.cursor = "not-allowed";
    btnStart.disabled = true;
    btnStart.title = "Seu navegador não tem suporte para o Scanner";
  } else {
    barcodeDetector = new BarcodeDetector({
      formats: ["ean_13", "code_128", "qr_code", "upc_a"],
    });

    btnStart.style.opacity = "1";
    btnStart.style.cursor = "cursor";
    btnStart.disabled = false;
    btnStart.title = "Iniciar scanner";
  }

  // 2. Função para Ligar a Câmera
  async function startScanner() {
    try {
      // Pede a câmera traseira (environment)
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      video.srcObject = stream;
      idleScreen.style.display = "none";

      btnStart.style.display = "none";
      btnStop.style.display = "flex";
      objPanel.style.display = "none";
      statusMsg.innerText = "Aponte para o código...";
      video.style.display = "block";

      // Loop que tenta ler o código a cada 500ms
      scanInterval = setInterval(async () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const barcodes = await barcodeDetector.detect(video);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            stopScanner(); // Desliga a câmera na mesma hora

            scannedCode = code;
            resultSpan.innerText = code;
            statusMsg.innerText = "Código capturado!";
            btnUse.style.display = "inline-block";
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
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    btnStart.style.display = "flex";
    btnStop.style.display = "none";
    video.style.display = "none";
    idleScreen.style.display = "flex";
  }

  // Eventos dos botões
  btnStart.addEventListener("click", startScanner);
  btnStop.addEventListener("click", stopScanner);

  // 4. Buscar o Objeto no Supabase!
  btnUse.addEventListener("click", async () => {
    if (!scannedCode) return;

    statusMsg.innerText = "Buscando no banco de dados...";

    const { data, error } = await supabaseC
      .from("ObjInfo")
      .select("*")
      .eq("objCode", scannedCode)
      .single();

    if (error || !data) {
      statusMsg.innerText = "Objeto não encontrado.";
    } else {
      // Objeto encontrado! Mostramos os dados:
      showObjInfo(data);
      statusMsg.innerText = "Pronto para o próximo!";
    }
  });

  function showObjInfo(d) {
    objPanelName.textContent = d.objName;
    objPanelCode.textContent = d.objCode;
    objPanelLocal.textContent = d.objLocal;
    objPanelState.textContent = d.objState;
    objPanelObs.textContent = d.objObs;
    objPanelImage.src =
      d.img_url ||
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx8k7scWzVok_KNTIgvWUIx-eNyftqwOrx9g&s";

    objPanel.style.display = "block";
    objLoading.style.display = "none";
    objContent.style.display = "block";

    goToBellow.click();
  }
});
