import * as PIXI from 'pixi.js';

const ticker = new PIXI.Ticker();

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
		this.moved = false;
		// image.hitArea = new PIXI.Rectangle(0, 0, image.width, image.height);
		// image.interactive = true;
		// image.on("click",this.click);
		this.addChild(image);
	}
	move() {
		if(this.moved) return;
		const end = this.x + this.width / 2;
		console.log(this.x,end);
		ticker.add(delta => {
			if (this.x < end) {
				this.moved = true;
				this.x += 5 + delta;
			}else{
				ticker.stop();
			}
		})
		ticker.start();
	}
}

export default Paper;