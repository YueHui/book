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
        //下一个要显示的索引
        this.showIndex = 0;
        //是否移动中
        this.moving = false;
        this.app = null;
        this.width = this.config.width;
        this.height = this.config.height;
        this.loader = PIXI.Loader.shared;
        this.middleTopPoint = new PIXI.Point(this.width/2,this.config.padding);



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
                bg.drawRect(0,0,this.width,this.height);
                bg.endFill();
                this.app.stage.addChild(bg);
                this.showBook();
            });
    }
    showBook() {
        this.addPaper(1);
        //翻页容器
        const pageContain = new PIXI.Container();
        this.app.stage.addChild(pageContain);
        
        // this.addPaper();

        
        this.app.stage.interactive = true;
        this.app.stage.on("mousedown", () => {
            this.moving = true;
        });
        this.app.stage.on("mouseup", () => {
            this.moving = false;
        });
        this.app.stage.on("mousemove", (e) => {
            if (this.moving) {
                pageContain.removeChildren();
                this.drawPage(pageContain,new PIXI.Point(e.data.global.x,e.data.global.y));
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

        paper.x = this.middleTopPoint.x;
        paper.y = this.config.padding;

        paper.cursor = 'pointer';
        paper.interactive = true;

        this.app.stage.addChild(paper);
        this.showIndex++;
        return paper;
    }
    drawPage(container,mousePoint) {
        
        const _this = this;
        const middleTopPoint = this.middleTopPoint;
        const paperWidth = this.config.paperWidth;
        const paperHeight = this.config.paperHeight;
        

        let a = mousePoint;
        let f = new PIXI.Point(middleTopPoint.x + paperWidth, middleTopPoint.y+paperHeight);
        let g = new PIXI.Point();
        let e = new PIXI.Point();
        let h = new PIXI.Point();
        let c = new PIXI.Point();
        let j = new PIXI.Point();
        let b = new PIXI.Point();
        let k = new PIXI.Point();
        let d = new PIXI.Point();
        let i = new PIXI.Point();
        calcPointsXY();
        drawPoint();
        drawPartA();


        /**
         * 计算各点坐标
         */
        function calcPointsXY() {
            g.x = (a.x + f.x) / 2;
            g.y = (a.y + f.y) / 2;

            e.x = g.x - (f.y - g.y) * (f.y - g.y) / (f.x - g.x);
            e.y = f.y;

            h.x = f.x;
            h.y = g.y - (f.x - g.x) * (f.x - g.x) / (f.y - g.y);

            c.x = e.x - (f.x - e.x) / 2;
            c.y = f.y;

            j.x = f.x;
            j.y = h.y - (f.y - h.y) / 2;

            b = getIntersectionPoint(a, e, c, j);
            k = getIntersectionPoint(a, h, c, j);

            d.x = (c.x + 2 * e.x + b.x) / 4;
            d.y = (2 * e.y + c.y + b.y) / 4;

            i.x = (j.x + 2 * h.x + k.x) / 4;
            i.y = (2 * h.y + j.y + k.y) / 4;
        }

        /**
         * 计算两线段相交点坐标
         * @param l1_p1
         * @param l1_p2
         * @param l2_p1
         * @param l2_p2
         * @return 返回该点
         */
        function getIntersectionPoint(l1_p1, l1_p2, l2_p1, l2_p2) {
            let x1, y1, x2, y2, x3, y3, x4, y4;
            x1 = l1_p1.x;
            y1 = l1_p1.y;
            x2 = l1_p2.x;
            y2 = l1_p2.y;
            x3 = l2_p1.x;
            y3 = l2_p1.y;
            x4 = l2_p2.x;
            y4 = l2_p2.y;

            let pointX = ((x1 - x2) * (x3 * y4 - x4 * y3) - (x3 - x4) * (x1 * y2 - x2 * y1)) /
                ((x3 - x4) * (y1 - y2) - (x1 - x2) * (y3 - y4));
            let pointY = ((y1 - y2) * (x3 * y4 - x4 * y3) - (x1 * y2 - x2 * y1) * (y3 - y4)) /
                ((y1 - y2) * (x3 - x4) - (x1 - x2) * (y3 - y4));

            return new PIXI.Point(pointX, pointY);
        }

        function drawPoint(){
           container.addChild( new Text("a",a.x,a.y));
           container.addChild( new Text("f",f.x,f.y));
           container.addChild( new Text("g",g.x,g.y));

           container.addChild( new Text("e",e.x,e.y));
           container.addChild( new Text("h",h.x,h.y));

           container.addChild( new Text("c",c.x,c.y));
           container.addChild( new Text("j",j.x,j.y));

           container.addChild( new Text("b",b.x,b.y));
           container.addChild( new Text("k",k.x,k.y));

           container.addChild( new Text("d",d.x,d.y));
           container.addChild( new Text("i",i.x,i.y));
        }

        function drawPartA(index){
            const path = new PIXI.Graphics();
            // path.blendMode = PIXI.BLEND_MODES.MULTIPLY;
            path.beginTextureFill({texture: _this.loader.resources[_this.config.images[0]].texture});
            // path.beginTextureFill();
            path.moveTo(middleTopPoint.x,middleTopPoint.y);
            path.lineTo(middleTopPoint.x,middleTopPoint.y+paperHeight);//移动到左下角
            path.lineTo(c.x,c.y);//移动到c点
            path.quadraticCurveTo(e.x,e.y,b.x,b.y);//从c到b画贝塞尔曲线，控制点为e
            path.lineTo(a.x,a.y);//移动到a点
            path.lineTo(k.x,k.y);//移动到k点
            path.quadraticCurveTo(h.x,h.y,j.x,j.y);//从k到j画贝塞尔曲线，控制点为h
            path.lineTo(middleTopPoint.x+paperWidth,middleTopPoint.y);//移动到右上角
            
            path.endFill();
            container.addChild(path);
        }
    }




}

export default Book;

class Text extends PIXI.Text{
    constructor(text,x,y){
        super();
        this.style= {fill:'red'}
        this.text = text;
        this.x = x;
        this.y = y;
    }
}