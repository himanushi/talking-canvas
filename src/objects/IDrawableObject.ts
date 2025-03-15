import p5 from "p5";

export interface IDrawableObject {
  x: number;
  y: number;
  size: number;
  color: string;
  update(p: p5): void;
  draw(p: p5): void;
}

export type ObjectConfig = {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX?: number;
  speedY?: number;
  customProperties?: Record<string, any>;
};

export type DrawFunction = (p: p5, config: ObjectConfig) => void;

export interface ObjectDefinition {
  name: string;
  draw: DrawFunction;
}
