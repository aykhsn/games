import Phaser from 'phaser';

class MyGame extends Phaser.Scene {
  private currentIndex: number;
  private images: Phaser.GameObjects.Image[];
  private velocities: Phaser.Math.Vector2[];
  private gameScale: number;
  private clickSound!: Phaser.Sound.BaseSound;
  private isAnimating: boolean;

  constructor() {
    super({ key: 'main' });
    this.currentIndex = 0;
    this.images = [];
    this.velocities = [];
    this.gameScale = 1;
    this.isAnimating = false;
  }

  preload() {
    for (let i = 0; i <= 9; i++) {
      this.load.image(String(i), `dist/assets/${i}.png`);
    }
    this.load.audio('clickSound', 'dist/assets/pui.mp3');
  }

  create() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    const padding = 140; // 画面端からの最小距離

    this.gameScale = gameWidth / 3 / this.textures.get('0').getSourceImage().width;

    this.clickSound = this.sound.add('clickSound'); // サウンドオブジェクトを作成

    for (let i = 0; i <= 9; i++) {
      let randomX = Phaser.Math.Between(padding, gameWidth - padding);
      let randomY = Phaser.Math.Between(padding, gameHeight - padding);

      const image = this.add.image(randomX, randomY, String(i)).setScale(this.gameScale);
      image.setVisible(i === this.currentIndex);
      image.setInteractive();
      image.on('pointerdown', this.handleClick, this);
      this.images.push(image);

      const velocity = new Phaser.Math.Vector2(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
      this.velocities.push(velocity);
    }

    this.scale.on('resize', this.handleResize, this);
  }

  handleClick() {
    if (this.isAnimating) return; // アニメーション中の場合は無視する

    this.isAnimating = true;
    this.clickSound.play(); // クリック音を再生

    const currentImage = this.images[this.currentIndex];
    this.tweens.add({
      targets: currentImage,
      scale: { value: 0 },
      duration: 200,
      onComplete: () => {
        currentImage.setVisible(false);
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        const newImage = this.images[this.currentIndex];
        newImage.setScale(0);
        newImage.setVisible(true);
        this.tweens.add({
          targets: newImage,
          scale: { value: this.gameScale },
          duration: 200,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            this.isAnimating = false;
          }
        });
      }
    });
  }

  handleResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.cameras.resize(width, height);

    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    const padding = 140; // 画面端からの最小距離

    this.gameScale = gameWidth / 3 / this.textures.get('0').getSourceImage().width;

    this.images.forEach((image, index) => {
      let randomX = Phaser.Math.Between(padding, gameWidth - padding);
      let randomY = Phaser.Math.Between(padding, gameHeight - padding);
      image.setPosition(randomX, randomY);
      image.setScale(this.gameScale);
    });
  }

  update(time: number, delta: number) {
    this.images.forEach((image, index) => {
      if (!image.visible) return;

      image.x += this.velocities[index].x * delta / 1000;
      image.y += this.velocities[index].y * delta / 1000;

      if (image.x <= image.displayWidth / 2 || image.x >= this.cameras.main.width - image.displayWidth / 2) {
        this.velocities[index].x *= -1;
      }

      if (image.y <= image.displayHeight / 2 || image.y >= this.cameras.main.height - image.displayHeight / 2) {
        this.velocities[index].y *= -1;
      }
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',
  scene: MyGame,
  parent: 'game',
  backgroundColor: '#FFDFE6',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
