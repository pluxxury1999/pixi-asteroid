import { Application } from "pixi.js";
import { Game } from "./game/Game";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application with fixed canvas size
  await app.init({ 
    background: "#000011", 
    width: 1280, 
    height: 720,
    antialias: true
  });

  // Append the application canvas to the document body
  const container = document.getElementById("pixi-container");
  if (container) {
    container.appendChild(app.canvas);
  }

  // Create and start the game
  const game = new Game(app);
  game.start();
})();
