import p5 from "p5";
import { DrawFunction, IDrawableObject, ObjectConfig } from "./IDrawableObject";

export class MovingObject implements IDrawableObject {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
  color: string;
  private drawFunction: DrawFunction;

  constructor(config: ObjectConfig, drawFunction: DrawFunction) {
    this.x = config.x;
    this.y = config.y;
    this.speedX = config.speedX ?? Math.random() * 4 - 2;
    this.speedY = config.speedY ?? Math.random() * 4 - 2;
    this.size = config.size;
    this.color = config.color;
    this.drawFunction = drawFunction;
  }

  update(p: p5) {
    this.x += this.speedX;
    this.y += this.speedY;

    // 画面の端での跳ね返り
    if (this.x < 0 || this.x > p.width) this.speedX *= -1;
    if (this.y < 0 || this.y > p.height) this.speedY *= -1;
  }

  draw(p: p5) {
    p.fill(this.color);
    p.push();
    p.translate(this.x, this.y);
    this.drawFunction(p, {
      x: this.x,
      y: this.y,
      size: this.size,
      color: this.color,
      speedX: this.speedX,
      speedY: this.speedY,
    });
    p.pop();
  }
}
