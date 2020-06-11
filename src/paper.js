import * as PIXI from 'pixi.js';
import {dragShadowImg} from './index';


class Paper extends PIXI.Container {
	constructor({
		texture,
		height,
		width
	}) {
		super();
		const image = new PIXI.Sprite(texture);
		image.height = height;
		image.width = width;
		image.cursor = 'pointer';

		// image.cacheAsBitmap = true;

		this.rotation = 0;
		this.moved = false;
		this.image = image;
		this.showWidth = 0;
		this.rbCorner = {
			x: image.width,
			y: image.height,
		}
		this.lbCorner = {
			x: 0,
			y: image.height,
		}
		// this.showMask();
		this.addChild(image);
		this.pivot = new PIXI.Point(image.width / 2, image.height / 2);

		this.dragShadow = PIXI.Sprite.from(dragShadowImg);
		this.hasDragMask = false;
	}
	setPosition({
		x,
		y
	}) {
		this.x = x + this.pivot.x;
		this.y = y + this.pivot.y;

		//更新角坐标
		this.rbCorner = {
			x: this.rbCorner.x + x,
			y: this.rbCorner.y + y,
		}
	}
	
	/**
	 * 更新当前的显示
	 * 根据当前的坐标，以及拖拽的边角
	 * 同时改变遮罩显示的宽度
	 * @param {x,y} corner 角的坐标{x,y}
	 * @param alpha 选择的角度
	 */
	updatePosition(corner,alpha) {
		if(!this.hasDragMask){
			this.addMask();
			this.addShadow();
			this.hasDragMask = true;
		}

		//鼠标距底边距离
		const ml = corner.y - this.y;
		//鼠标距右边距离
		const mb = corner.x - this.x;

		//动画没有预算角度
		if(!alpha){
			const tan = ml / mb;
			alpha = Math.atan(tan) * 2;
		}
		this.rotation = alpha;
		this.showWidth = ml / Math.sin(alpha);

		this.dragShadow.x = this.showWidth;
		this.dragShadow.rotation = -this.rotation/2 ;
		
		
	}
	/**
	 * 添加阴影
	 */
	addShadow(){
		const dragShadow = this.dragShadow;
		// dragShadow.height = this.image.height;
		// dragShadow.width = 99;
		dragShadow.height = this.image.height+200;
		
		dragShadow.pivot = new PIXI.Point(dragShadow.width,50)
		dragShadow.x = 0;
		dragShadow.y = dragShadow.height-200;
		
		dragShadow.rotation = 0;
		dragShadow.alpha = .2;

		this.addChild(dragShadow);
		this.dragShadow = dragShadow;

	}
	/**
	 * 遮罩阴影用
	 */
	addMask() {
		if (this.mask) {
			this.removeChild(this.mask);
			this.mask = null;
		};
		this.removeChild(this.maskA);
		const mask = new PIXI.Graphics();
		const height = this.image.height;

		mask.beginFill(0x0000FF);
		mask.drawRect(0, 0, this.image.width, height);
		mask.endFill();

		this.addChild(mask);
		this.mask = mask;
		this.maskA = mask;
	}


}

export default Paper;