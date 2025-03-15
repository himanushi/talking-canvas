import p5 from "p5";

export class MovingObject {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
  color: string;
  shape: string = "circle";

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.speedX = Math.random() * 4 - 2;
    this.speedY = Math.random() * 4 - 2;
    this.size = 50;
    this.color = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
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

    switch (this.shape) {
      case "square":
        p.rectMode(p.CENTER);
        p.rect(0, 0, this.size, this.size);
        break;
      case "triangle":
        const h = (this.size * Math.sqrt(3)) / 2;
        p.triangle(
          0,
          -h / 2, // 上頂点
          -this.size / 2,
          h / 2, // 左下
          this.size / 2,
          h / 2, // 右下
        );
        break;
      default: // circle
        p.ellipse(0, 0, this.size);
    }
    p.pop();
  }
}
