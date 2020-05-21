import * as PIXI from 'pixi.js';
import {
	gsap
} from "gsap/all";

// const ticker = new PIXI.Ticker();


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
		// this.showMask();
		this.addChild(image);
		this.pivot = new PIXI.Point(image.width / 2, image.height / 2);

		// this.filters = [new DropShadowFilter({
		// 	rotation:30,
		// 	blur:5,
		// 	quality:10,
		// 	distance:10,
		// 	alpha:.7
		// })]
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
	 * 返回到指定的角
	 * @param {x,y} corner 
	 */
	goPosition(corner,onComplete=()=>{}) {
		gsap.to(this, 1, {
			x: corner.x,
			y: corner.y,
			onUpdate: this.updatePosition.bind(this, this.rbCorner),
			onComplete
		});
	}
	/**
	 * 更新当前的显示
	 * 根据当前的坐标，以及拖拽的边角
	 * 同时改变遮罩显示的宽度
	 * @param {x,y} corner 角的坐标{x,y}
	 */
	updatePosition(corner) {
		//鼠标距底边距离
		const ml = corner.y - this.y;
		//鼠标距右边距离
		const mb = corner.x - this.x;

		const tan = ml / mb;
		const alpha = Math.atan(tan) * 2;
		this.rotation = alpha;
		this.showWidth = ml / Math.sin(alpha);
		this.showMask();
	}
	showMask() {
		if (this.mask) {
			this.removeChild(this.mask);
			this.mask = null;
		};
		this.removeChild(this.maskA);
		const mask = new PIXI.Graphics();
		const height = this.image.height + 400;

		mask.beginFill(0x0000FF);
		mask.drawRect(0, 0, this.image.width, height);
		mask.endFill();

		mask.pivot = new PIXI.Point(this.image.width, height - 200);

		mask.x = (this.showWidth || 0);
		mask.y = this.image.height;

		mask.rotation = -this.rotation / 2;
		// mask.rotation +=1;


		this.addChild(mask);
		this.mask = mask;
		this.maskA = mask;
	}

}

export default Paper;