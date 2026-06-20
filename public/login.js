let usuarios = [];
let usuarioCorrente = {};

const USUARIO_CORRENTE_KEY = "usuarioCorrente";

async function initLoginApp() {
  usuarioCorrente = JSON.parse(sessionStorage.getItem(USUARIO_CORRENTE_KEY)) || {};
  usuarios = await carregarUsuarios();

  const estaNaTelaLogin = window.location.pathname.includes("login.html");

  if (!usuarioCorrente.login && !estaNaTelaLogin) {
    window.location.href = "./login.html";
    return;
  }

  if (usuarioCorrente.login && estaNaTelaLogin) {
    window.location.href = "./index.html";
    return;
  }

  configurarFormularioLogin();
}

async function carregarUsuarios() {
  try {
    const resposta = await fetch("http://localhost:3000/usuarios");

    if (!resposta.ok) {
      throw new Error("Nao foi possivel carregar usuarios do servidor.");
    }

    return await resposta.json();
  } catch (erro) {
    return [
      {
        id: 1,
        nome: "Administrador",
        login: "admin",
        senha: "123",
        email: "admin@email.com"
      },
      {
        id: 2,
        nome: "Usuário",
        login: "user",
        senha: "123",
        email: "user@email.com"
      }
    ];
  }
}

function configurarFormularioLogin() {
  const formLogin = document.getElementById("formLogin");

  if (!formLogin) {
    return;
  }

  formLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const login = document.getElementById("login").value.trim();
    const senha = document.getElementById("senha").value;

    loginUser(login, senha);
  });
}

function loginUser(login, senha) {
  const usuarioEncontrado = usuarios.find(function (usuario) {
    return usuario.login === login && usuario.senha === senha;
  });

  if (!usuarioEncontrado) {
    exibirMensagem("Login ou senha inválidos.", "erro");
    return false;
  }

  usuarioCorrente = {
    id: usuarioEncontrado.id,
    nome: usuarioEncontrado.nome,
    login: usuarioEncontrado.login,
    senha: usuarioEncontrado.senha,
    email: usuarioEncontrado.email
  };

  sessionStorage.setItem(
    USUARIO_CORRENTE_KEY,
    JSON.stringify(usuarioCorrente)
  );

  window.location.href = "./index.html";
  return true;
}

function logoutUser() {
  sessionStorage.removeItem(USUARIO_CORRENTE_KEY);
  window.location.href = "./login.html";
}

function exibirMensagem(texto, tipo) {
  const mensagem = document.getElementById("mensagemLogin");

  if (!mensagem) {
    alert(texto);
    return;
  }

  mensagem.textContent = texto;
  mensagem.className = `mensagem-login ${tipo}`;
}

document.addEventListener("DOMContentLoaded", initLoginApp);