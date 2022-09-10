import { useEffect } from "react";
import enemy1 from "../assets/img/enemy1.png"; // 1758 × 155 -> 293 * 6 * 155

const W_SPRITE = 293;
const H_SPRITE = 155;
const W = 100;
const H = W * (H_SPRITE / W_SPRITE);
const TOTAL_FRAMES = 6;
const STTAGER_FRAMES = 5;

export const Mascot = () => {
  useEffect(() => {
    let animId = 0;
    let currentCol = 0;
    let timer = 0;

    const ctx = cvs.getContext("2d");
    const sprite = new Image();
    sprite.src = enemy1;

    function animate() {
      ctx?.clearRect(0, 0, W, H);

      ctx?.drawImage(
        sprite,
        currentCol * W_SPRITE,
        0,
        W_SPRITE,
        H_SPRITE,
        0,
        0,
        W,
        H
      );

      if (timer % STTAGER_FRAMES === 0) {
        currentCol = (currentCol + 1) % TOTAL_FRAMES;
      }

      ++timer;
      animId = requestAnimationFrame(animate);
    }
    animate();
    return () => {
      window.cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas id="cvs" width={W} height={H} />;
};
