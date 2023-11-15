const ids = [
    "listaPedidos", "addnewIng", "deletbnt", "addpditobnt",
    "selectTypePratos", "adicionarItenBtn", "selectPratos",
    "removerIten", "confirmarPedidoBtn", "removerIngredientes"
];
const dom = new DomMaster(ids, new Log());
const req = new Request("http://localhost:8080/");
let pedidosList = [];

const listaPedidos = [
    {
        "id": 1,
        "data": "2023-11-12",
        "itens": [
            { "tipo": "entrada", "descricao": "Salada de Folhas Verdes" },
            { "tipo": "principal", "descricao": "Filé Mignon Grelhado" },
            { "tipo": "sobremesa", "descricao": "Pudim" }
        ]
    }
];

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
    await getPratosByType(selectedValue);
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

    renderItensAdicionados(pedidosList);
});

dom.addAction('click', "removerIten", () => {
    pedidosList.pop();
    renderItensAdicionados(pedidosList);
});

dom.addAction('click', "confirmarPedidoBtn", () => {
    console.log(pedidosList);
});

dom.addAction('click', "removerIngredientes", () => {
    removerIngrediente()
});

document.getElementById("formularioPrato").addEventListener("submit", async (event) => {
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

    req.url("add/prato")
        .post()
        .json()
        .cors()
        .body(dto)
        .noReturn()
    .send()

    req.clear()

    $('#pratoModal').modal('hide');
});

async function PratosType(){
    const data = await req.url("info/getTypes/prato")
        .get()
        .cors()
    .send();

    const types = data.types;
    const selectElement = document.getElementById("tipoPrato");
    const selectElementNewP = document.getElementById("selectTypePratos");

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
        deleteButton.addEventListener('click', () => deletePedido(element.id));

        const updateButton = document.createElement('button');
        updateButton.textContent = 'Alterar';
        updateButton.classList.add('btn', 'btn-warning');
        updateButton.addEventListener('click', () => updatePedido(element.id));

        actionsCell.appendChild(deleteButton);
        actionsCell.appendChild(updateButton);
    });
}

async function renderinfoPrato(){
    const pratoReq = new Request("http://localhost:8080/");
    const data = await pratoReq.url("info/get/pratos")
        .get()
        .cors()
    .send();

    pratoReq.clear()

    const pratos = data.pratos;
    showDeleteModal(pratos);
}

function updatePedido(id){
    console.log(id);
}

function deletePedido(id){
    console.log(id);
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

function deletePrato(id){
    req.url("delete/prato/"+id)
        .delete()
        .json()
        .cors()
        .noReturn()
    .send();
    $('#deleteModal').modal('hide');
}

function renderItensAdicionados(object) {

    var itensAdicionadosDiv = document.getElementById("itensAdicionados");
    itensAdicionadosDiv.innerHTML = "";
    object.forEach(element => {
        var type = element.type
        var nome = element.name
        var paragrafo = document.createElement("p");
        paragrafo.textContent = type + ": " + nome;
        itensAdicionadosDiv.appendChild(paragrafo);
    });
}

async function getPratosByType(type){
    const pratoReq = new Request("http://localhost:8080/");
    const data = await pratoReq.url("info/get/pratos/bytype/"+type)
        .get()
        .cors()
    .send();

    const pratos = data.pratos;
    renderpratosSelect(pratos)
}

function renderpratosSelect(list){
    if(!Array.isArray(list)){
        throw new Error("A lista não é um array!");
    }

    var selectElement = document.getElementById("selectPratos");
    selectElement.innerHTML = '';
    list.forEach(element => {
        var option = document.createElement("option");
        option.value = element.id+"/"+element.nome;  
        option.text = element.nome;   
        selectElement.add(option);
    });
}


render(listaPedidos);
PratosType();

