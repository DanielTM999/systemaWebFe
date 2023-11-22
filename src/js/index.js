const ids = [
    "listaPedidos", "addnewIng", "deletbnt", "addpditobnt",
    "selectTypePratos", "adicionarItenBtn", "selectPratos",
    "removerIten", "confirmarPedidoBtn", "removerIngredientes",
    "formularioPrato", "pedidoModalLabelalter", "alterarbnt",
    "selectPratosAlter", "selectTypePratosAlter", "addnwitenAlter",
    "selectPratosAlter", "removerItenAlter"
];
const dom = new DomMaster(ids, new Log());
const req = new Request("http://localhost:8080/");
let pedidosList = [];
let pedidosListAlter = [];
let idsRem = [];
let pedidosAlterList = null;
let addListAlter = {
    id: null,
    elementList: pedidosListAlter
}

window.addEventListener("DOMContentLoaded", async () => {
    await getAllPedidos();
})

dom.addAction('click', "addnewIng", () => {
    adicionarIngrediente();
});

dom.addAction('click', "deletbnt", async () => {
    await renderinfoPrato()
});

dom.addAction('click', "addpditobnt", async () => {
    var element = dom.get("selectTypePratos")
    var selectedValue = element.options[element.selectedIndex].value;
    await getPratosByType(selectedValue);
});

dom.addAction('change', "selectTypePratos", async () => {
    var element = dom.get("selectTypePratos")
    var selectedValue = element.options[element.selectedIndex].value;
    await getPratosByType(selectedValue, "selectPratos");
});

dom.addAction('change', "selectTypePratosAlter", async () => {
    var element = dom.get("selectTypePratosAlter")
    var selectedValue = element.options[element.selectedIndex].value;
    await getPratosByType(selectedValue, "selectPratosAlter");
});

dom.addAction('click', "adicionarItenBtn", () => {
    var element = dom.get("selectTypePratos")
    var selectedValue = element.options[element.selectedIndex].value;

    var elementprato = dom.get("selectPratos")
    var selectedValueprato = elementprato.options[elementprato.selectedIndex].value;
    var nomep = selectedValueprato.match(/^(\d+)\/(.+)$/);
    const dados = {
        type: selectedValue,
        name: nomep[2],
        id: nomep[1]
    }

    pedidosList.push(dados)

    renderItensAdicionados(pedidosList, "itensAdicionados");
});

dom.addAction('click', "addnwitenAlter", () => {

    var element = dom.get("selectTypePratosAlter")
    var selectedValue = element.options[element.selectedIndex].value;

    var elementprato = dom.get("selectPratosAlter")
    var selectedValueprato = elementprato.options[elementprato.selectedIndex].value;
    var nomep = selectedValueprato.match(/^(\d+)\/(.+)$/);

    const dados = {
        type: selectedValue,
        name: nomep[2],
        id: nomep[1]
    }

    pedidosListAlter.push(dados)
    renderItensAdicionados(pedidosListAlter, "itensAdicionadosAlter");

})

dom.addAction('click', "removerIten", () => {
    pedidosList.pop();
    renderItensAdicionados(pedidosList, "itensAdicionados");
});

dom.addAction('click', "removerItenAlter", () => {
    pedidosListAlter.pop();
    renderItensAdicionados(pedidosListAlter, "itensAdicionadosAlter");
});

dom.addAction('click', "confirmarPedidoBtn", () => {
    newPedido(pedidosList);
});

dom.addAction('click', "removerIngredientes", () => {
    removerIngrediente()
});

dom.addAction('submit', "formularioPrato", async (event) => {
    event.preventDefault();
    var nomePrato = document.getElementById("nomePrato").value;
    var tipoPrato = document.getElementById("tipoPrato").value;
    var ingredientes = document.getElementsByName("ingredientes");
    var listaIngredientes = [];
    for (var i = 0; i < ingredientes.length; i++) {
        listaIngredientes.push(ingredientes[i].value);
    }

    const dto = {
        nomePrato: nomePrato,
        type: tipoPrato,
        ingredientes: listaIngredientes
    }

    const status = await req.url("add/prato")
        .post()
        .json()
        .cors()
        .body(dto)
        .origenReq()
    .send()

    req.clear()
    if(status.status === 400){
        var string = await status.text();
        exibirErro(string, "erroSectionprato");
        dom.timerDef(3500, ocultarErro, "erroSectionprato");
    }else{
        $('#pratoModal').modal('hide');
    }



})

dom.addAction("click", "alterarbnt", async () => {
    await updateWithAdd();
    try {
        isValidObject(pedidosAlterList);
        req.clear()
        const r = await req.url("alter/comanda")
            .post()
            .json()
            .cors()
            .body(pedidosAlterList)
            .origenReq()
        .send()

        pedidosAlterList = null;
        idsRem = [];
    } catch (error) {
        
    }
    await ReRender();
    $('#alterModal').modal('hide');
})

async function PratosType() {
    const data = await req.url("info/getTypes/prato")
        .get()
        .cors()
        .send();

    const types = data.types;
    const selectElement = document.getElementById("tipoPrato");
    const selectElementNewP = document.getElementById("selectTypePratos");
    const selectElement1 = document.getElementById("selectTypePratosAlter");

    selectElement.innerHTML = ""
    types.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.text = type;
        selectElement.add(option);
    });

    selectElementNewP.innerHTML = ""
    types.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.text = type;
        selectElementNewP.add(option);
    });
    

    selectElement1.innerHTML = ""
    types.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.text = type;
        selectElement1.add(option);
    });

    req.clear()

}

function render(elements) {
    const listaPedidosElement = dom.get("listaPedidos")

    listaPedidosElement.innerHTML = '';

    elements.forEach(element => {
        const row = listaPedidosElement.insertRow();
        const idCell = row.insertCell(0);
        const dataCell = row.insertCell(1);
        const itensCell = row.insertCell(2);
        const actionsCell = row.insertCell(3);

        idCell.textContent = element.id;
        dataCell.textContent = element.data;

        const itensList = document.createElement('ul');
        element.itens.forEach(item => {
            const itemLi = document.createElement('li');
            itemLi.textContent = `${item.tipo}: ${item.descricao}`;
            itensList.appendChild(itemLi);
        });
        itensCell.appendChild(itensList);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Deletar';
        deleteButton.classList.add('btn', 'btn-danger', 'mr-1');
        deleteButton.addEventListener('click', async () => {
            await deletePedido(element.id);
        })

        const updateButton = document.createElement('button');
        updateButton.textContent = 'Alterar';
        updateButton.classList.add('btn', 'btn-warning');
        updateButton.addEventListener('click', () => updatePedido(element.id));

        actionsCell.appendChild(deleteButton);
        actionsCell.appendChild(updateButton);
    });
}

async function renderinfoPrato() {
    const pratoReq = new Request("http://localhost:8080/");
    const data = await pratoReq.url("info/get/pratos")
        .get()
        .cors()
        .send();

    pratoReq.clear()

    const pratos = data.pratos;
    showDeleteModal(pratos);
}

async function updatePedido(id) {
    req.clear()
    idsRem = []

    const data = await req.url("info/get/comanda/byid/"+id)
        .get()
        .cors()
    .send();

    dom.get("pedidoModalLabelalter").innerHTML = "Alterar pedido: " + data.id;
    addListAlter.id = data.id
    addItemToAlterList(data);

    $('#alterModal').modal('show');
}

async function deletePedido(id) {
    req.clear();
    await req.url("delete/pedido/" + id)
        .delete()
        .json()
        .cors()
        .noReturn()
        .send();

    await getAllPedidos()

}

function adicionarIngrediente() {
    var novoIngrediente = document.createElement("li");
    novoIngrediente.innerHTML = '<input type="text" class="form-control" name="ingredientes" required>';
    document.getElementById("listaIngredientes").appendChild(novoIngrediente);
}

function removerIngrediente() {
    var listaIngredientes = document.getElementById("listaIngredientes");
    var ultimosIngredientes = listaIngredientes.getElementsByTagName("li");

    if (ultimosIngredientes.length > 0) {
        listaIngredientes.removeChild(ultimosIngredientes[ultimosIngredientes.length - 1]);
    }
}

function showDeleteModal(pratos) {
    const deleteModal = $('#deleteModal');
    const modalBody = deleteModal.find('#deletePratoBody');
    modalBody.empty();

    pratos.forEach(prato => {
        const div = $('<div class="mb-4"></div>');
        div.append(`<p>Nome do Prato: <span id="deletePratoNome">${prato.nome}</span></p>`);

        if (prato.ingredientes && prato.ingredientes.length > 0) {
            const ul = $('<ul></ul>');
            prato.ingredientes.forEach(ingrediente => {
                ul.append(`<li>${ingrediente}</li>`);
            });
            div.append('<div id="deletePratoIngredientes"><p>Ingredientes:</p></div>');
            div.find('#deletePratoIngredientes').append(ul);
        } else {
            div.append('<div id="deletePratoIngredientes"><p>Ingredientes: Nenhum</p></div>');
        }

        const deleteButton = $('<button type="button" class="btn btn-danger">Deletar Prato</button>');
        deleteButton.on('click', () => deletePrato(prato.id));
        div.append(deleteButton);

        modalBody.append(div);
    });
}

function deletePrato(id) {
    req.url("delete/prato/" + id)
        .delete()
        .json()
        .cors()
        .noReturn()
        .send();
    $('#deleteModal').modal('hide');
}

function renderItensAdicionados(object, id) {

    var itensAdicionadosDiv = document.getElementById(id);
    itensAdicionadosDiv.innerHTML = "";
    object.forEach(element => {
        var type = element.type
        var nome = element.name
        var paragrafo = document.createElement("p");
        paragrafo.textContent = type + ": " + nome;
        itensAdicionadosDiv.appendChild(paragrafo);
    });
}

async function getPratosByType(type, id) {
    const pratoReq = new Request("http://localhost:8080/");
    const data = await pratoReq.url("info/get/pratos/bytype/" + type)
        .get()
        .cors()
        .send();

    const pratos = data.pratos;
    renderpratosSelect(pratos, id)
}

function renderpratosSelect(list, id) {
    if (!Array.isArray(list)) {
        throw new Error("A lista não é um array!");
    }

    var selectElement = document.getElementById(id);
    selectElement.innerHTML = '';
    list.forEach(element => {
        var option = document.createElement("option");
        option.value = element.id + "/" + element.nome;
        option.text = element.nome;
        selectElement.add(option);
    });

}

async function newPedido(pedidos) {
    req.clear()
    const dto = {
        pedidos: pedidos
    }

    const data = await req.url("add/pedido")
        .post()
        .json()
        .cors()
        .body(dto)
        .origenReq()
    .send();

    if(data.status === 400){
        var string = await data.text();
        exibirErro(string, "erroSection");
        dom.timerDef(3500, ocultarErro, "erroSection")
    }else{
        await getAllPedidos();
        $('#pedidoModal').modal('hide');
    }

}

async function getAllPedidos() {
    const pratoReq = new Request("http://localhost:8080/");
    const data = await pratoReq.url("info/get/pedidos")
        .get()
        .cors()
    .send();

    const pedidosList = data.listaPedidos;
    render(pedidosList);
}

function exibirErro(mensagem, id) {
    var erroSection = document.getElementById(id);
    erroSection.innerHTML = mensagem;
    erroSection.style.display = "block";
}

function ocultarErro(id) {
    var erroSection = document.getElementById(id);
    erroSection.innerHTML = "";
    erroSection.style.display = "none";
}

function addItemToAlterList(items) {
    var lista = document.getElementById("listaItensAlterar");
    lista.innerHTML = ""; 
    let cout = 1;

    items.pratoinfos.forEach(function (itemText) {
        var novoItem = document.createElement("li");
        novoItem.className = "list-group-item d-flex justify-content-between align-items-center";

        var textoItem = document.createTextNode("pedido n°: "+cout+" -> "+itemText.nome);

        var botaoExcluir = document.createElement("span");
        botaoExcluir.className = "badge badge-danger badge-pill";
        botaoExcluir.textContent = "X";
        botaoExcluir.onclick = function () {
            removeElementAlter(itemText, items)
        };

        novoItem.appendChild(textoItem);
        novoItem.appendChild(botaoExcluir);

        lista.appendChild(novoItem);
        cout++;
    });
}

function removeElementAlter(target, list){
    let array = list.pratoinfos;
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if(element.id === target.id){
            array.splice(index, 1);
            idsRem.push(element.id);
        }
        
    }

    list.pratoinfos = array;
    pedidosAlterList = list;
    pedidosAlterList["removes"] =  idsRem;
    addItemToAlterList(pedidosAlterList)

}

function isValidObject(object){
    if(object === null || object == undefined){
        throw new Error("objeto invalido");
    }
}

async function ReRender(){
    const pratoReq = new Request("http://localhost:8080/");
    const data = await pratoReq.url("info/get/pedidos")
        .get()
        .cors()
    .send();

    const pedidosListr = data.listaPedidos;
    render(pedidosListr)
}

async function updateWithAdd(){
    const r = await req.url("alter/comanda/add")
        .post()
        .json()
        .cors()
        .body(addListAlter)
        .origenReq()
    .send();

    addListAlter = {
        id: null,
        elementList: pedidosListAlter
    }
}


PratosType();

