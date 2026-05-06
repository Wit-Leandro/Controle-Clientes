
/* ================= DADOS ================= */

let emprestimos = [];

/* ================= STORAGE ================= */

function salvarDados() {

    localStorage.setItem(
        "emprestimos",
        JSON.stringify(emprestimos)
    );
}

function carregarDados() {

    const dados =
        localStorage.getItem("emprestimos");

    if (dados) {

        emprestimos = JSON.parse(dados);
    }
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
}

/* ================= ADICIONAR ================= */

function adicionarEmprestimo() {

    let nome =
        document.getElementById("nome").value;

    let data =
        document.getElementById("data").value;

    let valor = parseFloat(
        document.getElementById("valor").value
    );

    let juros = parseFloat(
        document.getElementById("juros").value
    );

    let periodo = parseInt(
        document.getElementById("periodo").value
    );

    if (
        !nome ||
        !data ||
        !valor ||
        !juros ||
        !periodo
    ) {

        alert("Preencha todos os campos");

        return;
    }

    let valorReceber =
        valor + (valor * juros / 100);

    let vencimento =
        calcularVencimento(data, periodo);

    emprestimos.push({

        nome: nome,

        data: data,

        valor: valor,

        juros: juros,

        periodo: periodo,

        valorReceber: valorReceber,

        vencimento: vencimento,

        pago: false

    });

    salvarDados();

    renderizar();

    limparCampos();
}

/* ================= LIMPAR ================= */

function limparCampos() {

    document.getElementById("nome").value = "";

    document.getElementById("valor").value = "";

    document.getElementById("juros").value = "";

    document.getElementById("periodo").value = "";
}

/* ================= PAGAMENTO ================= */

function marcarPago(index) {

    emprestimos[index].pago = true;

    salvarDados();

    renderizar();
}

/* ================= REMOVER ================= */

function remover(index) {

    if (confirm("Remover empréstimo?")) {

        emprestimos.splice(index, 1);

        salvarDados();

        renderizar();
    }
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



            const index =
                emprestimos.length - 1 - revIndex;

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

        ${status}

        <div class="botoes">

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

function fazerBackup(){

  const dados = {

    emprestimos: emprestimos

  };

  const blob = new Blob(

    [JSON.stringify(dados,null,2)],

    { type:"application/json" }

  );

  const a =
    document.createElement("a");

  a.href =
    URL.createObjectURL(blob);

  a.download =
    "backup_emprestimos.json";

  a.click();
}
function restaurarBackup(event){

  const arquivo =
    event.target.files[0];

  if(!arquivo) return;

  const reader = new FileReader();

  reader.onload = function(e){

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

/* ================= INIT ================= */

carregarDados();

renderizar();


