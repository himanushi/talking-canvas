import p5 from "p5";
import {
  IDrawableObject,
  ObjectConfig,
  ObjectDefinition,
} from "./IDrawableObject";
import { MovingObject } from "./MovingObject";

export class ObjectFactory {
  private static instance: ObjectFactory;
  private objectDefinitions: Map<string, ObjectDefinition> = new Map();

  private constructor() {
    // デフォルトの図形を登録
    this.registerObject({
      name: "circle",
      draw: (p: p5, config: ObjectConfig) => {
        p.ellipse(0, 0, config.size);
      },
    });

    this.registerObject({
      name: "square",
      draw: (p: p5, config: ObjectConfig) => {
        p.rectMode(p.CENTER);
        p.rect(0, 0, config.size, config.size);
      },
    });

    this.registerObject({
      name: "triangle",
      draw: (p: p5, config: ObjectConfig) => {
        const h = (config.size * Math.sqrt(3)) / 2;
        p.triangle(0, -h / 2, -config.size / 2, h / 2, config.size / 2, h / 2);
      },
    });

    this.registerObject({
      name: "dinosaur",
      draw: (p: p5, config: ObjectConfig) => {
        const scale = config.size / 50;
        p.ellipse(0, 0, 40 * scale, 20 * scale);
        p.push();
        p.translate(15 * scale, -10 * scale);
        p.ellipse(0, 0, 20 * scale, 15 * scale);
        p.rect(-15 * scale, 0, 15 * scale, 5 * scale);
        p.pop();
        p.push();
        p.translate(-20 * scale, 0);
        p.rotate(-0.2);
        p.rect(0, 0, 25 * scale, 5 * scale);
        p.pop();
        p.rect(-10 * scale, 10 * scale, 5 * scale, 15 * scale);
        p.rect(10 * scale, 10 * scale, 5 * scale, 15 * scale);
      },
    });
  }

  public static getInstance(): ObjectFactory {
    if (!ObjectFactory.instance) {
      ObjectFactory.instance = new ObjectFactory();
    }
    return ObjectFactory.instance;
  }

  public registerObject(definition: ObjectDefinition): void {
    this.objectDefinitions.set(definition.name, definition);
  }

  public createObject(type: string, config: ObjectConfig): IDrawableObject {
    const definition = this.objectDefinitions.get(type);
    if (!definition) {
      throw new Error(`Unknown object type: ${type}`);
    }

    return new MovingObject(config, definition.draw);
  }

  public getRegisteredTypes(): string[] {
    return Array.from(this.objectDefinitions.keys());
  }
}
