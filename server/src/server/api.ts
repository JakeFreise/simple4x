import express from 'express';
import { Game } from '../game/Game';


export function setupApiRoutes(app: express.Express, game: Game) {
  const router = createApiRouter(game);
  app.use('/api', router);
}

export function createApiRouter(game: Game) {
  const router = express.Router();

  router.get('/state', (_req, res) => {
    console.log('Pushing State', game.getLatestSnapshot());
    res.json({
      currentPhase: game.getCurrentPhase(),
      history: game.getHistory(),
      fullState: game.getLatestSnapshot(),
      submittedNations: game.getSubmittedNations(),
    });
  });

  return router;
}
