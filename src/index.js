import * as PIXI from 'pixi.js';
import Paper from './paper';


class Book {
    constructor(config) {
        const _config = {
            root: "book",
            images: [],
            width: window.innerWidth,
            height: window.innerHeight,
            padding: 100,
            paperWidth: 500,
            paperHeight: 600,
        }
        this.config = {
            ..._config,
            ...config
        };
        //右面显示的页码
        this.showIndex = 0;
        //是否移动中
        this.moving = false;
        this.movePage = null;
        this.app = null;
        this.width = this.config.width;
        this.height = this.config.height;
        this.loader = PIXI.Loader.shared;
        this.middleTopPoint = new PIXI.Point(this.width / 2, this.config.padding);



        this.init();
        this.loadImages();
    }
    init() {
        let rootNode = this.config.root;
        if (typeof rootNode == "string") {
            rootNode = document.querySelector(`#${rootNode}`);
        }
        if (!rootNode) {
            throw new Error("need to given a node or id");
        }
        const app = new PIXI.Application({
            width: this.config.width,
            height: this.config.height,
            sharedTicker: true,
            backgroundColor: 0x666666,
            antialias: true,
        });
        rootNode.appendChild(app.view);

        const leftContain = new PIXI.Container();
        leftContain.x = this.middleTopPoint.x - this.config.paperWidth;
        leftContain.y = this.middleTopPoint.y;
        app.stage.addChild(leftContain);

        const rightContain = new PIXI.Container();
        rightContain.x = this.middleTopPoint.x;
        rightContain.y = this.middleTopPoint.y;
        app.stage.addChild(rightContain);

        const pageContain = new PIXI.Container();
        leftContain.x = 0;
        leftContain.y = 0;
        app.stage.addChild(pageContain);

        this.app = app;
        this.leftContain = leftContain;
        this.rightContain = rightContain;
        this.pageContain = pageContain;
    }
    loadImages() {
        if (!this.config.images || this.config.images.length === 0) {
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


        this.loader.onProgress.add(({
            progress
        }) => {
            text.text = `资源加载中... ${progress}%`;
        })
        this.loader
            .add(this.config.images)
            .load(() => {
                this.app.stage.removeChild(loadingLayer);
                this.showBook();
            });
    }
    showBook() {
        this.showRight(this.showIndex);
        // this.showLeft(1)
        // this.addPaper();
        // const paper = this.addPaper();

        this.app.stage.interactive = true;
        this.app.stage.on("mousedown", () => {
            this.moving = true;
        });
        this.app.stage.on("mouseup", (e) => {
            this.moving = false;
            const paper = this.movePage;
            if(e.data.global.x >= this.middleTopPoint.x){
                paper.goPosition(paper.rbCorner);
            }else{
                paper.goPosition({
                    x: this.middleTopPoint.x - paper.width,
                    y: this.middleTopPoint.y + paper.height
                },()=>{
                  this.showLeft(this.showIndex+1);
                  this.showIndex++;
                })
                console.log(this.leftContain.x)
            }
            

        });
        this.app.stage.on("mousemove", (e) => {
            const {x,y} = e.data.global;
            
            if (this.moving) {
                this.drawPage(this.movePage,new PIXI.Point(x, y));
            }else if(!this.movePage){
                const p1 = new Paper({
                    texture: this.loader.resources[this.config.images[this.showIndex]].texture,
                    height: this.config.paperHeight,
                    width: this.config.paperWidth
                });
                const p2 = new Paper({
                    texture: this.loader.resources[this.config.images[this.showIndex+1]].texture,
                    height: this.config.paperHeight,
                    width: this.config.paperWidth
                });
                p1.interactive = true;
                p2.interactive = true;

                p1.setPosition({
                    x: this.middleTopPoint.x,
                    y: this.middleTopPoint.y
                })
                p2.setPosition({
                    x: this.middleTopPoint.x,
                    y: this.middleTopPoint.y
                })

                this.movePage = p2;
                this.showRight(this.showIndex+2)
                this.pageContain.addChild(p1);
                this.pageContain.addChild(p2);
                this.drawPage(p2,{
                    x: this.middleTopPoint.x+this.config.paperWidth-20,
                    y: this.middleTopPoint.y+ this.config.paperHeight - 20,
                })
                console.log(p2.x,p2.y);
            }
        })

    }
    /**
     * 显示动画的页面
     * @param {*} paper 
     */
    drawPage(paper,mousePoint) {

        paper.x = mousePoint.x;
        paper.y = mousePoint.y;
        paper.pivot = {
            x: 0,
            y: paper.image.height
        };
        paper.updatePosition(paper.rbCorner);


    }
    /**
     * 显示右面的图片
     */
    showRight(index){
        this.rightContain.removeChildren();
        const paper = new Paper({
            texture: this.loader.resources[this.config.images[index || this.showIndex]].texture,
            height: this.config.paperHeight,
            width: this.config.paperWidth
        });

        paper.setPosition({
            x: 0,
            y: 0
        });
        this.rightContain.addChild(paper);
    }
    /**
     * 显示左面的图片
     */
    showLeft(index){
        this.leftContain.removeChildren();
        const paper = new Paper({
            texture: this.loader.resources[this.config.images[index || this.showIndex]].texture,
            height: this.config.paperHeight,
            width: this.config.paperWidth
        });

        paper.setPosition({
            x: 0,
            y: 0
        });
        this.leftContain.addChild(paper);
    }

}

export default Book;