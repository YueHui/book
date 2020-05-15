import * as PIXI from 'pixi.js';
class Book{
    constructor(element,config) {
        this.init(element);
    }
    init(element){
        let rootNode = element;
        if(typeof element == "string"){
            rootNode = document.querySelector(`#${element}`);
        }
        if(!rootNode){
            throw new Error("need to given a node or id");
        }
        const app = new PIXI.Application();
        rootNode.appendChild(app.view);
    }
}

export default Book;
