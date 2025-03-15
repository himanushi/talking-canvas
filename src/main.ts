import p5 from "p5";
import OpenAI from "openai";

// Web Speech APIの型定義
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: {
    transcript: string;
  };
}

// オブジェクトの基本クラス
class MovingObject {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
  color: string;

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

  shape: string = "circle";

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

// メインのアプリケーションクラス
class App {
  private p5Instance: p5;
  private objects: MovingObject[] = [];
  private recognition: any;
  private openai!: OpenAI;
  private isListening: boolean = false;

  constructor() {
    this.p5Instance = new p5(this.sketch.bind(this));
    this.setupSpeechRecognition();
    this.setupOpenAI();
  }

  private setupOpenAI() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI APIキーが設定されていません。");
      return;
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  private setupSpeechRecognition() {
    this.recognition = new window.webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.lang = "ja-JP";

    this.recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const transcript = results[results.length - 1][0].transcript;
      console.log("認識された言葉:", transcript);

      try {
        // OpenAI APIを使用して、発話から図形の種類と色を解析
        const response = await this.openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                '与えられた発話から図形の情報を抽出し、以下のJSON形式で返してください：{"shape": "circle"|"square"|"triangle", "color": "赤"|"青"|"緑"|"黄"|"紫"|"オレンジ", "size": 小(30)|中(50)|大(70)}',
            },
            {
              role: "user",
              content: `次の発話から図形の情報を抽出してください: "${transcript}"`,
            },
          ],
          model: "o3-mini",
          response_format: { type: "json_object" },
        });

        if (response.choices[0].message.content) {
          const result = JSON.parse(response.choices[0].message.content);
          // 図形の情報に基づいてオブジェクトを追加
          this.addObject(result);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition.start();
      }
    };
  }

  private addObject(info: { shape: string; color: string; size: string }) {
    const x = Math.random() * this.p5Instance.width;
    const y = Math.random() * this.p5Instance.height;
    const obj = new MovingObject(x, y);
    obj.shape = info.shape;

    // サイズの設定
    switch (info.size) {
      case "小":
        obj.size = 30;
        break;
      case "中":
        obj.size = 50;
        break;
      case "大":
        obj.size = 70;
        break;
    }

    // 色の設定
    const colorMap: { [key: string]: string } = {
      赤: "rgb(255, 0, 0)",
      青: "rgb(0, 0, 255)",
      緑: "rgb(0, 255, 0)",
      黄: "rgb(255, 255, 0)",
      紫: "rgb(128, 0, 128)",
      オレンジ: "rgb(255, 165, 0)",
    };
    obj.color =
      colorMap[info.color] ||
      `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;

    this.objects.push(obj);
  }

  private sketch(p: p5) {
    p.setup = () => {
      p.createCanvas(p.windowWidth * 0.8, p.windowHeight * 0.8);

      // 音声認識開始ボタン
      const startButton = p.createButton("音声認識開始");
      startButton.position(20, p.height + 20);
      startButton.mousePressed(() => {
        if (!this.isListening) {
          this.isListening = true;
          this.recognition.start();
          startButton.html("音声認識停止");
        } else {
          this.isListening = false;
          this.recognition.stop();
          startButton.html("音声認識開始");
        }
      });
    };

    p.draw = () => {
      p.background(240);

      // 全オブジェクトの更新と描画
      this.objects.forEach((obj) => {
        obj.update(p);
        obj.draw(p);
      });
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth * 0.8, p.windowHeight * 0.8);
    };
  }
}

// アプリケーションの起動
new App();
