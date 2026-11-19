/* ===== Dados dos produtos ===== */
const produtos = [
  { id: 1, nome: "Perfume Floral Aurora 100ml", cat: "Perfumes", publico: "Adulto", preco: 189.90, emoji: "🌺" },
  { id: 2, nome: "Perfume Amadeirado Noir 100ml", cat: "Perfumes", publico: "Adulto", preco: 219.90, emoji: "🖤" },
  { id: 3, nome: "Batom Cremoso Rosé", cat: "Maquiagem", publico: "Adulto", preco: 39.90, emoji: "💄" },
  { id: 4, nome: "Paleta de Sombras Dourada", cat: "Maquiagem", publico: "Adulto", preco: 79.90, emoji: "🎨" },
  { id: 5, nome: "Creme Hidratante Facial", cat: "Cuidados", publico: "Adulto", preco: 64.90, emoji: "🧴" },
  { id: 6, nome: "Sabonete Líquido de Lavanda", cat: "Cuidados", publico: "Adulto", preco: 24.90, emoji: "💜" },
  { id: 7, nome: "Colônia Infantil Algodão-Doce", cat: "Infantil", publico: "Infantil", preco: 49.90, emoji: "🍭" },
  { id: 8, nome: "Shampoo Infantil Sem Lágrimas", cat: "Infantil", publico: "Infantil", preco: 29.90, emoji: "🧸" },
  { id: 9, nome: "Kit Brilho e Glitter Kids", cat: "Infantil", publico: "Infantil", preco: 34.90, emoji: "🦄" }
];

/* ===== Estado ===== */
let carrinho = [];       // [{ id, qtd }]
let cupomAtivo = false;  // cupom LUMINA10 aplicado?

// Carrega o carrinho salvo no navegador (se existir)
try {
  carrinho = JSON.parse(localStorage.getItem("luminaCarrinho")) || [];
  cupomAtivo = localStorage.getItem("luminaCupom") === "1";
} catch (e) { carrinho = []; }

/* ===== Funções auxiliares ===== */
const $ = (id) => document.getElementById(id);
const moeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Mostra uma mensagem temporária na tela
function aviso(texto) {
  const t = $("toast");
  t.textContent = texto;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// Gera o HTML de um cartão de produto
function cardProduto(p) {
  return `
    <article class="card">
      <div class="img">${p.emoji}</div>
      <div class="body">
        <span class="tag">${p.cat}</span>
        <h3>${p.nome}</h3>
        <p class="preco">${moeda(p.preco)}</p>
        <button class="btn btn-small" data-add="${p.id}">Adicionar ao carrinho</button>
      </div>
    </article>`;
}

/* ===== FUNCIONALIDADE 1: Loja com filtros ===== */
function mostrarProdutos(categoria) {
  const lista = categoria === "todos" ? produtos : produtos.filter(p => p.cat === categoria);
  $("productGrid").innerHTML = lista.map(cardProduto).join("");
}

$("filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  mostrarProdutos(btn.dataset.cat);
});

// Clique em "Adicionar ao carrinho" (vale para a loja e para o simulador)
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  const id = Number(btn.dataset.add);
  const item = carrinho.find(i => i.id === id);
  if (item) item.qtd++; else carrinho.push({ id, qtd: 1 });
  atualizarCarrinho();
  aviso("Produto adicionado ao carrinho! 🛍️");
});

/* ===== Carrinho ===== */
function atualizarCarrinho() {
  const area = $("cartItems");
  if (carrinho.length === 0) {
    area.innerHTML = "<p class='center'>Seu carrinho está vazio.</p>";
  } else {
    area.innerHTML = carrinho.map(i => {
      const p = produtos.find(x => x.id === i.id);
      return `
        <div class="item">
          <span class="emoji">${p.emoji}</span>
          <div class="nome">${p.nome}<br><strong>${moeda(p.preco * i.qtd)}</strong></div>
          <div class="qty">
            <button data-menos="${i.id}">−</button>
            <span>${i.qtd}</span>
            <button data-mais="${i.id}">+</button>
          </div>
          <button class="remove" data-remover="${i.id}" title="Remover">🗑️</button>
        </div>`;
    }).join("");
  }

  // Cálculo dos valores
  const subtotal = carrinho.reduce((soma, i) => soma + produtos.find(p => p.id === i.id).preco * i.qtd, 0);
  const desconto = cupomAtivo ? subtotal * 0.10 : 0;
  $("subtotal").textContent = moeda(subtotal);
  $("desconto").textContent = "- " + moeda(desconto);
  $("total").textContent = moeda(subtotal - desconto);
  $("cartCount").textContent = carrinho.reduce((s, i) => s + i.qtd, 0);

  // Salva no navegador
  try {
    localStorage.setItem("luminaCarrinho", JSON.stringify(carrinho));
    localStorage.setItem("luminaCupom", cupomAtivo ? "1" : "0");
  } catch (e) { /* ignora se o navegador bloquear */ }
}

// Botões +, − e remover dentro do carrinho
$("cartItems").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.mais) carrinho.find(i => i.id == b.dataset.mais).qtd++;
  if (b.dataset.menos) {
    const item = carrinho.find(i => i.id == b.dataset.menos);
    item.qtd--;
    if (item.qtd <= 0) carrinho = carrinho.filter(i => i !== item);
  }
  if (b.dataset.remover) carrinho = carrinho.filter(i => i.id != b.dataset.remover);
  atualizarCarrinho();
});

// Abrir e fechar o carrinho
function abrirCarrinho(abrir) {
  $("cart").classList.toggle("open", abrir);
  $("overlay").classList.toggle("show", abrir);
}
$("cartBtn").addEventListener("click", () => abrirCarrinho(true));
$("closeCart").addEventListener("click", () => abrirCarrinho(false));
$("overlay").addEventListener("click", () => abrirCarrinho(false));

// Cupom de desconto
function aplicarCupom(codigo) {
  if (codigo.trim().toUpperCase() === "LUMINA10") {
    cupomAtivo = true;
    atualizarCarrinho();
    aviso("Cupom LUMINA10 aplicado: 10% de desconto! 🎉");
  } else {
    aviso("Cupom inválido. Tente LUMINA10.");
  }
}
$("applyCupom").addEventListener("click", () => aplicarCupom($("cupomInput").value));
$("cupomBtn").addEventListener("click", () => {
  aplicarCupom("LUMINA10");
  $("cupomInput").value = "LUMINA10";
});

// Esvaziar carrinho
$("clearBtn").addEventListener("click", () => {
  carrinho = [];
  cupomAtivo = false;
  atualizarCarrinho();
  aviso("Carrinho esvaziado.");
});

// Finalizar compra (simulação local)
$("checkoutBtn").addEventListener("click", () => {
  if (carrinho.length === 0) { aviso("Adicione produtos antes de finalizar."); return; }
  const total = $("total").textContent;
  carrinho = [];
  cupomAtivo = false;
  atualizarCarrinho();
  abrirCarrinho(false);
  aviso("Pedido realizado! Total: " + total + ". Obrigado por comprar na Lumina! 💖");
});

/* ===== FUNCIONALIDADE 2: Simulador de presente ===== */
$("simBtn").addEventListener("click", () => {
  const publico = $("simPublico").value;
  const orcamento = parseFloat($("simOrcamento").value);
  const area = $("simResultado");

  if (isNaN(orcamento) || orcamento <= 0) {
    area.innerHTML = "<p class='vazio'>Informe um orçamento válido.</p>";
    return;
  }
  const sugestoes = produtos.filter(p => p.publico === publico && p.preco <= orcamento);
  area.innerHTML = sugestoes.length
    ? sugestoes.map(cardProduto).join("")
    : "<p class='vazio'>Nenhum produto neste valor. Tente aumentar o orçamento. 💡</p>";
});

/* ===== FUNCIONALIDADE 3: Formulário com validação ===== */
$("contatoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = $("nome").value.trim();
  const email = $("email").value.trim();
  const msg = $("mensagem").value.trim();
  let ok = true;

  $("erroNome").textContent = nome.length < 3 ? "Digite seu nome (mín. 3 letras)." : "";
  if (nome.length < 3) ok = false;

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  $("erroEmail").textContent = emailValido ? "" : "Digite um e-mail válido.";
  if (!emailValido) ok = false;

  $("erroMsg").textContent = msg.length < 10 ? "A mensagem deve ter ao menos 10 caracteres." : "";
  if (msg.length < 10) ok = false;

  if (ok) {
    aviso("Obrigado, " + nome.split(" ")[0] + "! Mensagem enviada. 💌");
    e.target.reset();
  }
});

/* ===== Menu interativo (celular) ===== */
$("menuBtn").addEventListener("click", () => $("menu").classList.toggle("open"));
$("menu").addEventListener("click", (e) => {
  if (e.target.tagName === "A") $("menu").classList.remove("open");
});

/* ===== Inicialização ===== */
mostrarProdutos("todos");
atualizarCarrinho();
