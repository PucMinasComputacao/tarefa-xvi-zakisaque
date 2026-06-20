// --- CONFIGURAÇÕES ---
const API_URL = "http://localhost:3000/itens";
const USUARIO_KEY = "usuarioCorrente";

let itens = [];
let itemEmEdicao = null;

// Inicializa a aplicação ao carregar
document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = JSON.parse(sessionStorage.getItem(USUARIO_KEY));
    if (!usuarioLogado) {
        window.location.href = "login.html";
        return;
    }
    
    mostrarUsuario(usuarioLogado);
    configurarFormulario();
    carregarItens();
});

// --- FUNÇÕES DE API (CRUD) ---

// READ: Busca itens no servidor
async function carregarItens() {
    try {
        const resposta = await fetch(API_URL);
        itens = await resposta.json();
        renderizarItens();
        renderizarFavoritos();
    } catch (erro) {
        console.error("Erro ao carregar itens:", erro);
    }
}

// CREATE e UPDATE: Salva ou edita item
async function salvarItem(evento) {
    evento.preventDefault();
    const titulo = document.getElementById("titulo").value;
    const descricao = document.getElementById("descricao").value;

    const item = { titulo, descricao };
    const metodo = itemEmEdicao ? "PUT" : "POST";
    const url = itemEmEdicao ? `${API_URL}/${itemEmEdicao}` : API_URL;

    await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
    });

    limparFormulario();
    carregarItens(); // Recarrega a lista após salvar
}

// DELETE: Remove item
async function excluirItem(id) {
    if (!confirm("Deseja excluir?")) return;
    
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    carregarItens();
}

// --- LÓGICA DE UI E DOM ---

function configurarFormulario() {
    const form = document.getElementById("formItem");
    if(form) form.addEventListener("submit", salvarItem);
}

function renderizarItens() {
    const container = document.getElementById("listaItens");
    if (!container) return;
    
    container.innerHTML = itens.map(item => `
        <article class="card-item">
            <h3>${item.titulo}</h3>
            <p>${item.descricao}</p>
            <div class="acoes-card">
                <a href="detalhes.html?id=${item.id}">Detalhes</a>
                <button onclick="prepararEdicao(${item.id})">Editar</button>
                <button onclick="excluirItem(${item.id})">Excluir</button>
            </div>
        </article>
    `).join("");
}

function prepararEdicao(id) {
    itemEmEdicao = id;
    const item = itens.find(i => i.id == id);
    document.getElementById("titulo").value = item.titulo;
    document.getElementById("descricao").value = item.descricao;
    document.getElementById("textoBotaoSalvar").textContent = "Atualizar";
}

function limparFormulario() {
    itemEmEdicao = null;
    document.getElementById("formItem").reset();
    document.getElementById("textoBotaoSalvar").textContent = "Cadastrar item";
}

// --- FUNÇÕES DE LOGIN (Mantidas do seu original) ---
function mostrarUsuario(user) {
    const el = document.getElementById("mensagemUsuario");
    if(el) el.textContent = `Olá, ${user.nome}`;
}

function logoutUser() {
    sessionStorage.removeItem(USUARIO_KEY);
    window.location.href = "login.html";
}

function renderizarFavoritos() {
    const listaFavoritos = document.getElementById("listaFavoritos");
    const mensagemFavoritos = document.getElementById("mensagemFavoritos");

    if (!listaFavoritos) return;

    // Recupera os IDs dos favoritos do localStorage (conforme seu código anterior)
    const favoritos = JSON.parse(localStorage.getItem(`favoritos_usuario_${usuarioCorrente.id}`)) || [];
    
    // Filtra os itens vindo do JSON Server que estão nos favoritos
    const itensFavoritos = itens.filter(item => favoritos.includes(String(item.id)));

    listaFavoritos.innerHTML = itensFavoritos.length > 0 
        ? itensFavoritos.map(item => `
            <article class="card-item">
                <h3>${item.titulo}</h3>
                <p>${item.descricao}</p>
                <a href="detalhes.html?id=${item.id}">Ver detalhes</a>
            </article>
        `).join("") 
        : "<p>Você ainda não tem favoritos.</p>";

    if (mensagemFavoritos) {
        mensagemFavoritos.textContent = itensFavoritos.length > 0 ? "" : "Nenhum favorito selecionado.";
    }
}