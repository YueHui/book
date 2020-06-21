
import * as PIXI from 'pixi.js';
import Paper from './paper';
import Flip from './flip';

const dragShadowImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAAAyCAYAAABI6WXHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFLaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MiA3OS4xNjA5MjQsIDIwMTcvMDcvMTMtMDE6MDY6MzkgICAgICAgICI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiLz4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9InIiPz6eHGDvAAABBUlEQVR4Xu3RywrCMBQG4dQ2vv/T9i54UnKkFNzPYj74TRWNixmO43i17fs+xq5z27ZxXdcpdp3Lsoyxdv42z3Nbzec4a579O9cZv6/9rhr3TnH/b/G/9TzPsZQyxertbHvfzufz87P8Ta7dk2v354bYP5++M3b07bGtb71t6Ztv5/M53z+Xd7Q78/7r/17xIghjgBgDxBggxgAxBogxQIwBYgwQY4AYA8QYIMYAMQaIMUCMAWIMEGOAGAPEGCDGADEGiDFAjAFiDBBjgBgDxBggxgAxBogxQIwBYgwQY4AYA8QYIMYAMQaIMUCMAWIMEGOAGAPEGCDGADEGiDFAjAFiDIxSvrXsgWjB4GEcAAAAAElFTkSuQmCC";

let config = {
    root: "book",
    images: [],
    width: window.innerWidth,
    height: window.innerHeight,
    padding: 100,
    paperWidth: 500,
    paperHeight: 600,
},
global = {
    middleTopPoint : new PIXI.Point(0,0),
    loader : null,
    //翻页动画
    tween: null,
    //会在纸张初始化时更新
    rb: new PIXI.Point(config.paperWidth,config.paperHeight),
    lb: new PIXI.Point(0,config.paperHeight),
    currentCorner: 'rb'
}

window.global = global



class Book {
    constructor(_config) {
        config = {
            ...config,
            ..._config
        };
        //右面显示的页码
        this.currentIndex = 0;
        //是否移动中
        this.moving = false;
        this.movePage = null;
        this.app = null;
        this.width = config.width;
        this.height = config.height;
        global.middleTopPoint = new PIXI.Point(this.width / 2, config.padding);
        
        this.init();
        this.loadImages();
    }
    destroy(){
        this.app && this.app.destroy(true);
        //loader.reset();
        global.loader = null;
    }
    init() {
        let rootNode = config.root;
        if (typeof rootNode == "string") {
            rootNode = document.querySelector(`#${rootNode}`);
        }
        if (!rootNode) {
            throw new Error("need to given a node or id");
        }
        const app = new PIXI.Application({
            width: config.width,
            height: config.height,
            sharedTicker: true,
            backgroundColor: 0x666666,
            antialias: true,
        });
        rootNode.appendChild(app.view);
        global.loader = new PIXI.Loader();

        const rightContain = new PIXI.Container();
        rightContain.x = global.middleTopPoint.x;
        rightContain.y = global.middleTopPoint.y;
        app.stage.addChild(rightContain);

        const leftContain = new PIXI.Container();
        leftContain.x = global.middleTopPoint.x - config.paperWidth;
        leftContain.y = global.middleTopPoint.y;
        app.stage.addChild(leftContain);

        const pageContain = new Flip();
        pageContain.x = 0;
        pageContain.y = 0;
        app.stage.addChild(pageContain);

        this.app = app;
        this.leftContain = leftContain;
        this.rightContain = rightContain;
        this.pageContain = pageContain;
    }
    loadImages() {
        if (!config.images || config.images.length === 0) {
            throw new Error("no images found");
        }

        const loadingLayer = new PIXI.Container();
        let text = new PIXI.Text(`资源加载中... 0%`, {
            fill: '0xfff',
            align: 'center'
        });
        text.x = this.width / 2 - 100;
        text.y = 200;
        loadingLayer.addChild(text);
        this.app.stage.addChild(loadingLayer);


        global.loader.onProgress.add(({
            progress
        }) => {
            text.text = `资源加载中... ${progress}%`;
        })
        config.images.forEach((img,index)=>{
            global.loader.add(`img${index}`,img);
        })
        global.loader
            .load(() => {
                this.app.stage.removeChild(loadingLayer);
                this.showBook();
            });
    }
    showBook() {
        this.showRight(this.currentIndex);


        this.app.stage.interactive = true;
        this.app.stage.on("mousedown", (e) => {
            global.tween && global.tween.progress(1);
            this.moving = true;
            console.log(this.currentIndex)

            const {x,y} = e.data.global;
            global.currentCorner = 'rb';
            if(x < global.middleTopPoint.x){
                global.currentCorner = 'lb';
            }
            this.pageContain.removeChildren();
            
            if(global.currentCorner.includes('r') && this.currentIndex<config.images.length-1){
                this.showRight(this.currentIndex+2)
                this.pageContain.init(this.currentIndex,this.currentIndex+1);
            }else if(global.currentCorner.includes('l') && this.currentIndex > 0){
                //因为显示的左边是当前页面的前一页，所以在-2的基础上再减一
                this.showLeft(this.currentIndex-3);
                this.pageContain.init(this.currentIndex-1,this.currentIndex-2);
            }
            this.pageContain.update(new PIXI.Point(x, y));
        });
        this.app.stage.on("mouseup", (e) => {
            this.moving = false;
            //点击期间没有拖拽，则认为是单机
            if(!this.dragMove){
                if(global.currentCorner.includes("l")){
                    if(this.currentIndex <= 0 ) return;
                    this.turnRight();
                }else{
                    if(this.currentIndex>= config.images.length-1) return;
                    this.turnLeft();
                }
                return;
            }
            this.dragMove = false;
            
            
            if(global.currentCorner.includes("l")){
                if(this.currentIndex <= 0 ) return;
                if(e.data.global.x < global.middleTopPoint.x){
                    this.pageContain.recover(()=>{
                        global.tween = null;
                        this.showRight(this.currentIndex);
                        this.showLeft(this.currentIndex-1);
                        this.pageContain.removeChildren();
                    });
                }else{
                    this.turnRight();
                }
            }else{
                if(this.currentIndex>= config.images.length-1) return;
                if(e.data.global.x >= global.middleTopPoint.x){
                    this.pageContain.recover(()=>{
                        global.tween = null;
                        this.showRight(this.currentIndex);
                        this.pageContain.removeChildren();
                    });
                }else{
                    this.turnLeft();
                }
            }
        });

        this.app.stage.on("mousemove", (e) => {
            const {x,y} = e.data.global;
            if (this.moving) {
                this.dragMove = true;
                this.pageContain.update(new PIXI.Point(x, y));
            }
        })

    }
    /**
     * 点击右面,向左翻页
     */
    turnLeft(){
        this.pageContain.goNext(()=>{
            global.tween = null;
            this.showLeft(this.currentIndex+1);
            //如果后面还有页面
            this.currentIndex += 2;
            this.pageContain.removeChildren();
        });
    }
    /**
     * 点击左边，向右翻页
     */
    turnRight(){
        this.pageContain.goNext(()=>{
            global.tween = null;
            this.currentIndex -= 2;
            this.showLeft(this.currentIndex-1);
            this.showRight(this.currentIndex);
            this.pageContain.removeChildren();
        });
    }
    /**
     * 显示右面的图片
     */
    showRight(index){
        this.rightContain.removeChildren();
        if(index > config.images.length-1 || this.currentIndex >config.images.length-1) return;
        const paper = new Paper({
            texture: global.loader.resources[`img${[index || this.currentIndex]}`].texture,
            height: config.paperHeight,
            width: config.paperWidth
        });

        paper.setPosition({
            x: 0,
            y: 0
        });
        this.rightContain.addChild(paper);

        const shadow = PIXI.Sprite.from(dragShadowImg);
        shadow.height = config.paperHeight;
        shadow.alpha = 0.2;
        shadow.x = - 50;
        this.rightContain.addChild(shadow);
    }
    /**
     * 显示左面的图片
     */
    showLeft(index){
        this.leftContain.removeChildren();
        if(index<0) return;
        const paper = new Paper({
            texture: global.loader.resources[`img${[index || this.currentIndex]}`].texture,
            height: config.paperHeight,
            width: config.paperWidth
        });

        paper.setPosition({
            x: 0,
            y: 0
        });
        this.leftContain.addChild(paper);

        
    }

}

export default Book;
export {
    config,
    global,
    dragShadowImg
}