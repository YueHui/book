
import * as PIXI from 'pixi.js';
import {
	gsap
} from "gsap/all";
import Paper from './paper';
import {config,middleTopPoint,loader} from './index';

const ANIMATE_TIME = 1;

class Flip extends PIXI.Container{
	constructor(){
		super();
		this.movePaper = null;
		this.corner = 'rb'; 	//拖拽角度
		this.paperCorner = null;//拖拽角的坐标
	}
	/**
	 * @param {number} currentIndex 当前显示索引
	 * @param {number} nextIndex 下一页的索引
	 */
	init(currentIndex,nextIndex){
		if(this.children.length>0){
			return;
		}
		if(this.movePaper){
			gsap.killTweensOf(this.movePaper);
		}
		const corner = this.corner;
		const p1 = new Paper({
			texture: loader.resources[`img${[currentIndex]}`].texture,
			height: config.paperHeight,
			width: config.paperWidth
		});
		const p2 = new Paper({
			texture: loader.resources[`img${[nextIndex]}`].texture,
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
			//注册点 右下角
			p2.pivot = new PIXI.Point(config.paperWidth,config.paperHeight);
			this.paperCorner = p2.lbCorner;
		}else{
			p1.setPosition({
				x: middleTopPoint.x,
				y: middleTopPoint.y
			})
			p2.setPosition({
				x: middleTopPoint.x,
				y: middleTopPoint.y
			});
			//注册点 左下角
			p2.pivot = new PIXI.Point(0,config.paperHeight);
			this.paperCorner = p2.rbCorner;
		}
		
		p2.corner = this.corner;
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
		let corner = this.paperCorner;

		//鼠标距底边距离
		const ml = corner.y - point.y;
		//鼠标距右边距离
		// 右边的距离总是从右边-鼠标x
		const mb = Math.abs(corner.x - point.x);

		const tan = ml / mb;
		let alpha;
		if(this.corner.includes("l")){
			alpha = -Math.atan(tan)*2;
		}else{
			alpha = Math.atan(tan) * 2;
		}
		// const alpha = Math.atan(tan) * (this.corner.includes("l")?1:2)-(this.corner.includes("l")?Math.PI/2:0);
		// const alpha = Math.atan(tan) * (this.corner.includes("l")?1:2);

		// if(middleTopPoint.y + paper.image.height - point.y > paper.image.width*Math.sin(alpha)){
		// 	return;
		// }
		// console.log(alpha)
		const showWidth = Math.abs(ml / Math.sin(alpha));
		if(showWidth > config.paperWidth) return;
		paper.alpha = 1;
		paper.x = point.x;
        paper.y = point.y;
		paper.updatePosition(corner,alpha);
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
		const corner = this.paperCorner;
		
		gsap.to(paper, ANIMATE_TIME, {
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
		const corner = this.paperCorner;
		console.log(this.corner);
		gsap.to(paper, ANIMATE_TIME, {
			x: middleTopPoint.x + config.paperWidth *(this.corner.includes("l")?1:-1),
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

		if(this.corner.includes("l")){
			mask.pivot = new PIXI.Point(0, height - 400);
			mask.x = this.paperCorner.x + (paper.showWidth || 0);
			mask.y = this.paperCorner.y;
		}else{
			mask.pivot = new PIXI.Point(width, height - 400);
			mask.x = this.paperCorner.x - (paper.showWidth || 0);
			mask.y = this.paperCorner.y;
		}
		mask.rotation = paper.rotation / 2;

		this.addChild(mask);
		this.mask = mask;
		this.maskA = mask;
		
	}
	
}

export default Flip;