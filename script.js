
/* ================= DADOS ================= */

let emprestimos = [];

let totalRecebido = 0;

/* ================= STORAGE ================= */

function salvarDados() {

  localStorage.setItem(
    "emprestimos",
    JSON.stringify(emprestimos)
  );
  localStorage.setItem(
    "totalRecebido",
    totalRecebido
  );
}

function carregarDados() {

  const dados =
    localStorage.getItem("emprestimos");

  if (dados) {

    emprestimos = JSON.parse(dados);
  }
  const tr =
    localStorage.getItem("totalRecebido");

  if (tr)
    totalRecebido = parseFloat(tr);
}

/* ================= DATA ================= */

function formatarData(data) {

  return new Date(data)
    .toLocaleDateString("pt-BR");
}

function calcularVencimento(data, dias) {

  let nova = new Date(data);

  nova.setDate(
    nova.getDate() + parseInt(dias)
  );

  return nova;
}

function diasRestantes(data) {

  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

  const venc = new Date(data);

  venc.setHours(0, 0, 0, 0);

  const diff =
    venc - hoje;

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  );
}

/* ================= RESUMO ================= */

function atualizarResumo() {

  let totalEmprestado = 0;

  let totalReceber = 0;

  let ativos = 0;

  emprestimos.forEach(e => {

    if (!e.pago) {

      totalEmprestado += parseFloat(e.valor);

      totalReceber += parseFloat(e.valorReceber);

      ativos++;
    }
  });

  document.getElementById("totalEmprestado")
    .innerText =
    totalEmprestado.toFixed(2);

  document.getElementById("totalReceber")
    .innerText =
    totalReceber.toFixed(2);

  document.getElementById("totalAtivos")
    .innerText = ativos;

  document.getElementById("totalRecebido").innerText = totalRecebido.toFixed(2);
}

/* ================= ADICIONAR ================= */

function adicionarEmprestimo(){

  let nome =
    document.getElementById("nome").value;

  let data =
    document.getElementById("data").value;

  let valor =
    parseFloat(
      document.getElementById("valor").value
    );

  let juros =
    parseFloat(
      document.getElementById("juros").value
    );

  let vencimento =
    document.getElementById("vencimento").value;

  let garantia =
    document.getElementById("garantia").value;

  if(
    !nome ||
    !data ||
    !valor ||
    !juros ||
    !vencimento
  ){

    alert("Preencha todos os campos");

    return;
  }

  let valorReceber =

    valor +

    (valor * juros / 100);

  emprestimos.push({

    nome:nome,

    data:data,

    valor:valor,

    juros:juros,

    vencimento:vencimento,

    valorReceber:valorReceber,

    garantia:garantia,

    pago:false,

    historicoJuros:[]

  });

  salvarDados();

  renderizar();

  // limpa campos

  document.getElementById("nome").value = "";

  document.getElementById("data").value = "";

  document.getElementById("valor").value = "";

  document.getElementById("juros").value = "";

  document.getElementById("vencimento").value = "";

  document.getElementById("garantia").value = "";
}



/* ================= LIMPAR ================= */

function limparCampos() {

  document.getElementById("nome").value = "";

  document.getElementById("valor").value = "";

  document.getElementById("juros").value = "";

  document.getElementById("periodo").value = "";
}

/* ================= PAGAMENTO ================= */
/*
function marcarPago(index){

  let e = emprestimos[index];

  // evita duplicidade

  if(e.pago){

    alert("Empréstimo já foi pago");

    return;
  }

  // soma no total recebido

  totalRecebido +=
    parseFloat(e.valorReceber);

  // marca como pago

  e.pago = true;

  salvarDados();

  renderizar();
}
*/
function marcarPago(index) {

  if (!confirm(
    "Confirmar quitação do empréstimo?"
  )) {
    return;
  }

  let e = emprestimos[index];

  // evita duplicidade

  if (e.pago) {

    alert("Empréstimo já foi pago");

    return;
  }

  // soma recebido

  totalRecebido +=
    parseFloat(e.valorReceber);

  // marca pago

  e.pago = true;

  salvarDados();

  renderizar();
}
/* ================= REMOVER ================= */


function remover(index) {

  if (!confirm(
    "Deseja realmente remover este empréstimo?"
  )) {
    return;
  }

  let e = emprestimos[index];

  // se estava pago remove do total recebido

  if (e.pago) {

    totalRecebido -=
      parseFloat(e.valorReceber);
  }

  // remove juros pagos do total recebido

  if (e.historicoJuros) {

    e.historicoJuros.forEach(j => {

      totalRecebido -=
        parseFloat(j.valor);

    });
  }

  // evita negativo

  if (totalRecebido < 0) {

    totalRecebido = 0;
  }

  emprestimos.splice(index, 1);

  salvarDados();

  renderizar();
}
/* ================= RENDER ================= */



function renderizar() {

  const lista =
    document.getElementById("listaClientes");

  lista.innerHTML = "";

  [...emprestimos]

    .sort((a, b) => {

      const diasA =
        diasRestantes(a.vencimento);

      const diasB =
        diasRestantes(b.vencimento);

      // PAGOS ficam por último

      if (a.pago && !b.pago) return 1;
      if (!a.pago && b.pago) return -1;

      // ATRASADOS primeiro

      if (diasA < 0 && diasB >= 0) return -1;
      if (diasA >= 0 && diasB < 0) return 1;

      // VENCE HOJE antes dos demais

      if (diasA === 0 && diasB > 0) return -1;
      if (diasA > 0 && diasB === 0) return 1;

      // MAIS RECENTES primeiro

      return new Date(b.data) - new Date(a.data);

    })

    .forEach((e, revIndex) => {

      // CORREÇÃO PARA DADOS ANTIGOS

      if (!e.historicoJuros) {

        e.historicoJuros = [];
      }

      const index =
        emprestimos.indexOf(e);

      const dias =
        diasRestantes(e.vencimento);

      let classe = "";

      let status = "";

      if (e.pago) {

        classe = "pago";

        status =
          `<div class="status emDia">
          ✅ Pago
        </div>`;

      } else if (dias === 0) {

        classe = "vencendoHoje";

        status =
          `<div class="status atrasado">
          ⚠️ Vence Hoje
        </div>`;

      } else if (dias < 0) {

        classe = "vencendoHoje";

        status =
          `<div class="status atrasado">
          🔴 Atrasado ${Math.abs(dias)} dia(s)
        </div>`;

      } else {

        status =
          `<div class="status emDia">
          🟢 ${dias} dia(s) restantes
        </div>`;
      }

      lista.innerHTML += `

      <div class="cliente ${classe}">

        <div class="titulo">
          ${e.nome}
        </div>

        <div class="info">
          📅 Empréstimo:
          ${formatarData(e.data)}
        </div>

        <div class="info">
          💵 Valor:
          R$ ${parseFloat(e.valor).toFixed(2)}
        </div>

        <div class="info">
            🔒 Garantia:
            ${e.garantia || "-"}
        </div>

        <div class="info">
          📈 Juros:
          ${e.juros}%
        </div>

        <div class="info">
          🏦 Receber:
          R$ ${parseFloat(e.valorReceber).toFixed(2)}
        </div>

        <div class="info">
          ⏳ Prazo:
          ${e.periodo} dias
        </div>

        <div class="info">
          📆 Vencimento:
          ${formatarData(e.vencimento)}
        </div>

        <div class="info">
          💸 Juros pagos:
          ${(e.historicoJuros || []).length}
        </div>

        ${status}

        <div class="botoes">

          <button
            class="btnJuros"
            onclick="pagarJuros(${index})">

            Pagou Juros

          </button>

          <button
            class="btnPago"
            onclick="marcarPago(${index})">

            Pago

          </button>

          <button
            class="btnRemover"
            onclick="remover(${index})">

            Remover

          </button>

        </div>

      </div>

    `;
    });

  atualizarResumo();
}

function fazerBackup() {

  const dados = {

    emprestimos: emprestimos

  };

  const blob = new Blob(

    [JSON.stringify(dados, null, 2)],

    { type: "application/json" }

  );

  const a =
    document.createElement("a");

  a.href =
    URL.createObjectURL(blob);

  a.download =
    "backup_emprestimos.json";

  a.click();
}
function restaurarBackup(event) {

  const arquivo =
    event.target.files[0];

  if (!arquivo) return;

  const reader = new FileReader();

  reader.onload = function (e) {

    const dados =
      JSON.parse(e.target.result);

    emprestimos =
      dados.emprestimos || [];

    salvarDados();

    renderizar();

    alert("Backup restaurado!");
  };

  reader.readAsText(arquivo);
}
/*
function pagarJuros(index){

  let e = emprestimos[index];

  if(e.pago){

    alert("Empréstimo já quitado");

    return;
  }
*/

function pagarJuros(index) {

  if (!confirm(
    "Confirmar pagamento dos juros?"
  )) {
    return;
  }

  // pega empréstimo

  let e = emprestimos[index];

  // verifica se já foi pago

  if (e.pago) {

    alert("Empréstimo já quitado");

    return;
  }

  // cria histórico caso não exista

  if (!e.historicoJuros) {

    e.historicoJuros = [];
  }

  // calcula juros

  let valorJuros =

    parseFloat(e.valorReceber) -

    parseFloat(e.valor);

  // salva histórico

  e.historicoJuros.push({

    data: new Date().toLocaleString(),

    valor: valorJuros

  });

  // soma no total recebido

  totalRecebido += valorJuros;

  // pega vencimento atual

  let novaData = prompt(
    "Nova data de vencimento:",
    e.vencimento
  );

  if (!novaData) {

    return;
  }

  e.vencimento = novaData;

  salvarDados();

  renderizar();

  alert(

    "Juros pagos com sucesso!\n\n" +

    "Novo vencimento: " +

    novaData

  );
}

function toggleFormulario() {

  const form =
    document.getElementById("formulario");

  const btn =
    document.getElementById("btnNovo");

  if (form.style.display === "none") {

    form.style.display = "block";

    btn.innerText =
      "Fechar Formulário";

  } else {

    form.style.display = "none";

    btn.innerText =
      "+ Novo Empréstimo";
  }
  adicionarEmprestimo()
}
const SENHA_APP = "1234";


function enterLogin(event) {

  if (event.key === "Enter") {

    fazerLogin();
  }
}

function fazerLogin() {

  const senha =
    document.getElementById("senhaLogin").value;

  // senha salva

  let senhaSalva =
    localStorage.getItem("senhaSistema");

  // PRIMEIRO ACESSO

  if (!senhaSalva) {

    if (senha.length < 4) {

      alert(
        "Crie uma senha com pelo menos 4 números"
      );

      return;
    }

    localStorage.setItem(
      "senhaSistema",
      senha
    );

    alert("Senha criada com sucesso!");

    abrirSistema();

    return;
  }

  // LOGIN NORMAL

  if (senha === senhaSalva) {

    abrirSistema();

  } else {

    alert("Senha incorreta");
  }
}

function abrirSistema() {

  document
    .getElementById("loginTela")
    .style.display = "none";

  document
    .getElementById("sistema")
    .style.display = "block";
}

function enterLogin(event) {

  if (event.key === "Enter") {

    fazerLogin();
  }
}

const senhaExiste =
  localStorage.getItem("senhaSistema");

if (!senhaExiste) {

  document
    .getElementById("tituloLogin")
    .innerText =
    "🔑 Crie sua senha";
}

function limparDados() {

  const senha =
    prompt(
      "Digite sua senha para apagar os dados:"
    );

  // senha salva

  const senhaSalva =
    localStorage.getItem("senhaSistema");

  if (senha !== senhaSalva) {

    alert("Senha incorreta");

    return;
  }

  if (!confirm(
    "TODOS os empréstimos serão apagados.\n\nContinuar?"
  )) {
    return;
  }

  // limpa apenas os dados do sistema

  emprestimos = [];

  totalRecebido = 0;

  // remove apenas dados específicos

  localStorage.removeItem("emprestimos");

  localStorage.removeItem("totalRecebido");

  salvarDados();

  renderizar();

  atualizarResumo();

  alert("Dados apagados com sucesso!");
}
/* ================= INIT ================= */

carregarDados();

renderizar();

toggleFormulario();


