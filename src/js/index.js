const ids = ["listaPedidos", "addnewIng", "deletbnt"];
const dom = new DomMaster(ids, new Log());
const req = new Request("http://localhost:8080/");

const listaPedidos = [
    {
        "id": 1,
        "data": "2023-11-12",
        "itens": [
            { "tipo": "entrada", "descricao": "Salada de Folhas Verdes" },
            { "tipo": "principal", "descricao": "Filé Mignon Grelhado" },
            { "tipo": "sobremesa", "descricao": "Pudim" }
        ]
    },
    {
        "id": 2,
        "data": "2023-11-13",
        "itens": [
            { "tipo": "entrada", "descricao": "Bruschetta" },
            { "tipo": "principal", "descricao": "Risoto de Cogumelos" },
            { "tipo": "sobremesa", "descricao": "Tiramisu" }
        ]
    },
    {
        "id": 3,
        "data": "2023-11-14",
        "itens": [
            { "tipo": "entrada", "descricao": "Carpaccio" },
            { "tipo": "principal", "descricao": "Salmão ao Molho de Maracujá" },
            { "tipo": "sobremesa", "descricao": "Cheesecake de Frutas Vermelhas" },
            { "tipo": "entrada", "descricao": "Carpaccio" },
            { "tipo": "principal", "descricao": "Salmão ao Molho de Maracujá" },
            { "tipo": "sobremesa", "descricao": "Cheesecake de Frutas Vermelhas" }
        ]
    }
];


dom.addAction('click', "addnewIng", () => {
    adicionarIngrediente();
});

dom.addAction('click', "deletbnt", async () => {
    await renderinfoPrato()
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
    selectElement.innerHTML = ""
    types.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.text = type;
        selectElement.add(option);
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


render(listaPedidos);
PratosType();

