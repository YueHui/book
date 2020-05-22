import * as PIXI from 'pixi.js';
import {
	gsap
} from "gsap/all";
import Paper from './paper';
import {config,middleTopPoint} from './index';



class Flip extends PIXI.Container{
	constructor(){
		super();
		this.loader = PIXI.Loader.shared;
		this.movePaper = null;
	}
	/**
	 * @param {number} currentIndex 当前显示索引
	 * @param {number} nextIndex 下一页的索引
	 * @param {string} corner 指定角 rb,lb,lt,rt
	 */
	init(currentIndex,nextIndex,corner){
		if(this.children.length>0){
			return;
		}
		const p1 = new Paper({
			texture: this.loader.resources[config.images[currentIndex]].texture,
			height: config.paperHeight,
			width: config.paperWidth
		});
		const p2 = new Paper({
			texture: this.loader.resources[config.images[nextIndex]].texture,
			height: config.paperHeight,
			width: config.paperWidth
		});
		p1.interactive = true;
		p2.interactive = true;

		if(corner.includes("l")){
			p1.setPosition({
				x: middleTopPoint.x - config.paperWidth,
				y: middleTopPoint.y
			})
			p2.setPosition({
				x: middleTopPoint.x - config.paperWidth,
				y: middleTopPoint.y
			});
		}else{
			p1.setPosition({
				x: middleTopPoint.x,
				y: middleTopPoint.y
			})
			p2.setPosition({
				x: middleTopPoint.x,
				y: middleTopPoint.y
			});
		}
		
		p2.pivot = new PIXI.Point(0,config.paperHeight);
		p2.alpha = 0;


		this.addChild(p1);
		this.addChild(p2);
		this.movePaper = p2;		
	}
	/**
	 * 更新显示
	 * @param {x,y} point 
	 */
	update(point){
		const paper = this.movePaper;
		paper.alpha = 1;
		paper.x = point.x;
        paper.y = point.y;
		paper.updatePosition(paper.rbCorner);
		this.addMask();
	}
	clear(){
		this.removeChildren();
	}
	/**
	 * 恢复原始状态
	 * @param {function} onComplete 
	 */
	recover(onComplete){
		const paper = this.movePaper;
		const corner = paper.rbCorner;
		
		gsap.to(paper, 1, {
			x: corner.x,
			y: corner.y,
			onUpdate: ()=>{
				paper.updatePosition(corner);
				this.addMask();
			},
			onComplete:()=>{
				this.removeChildren();
				this.mask = null;
				onComplete && onComplete();
			}
		});
		
	}
	/**
	 * 下一页
	 * @param {*} onComplete 
	 */
	goNext(onComplete){
		const paper = this.movePaper;
		const corner = paper.rbCorner;
		
		gsap.to(paper, 1, {
			x: middleTopPoint.x - config.paperWidth,
			y: middleTopPoint.y + config.paperHeight,
			onUpdate: ()=>{
				paper.updatePosition(corner);
				this.addMask();
			},
			onComplete:()=>{
				this.removeChildren();
				this.mask = null;
				onComplete && onComplete();
			}
		});
	}
	addMask(){
		const paper = this.movePaper
		if (this.mask) {
			this.removeChild(this.mask);
			this.mask = null;
		};
		this.removeChild(this.maskA);
		const mask = new PIXI.Graphics();
		const height = config.paperHeight + 800;
		const width = config.paperWidth + 400;

		mask.beginFill(0x0000FF);
		mask.drawRect(0, 0, width, height);
		mask.endFill();

		mask.pivot = new PIXI.Point(width, height - 400);

		mask.x = paper.rbCorner.x - (paper.showWidth || 0);
		mask.y = paper.rbCorner.y;
		mask.rotation = paper.rotation / 2;

		this.addChild(mask);
		this.mask = mask;
		this.maskA = mask;
		
	}
	
}

export default Flip;