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

  draw(p: p5) {
    p.fill(this.color);
    p.ellipse(this.x, this.y, this.size);
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
    this.openai = new OpenAI({
      apiKey: "YOUR_API_KEY_HERE", // OpenAI APIキーを設定してください
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
              role: "user",
              content: `次の発話から描画すべき図形の情報を抽出してJSON形式で返してください。発話: "${transcript}"`,
            },
          ],
          model: "gpt-3.5-turbo",
          response_format: { type: "json_object" },
        });

        if (response.choices[0].message.content) {
          const result = JSON.parse(response.choices[0].message.content);
          // 新しいオブジェクトを追加
          this.addObject();
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

  private addObject() {
    const x = Math.random() * this.p5Instance.width;
    const y = Math.random() * this.p5Instance.height;
    this.objects.push(new MovingObject(x, y));
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
