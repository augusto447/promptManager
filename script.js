//chave para identificar os dados salavos pela nossa aplicação no navegador.
const STORAGE_KEY = "prompts_storage";

//Estados para carregar os prompts salvos  e exibir.
const state = {
  prompts: [],
  selectedId: null,
};

// Seleção dos elementos por id
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  btnSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
};

// Atualiza o estado de um wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0;

  wrapper.classList.toggle("is-empty", !hasText);
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
}

// Adiciona ouvintes de evento input para atualização em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  });
  elements.promptContent.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
  });
  // Atualiza o estado inicial
  updateAllEditableStates();
}

function save() {
  const title = elements.promptTitle.textContent.trim();
  const content = elements.promptContent.innerHTML.trim();
  const hasContent = elements.promptContent.textContent.trim().length > 0;

  if (!title || !content) {
    alert("Título e conteúdo não podem estar vazios.");
    return;
  }

  if (state.selectedId) {
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId);
    if (existingPrompt) {
      existingPrompt.title = title || "Sem título";
      existingPrompt.content = content || "Sem conteúdo";
    }
  } else {
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
    };
    state.prompts.unshift(newPrompt);
    state.selectedId = newPrompt.id;
  }
  persist();
  alert("Prompt salvo com sucesso!");
  renderList(elements.search.value);
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts));
  } catch (error) {
    console.error("Erro ao salvar no localStorage:", error);
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    state.prompts = storage ? JSON.parse(storage) : [];
    state.selectedId = null;
  } catch (error) {
    console.error("Erro ao carregar do localStorage:", error);
  }
}

function createPromptItem(prompt) {
  const tmp = document.createElement("div");
  tmp.innerHTML = prompt.content;
  return `
<li class="prompt-item" data-id="${prompt.id}"data-action="select">
  <div class="prompt-item-content">
    <span class="prompt-item-title">${prompt.title}</span>
    <span class="prompt-item-description">${tmp.textContent}</span
    >
  </div>
  <button class="btn-icon" title="Remover" data-action="remove">
    <img src="assets/remove.svg"alt="Remover"class="icon icon-trash"/>
  </button>
</li>
  `;
}
function renderList(filter = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filter.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("");
  elements.list.innerHTML = filteredPrompts;
}

function newPrompt() {
  state.selectedId = null;
  elements.promptTitle.textContent = "";
  elements.promptContent.textContent = "";
  updateAllEditableStates();
  elements.promptTitle.focus();
}
function copySelected() {
  try {
    const content = elements.promptContent;
    if (!navigator.clipboard) {
      console.error("clipboard API não suportado no navegador.");
      return;
    }

    navigator.clipboard.writeText(content.innerText);
    alert("conteudo copiado para a área de transferência!");
  } catch (error) {
    console.error("Erro ao copiar para a área de transferência:", error);
  }
}

//Eventos.

elements.btnSave.addEventListener("click", save);
elements.btnNew.addEventListener("click", newPrompt);
elements.btnCopy.addEventListener("click", copySelected);
elements.search.addEventListener("input", function (event) {
  renderList(event.target.value);
});

elements.list.addEventListener("click", function (event) {
  const removeBtn = event.target.closest("[data-action='remove']");
  const item = event.target.closest("[data-id]");
  if (!item) return;
  const id = item.getAttribute("data-id");
  state.selectedId = id;

  if (removeBtn) {
    //remover prompt.
    state.prompts = state.prompts.filter((p) => p.id !== id);
    renderList(elements.search.value);
    persist();
    return;
  }
  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id);
    if (prompt) {
      elements.promptTitle.textContent = prompt.title;
      elements.promptContent.innerHTML = prompt.content;
      updateAllEditableStates();
    }
  }
});

// Função de inicialização
function init() {
  load();
  renderList();
  attachAllEditableHandlers();
  // Sidebar: listeners e estado inicial
  const sidebar = document.querySelector(".sidebar");
  function openSidebar() {
    sidebar.style.display = "flex";
    elements.btnOpen.style.display = "none";
  }
  function closeSidebar() {
    sidebar.style.display = "none";
    elements.btnOpen.style.display = "block";
  }
  elements.btnOpen.addEventListener("click", openSidebar);
  elements.btnCollapse.addEventListener("click", closeSidebar);
  // Sidebar começa aberta, btnOpen oculto
  elements.btnOpen.style.display = "none";
}

// Executa a inicialização ao carregar o script
init();
