class DomMaster {
    documento = {}
    dependecy = null;

    constructor(idsList = [], dependecy = null){
        this.dependecy = dependecy;
        idsList.forEach(id => {
            this.add(id);
        });

    }

    add(ElementID) {
        try {
            this.documento[ElementID] = document.getElementById(ElementID);
            if (this.dependecy != null) {
                if(this.documento[ElementID] === null || this.documento[ElementID] === undefined){
                    this.dependecy.errorLog("Erro no elemento: " + ElementID + " => " + this.documento[ElementID], this.constructor.name);
                }
            }
        } catch (error) {
            if(this.dependecy != null){
                this.dependecy.errorLog(error, this.constructor.name)
            }
        }
    }

    get(id) {
        return this.documento[id];
    }

    remove(ElementID){
        if (this.dependecy != null) {
            if(this.documento[ElementID] === null || this.documento[ElementID] === undefined){
                this.dependecy.errorLog("Removendo O elemento: " + ElementID, this.constructor.name);
            }
        }
        this.documento[ElementID] = null;
    }

    addAction(typeEvent, id, def) {
        this.documento[id].addEventListener(typeEvent, def);
    }

}

class Log {
    errorLog(message, className) {
        const timestamp = new Date().toLocaleString();
        const formattedMessage = `${timestamp}: [ERROR] --> ${message} : ${className}`;
        console.error(formattedMessage);
    }

    infoLog(message, className) {
        const timestamp = new Date().toLocaleString();
        const formattedMessage = `${timestamp}: [INFO] --> ${message} : ${className}`;
        console.log(formattedMessage);
    }
}

class Request {
    #components = {
        "url": null,
        "method": null,
        "cors": "no-cors",
        "headers": {},
        "body": {},
        "return": true,
        "returnArray": false
    }
    #baseUrl = null;

    constructor(baseUrl = null){
        this.#baseUrl = baseUrl;
    }

    addHeader(id, value){
        this.#components.headers[id] = value;
        return this;
    }

    url(url){
        if(this.#baseUrl === null){
            this.#components.url = url;
        }else{
            this.#components.url = this.#baseUrl + url; 
        }
        return this;
    }

    cors(){
        this.#components.cors = "cors";
        return this;
    }

    navigate(){
        this.#components.cors = "navigate";
        return this;
    }

    get(){
        this.#components.method = "GET";
        return this;
    }

    post(){
        this.#components.method = "POST";
        return this;
    }

    delete(){
        this.#components.method = "DELETE";
        return this;
    }

    json(){
        this.#components.headers["Content-Type"] = "application/json";
        return this;
    }

    body(object = {}){
        if (typeof object !== 'object' || Array.isArray(object) || object === null) {
            throw new Error('O parâmetro body deve ser um objeto.');
        }
        
        if(this.#components.method == "GET"){
            throw new Error("O metodo 'GET' não possue body.");
        }

        this.#components.body = object;
        return this;
    }

    showInfo(){
        console.log(this.#components);
    }

    noReturn(){
        this.#components.return = false;
        return this;
    }

    arrayReturn(){
        this.#components.returnArray = true;
        return this;
    }

    clear(){
        this.#components = {
            "url": null,
            "method": null,
            "cors": "no-cors",
            "headers": {},
            "body": {},
            "return": true,
            "returnArray": false
        }

    }

    async send(){
        const url = this.#components.url;
        const body = this.#components.body;
        const mode = this.#components.cors;
        const method = this.#components.method;

        if(method === "GET"){
            const data = await fetch(url, {
                method: method,
                mode: mode,
                headers: this.#components.headers,
            });

            if(this.#components.return){
                if(this.#components.returnArray){
                    return JSON.parse(await data.text());
                }

                return await data.json();
            }
        }else{
            const data = await fetch(url, {
                method: method,
                mode: mode,
                headers: this.#components.headers,
                body: JSON.stringify(body)
            });

            if(this.#components.return){
                if(this.#components.returnArray){
                    return JSON.parse(await data.text());
                }

                return await data.json();
            }
        }


    }


}
