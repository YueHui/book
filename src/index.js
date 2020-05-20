import * as PIXI from 'pixi.js';
import Paper from './paper';
import flipMethods from './lib/flip';

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
        //下一个要显示的索引
        this.showIndex = 0;
        //是否移动中
        this.moving = false;
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
            sharedTicker: true
        });
        this.app = app;
        rootNode.appendChild(app.view);
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
                const bg = new PIXI.Graphics();
                bg.beginFill(0x333333);
                bg.drawRect(0, 0, this.width, this.height);
                bg.endFill();
                this.app.stage.addChild(bg);
                this.showBook();
            });
    }
    showBook() {
        this.addPaper();
        this.addPaper();
        this.getMask();


        this.app.stage.interactive = true;
        this.app.stage.on("mousedown", () => {
            this.moving = true;
        });
        this.app.stage.on("mouseup", () => {
            this.moving = false;
        });
        this.app.stage.on("mousemove", (e) => {
            if (this.moving) {
                this.drawPage(new PIXI.Point(e.data.global.x, e.data.global.y));
            }
        })
        // this.app.stage.on("click", (e) => {
        //     this.drawPage(new PIXI.Point(e.data.global.x,e.data.global.y));
        // });

    }
    addPaper(index) {
        const paper = new Paper({
            texture: this.loader.resources[this.config.images[index || this.showIndex]].texture,
            height: this.config.paperHeight,
            width: this.config.paperWidth
        });

        // paper.x = this.middleTopPoint.x;
        // paper.y = this.config.padding;
        paper.setPosition({
            x: this.middleTopPoint.x,
            y: this.config.padding
        });

        paper.cursor = 'pointer';
        paper.interactive = true;
        paper.rotation = 0;

        this.app.stage.addChild(paper);
        this.showIndex++;
        return paper;
    }
    drawPage(mousePoint) {
        const paper = this.app.stage.getChildAt(this.showIndex);

        // console.log(flipMethods)
        // flipMethods._fold.call(paper,{x:mousePoint.x,y:mousePoint.y,corner:'tr'});
        //首先算右下角
        const originPos = {
            x: this.middleTopPoint.x + paper.width/2,
            y: this.middleTopPoint.y + paper.height/2
        }
        //鼠标距底边距离
        const ml = this.middleTopPoint.y+paper.height - mousePoint.y;
        //鼠标距夹角距离
        const mb = this.middleTopPoint.x+paper.width - mousePoint.x;
        const tan = ml / mb;
        const alpha = Math.atan(tan)*2;
        paper.rotation = alpha;

        // const distance = Math.sqrt(Math.pow(paper.width/2,2)+Math.pow(paper.height/2,2))
        paper.x = mousePoint.x;
        paper.y = mousePoint.y;
        paper.pivot = {x:0,y:paper.height};

        
        // this.maskA.rotation = Math.PI/2 - alpha;
        paper.mask = this.maskA;
        
        
        // paper.x = originPos.x ;
        // paper.y = distance*Math.sin(alpha);
        
        // paper.x = mousePoint.x ;
        // paper.y = mousePoint.y ;

        // const middle = {x:paper.width/2,y:paper.height/2};
        // const distance = Math.sqrt(Math.pow(middle.x, 2) + Math.pow(middle.y, 2));

        // const pos = new PIXI.Point(mousePoint.x+middle.x- distance * Math.cos(alpha), mousePoint.y-middle.y- distance * Math.sin(alpha));
        // paper.x = pos.x;
        // paper.y = pos.y;
        // paper.x = originPos.x + paper.width / 2 * Math.cos(Math.PI - alpha);
        // // // paper.x = mousePoint.x +  (mousePoint.x-paper.x)* Math.cos(alpha);
        // paper.y = originPos.y - paper.height / 2 * Math.sin(Math.PI / 2 - alpha);
        // console.log(paper.width/2,distance*Math.cos(Math.atan(paper.height/paper.width)),distance*Math.cos(alpha));
        // paper.x = mousePoint.x + mousePoint.x * Math.sin(alpha)
        // paper.setPosition({
        //     x: mousePoint.x * Math.sin(alpha)
        // });
        // const distance =  Math.max(0, Math.sin(gamma) * Math.sqrt(Math.pow(middle.x, 2) + Math.pow(middle.y, 2)));
    }
    getMask(){
        if(this.maskA) return this.maskA;
        const mask = new PIXI.Graphics();
        this.maskA = mask;
        mask.beginFill(0x0000FF);
        mask.drawRect(0,0,this.config.paperWidth, this.config.paperHeight);
        mask.endFill();
        mask.pivot = {x:this.config.paperWidth/2,y:this.config.paperHeight/2};
        mask.x = this.middleTopPoint.x + this.config.paperWidth/2;
        mask.y = this.config.padding + this.config.paperHeight/2;
        this.app.stage.addChild(mask);
        
        return mask;
    }
}

export default Book;

/**
 * 弧度转角度
 * @param {*} radian 
 */
function angle(radian) {
    return 180 * radian / Math.PI;
}

/**
 * 角度转弧度
 * @param {*} angle 
 */
function radian(angle) {
    return angle / 180 * Math.PI;
}