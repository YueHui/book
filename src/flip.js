
import * as PIXI from 'pixi.js-legacy';
import {gsap} from "gsap/all";
import Paper from './paper';
import {config,global} from './index';

const ANIMATE_TIME = 1;

class Flip extends PIXI.Container{
	constructor(){
		super();
		this.movePaper = null;
	}
	/**
	 * @param {number} currentIndex 当前显示索引
	 * @param {number} nextIndex 下一页的索引
	 */
	init(currentIndex,nextIndex){
		if(this.children.length>0){
			return;
		}
		
		const corner = global.currentCorner;
		const p1 = new Paper({
			index: currentIndex,
			height: config.paperHeight,
			width: config.paperWidth
		});
		const p2 = new Paper({
			index: nextIndex,
			height: config.paperHeight,
			width: config.paperWidth
		});
		p1.interactive = true;
		p2.interactive = true;

		if(corner.includes("l")){
			p1.setPosition({
				x: global.middleTopPoint.x - config.paperWidth,
				y: global.middleTopPoint.y
			})
			p2.setPosition({
				x: global.middleTopPoint.x - config.paperWidth,
				y: global.middleTopPoint.y
			});
			//注册点 右下角
			p2.pivot = new PIXI.Point(config.paperWidth,config.paperHeight);
			global.currentCorner = "lb";
		}else{
			p1.setPosition({
				x: global.middleTopPoint.x,
				y: global.middleTopPoint.y
			})
			p2.setPosition({
				x: global.middleTopPoint.x,
				y: global.middleTopPoint.y
			});
			//注册点 左下角
			p2.pivot = new PIXI.Point(0,config.paperHeight);
			global.currentCorner = "rb";
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
		
		
		let corner = global[global.currentCorner];
		

		//鼠标距底边距离
		const ml = corner.y - point.y;
		//鼠标距右边距离
		// 右边的距离总是从右边-鼠标x
		const mb = Math.abs(corner.x - point.x);

		const tan = ml / mb;
		let alpha;
		if(global.currentCorner.includes("l")){
			alpha = -Math.atan(tan)*2;
		}else{
			alpha = Math.atan(tan) * 2;
		}
		
		const showWidth = Math.abs(ml / Math.sin(alpha));
		if(showWidth > config.paperWidth) return;
		if(!paper.transform) return;
		paper.oldrotation = paper.rotation;
		paper.rotation = alpha;

		//检查另一边界限
		const topPoint = paper.toGlobal(new PIXI.Point(0, 0), new PIXI.Point(0, -config.paperHeight));
		const topHeight = global.middleTopPoint.y - topPoint.y;
		const distance = topHeight / Math.sin(alpha);
		// console.log(distance, config.paperWidth);
		if (global.currentCorner.includes("r") && distance > config.paperWidth) {
			paper.rotation = paper.oldrotation;
			return;
		}
		if (global.currentCorner.includes("l") && distance < 0) {
			paper.rotation = paper.oldrotation;
			return;
		}
		// console.log('update');

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
		const corner = global[global.currentCorner];
		if(paper.y>=global.middleTopPoint.y+config.paperHeight){
			global.tween = gsap.to(paper, {
				keyframes:[
					{x: corner.x-10*(paper.x>global.middleTopPoint.x?1:-1),y:corner.y-10,duration:ANIMATE_TIME*0.9},
					{x:corner.x,y:corner.y,duration:ANIMATE_TIME*0.1}
				],
				onUpdate: ()=>{
					paper.updatePosition(corner);
					this.addMask();
				},
				onComplete:()=>{
					this.removeChildren();
					this.mask = null;
					onComplete && onComplete();
				}
			})
		}else{
			global.tween = gsap.to(paper, ANIMATE_TIME, {
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
		
		
	}
	/**
	 * 下一页
	 * @param {*} onComplete 
	 */
	goNext(onComplete){
		const paper = this.movePaper;
		const corner = global[global.currentCorner];
		
		global.tween = gsap.to(paper, ANIMATE_TIME, {
			x: global.middleTopPoint.x + config.paperWidth *(global.currentCorner.includes("l")?1:-1),
			y: global.middleTopPoint.y + config.paperHeight,
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

		if(global.currentCorner.includes("l")){
			mask.pivot = new PIXI.Point(0, height - 400);
			mask.x = global[global.currentCorner].x + (paper.showWidth || 0);
			mask.y = global[global.currentCorner].y;
		}else{
			mask.pivot = new PIXI.Point(width, height - 400);
			mask.x = global[global.currentCorner].x - (paper.showWidth || 0);
			mask.y = global[global.currentCorner].y;
		}
		mask.rotation = paper.rotation / 2;

		this.addChild(mask);
		this.mask = mask;
		this.maskA = mask;
		
	}
	
}

export default Flip;