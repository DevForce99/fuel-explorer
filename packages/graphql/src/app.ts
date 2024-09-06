import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config';
import { logger } from './core/Logger';
import { GraphQLServer } from './graphql/GraphQLServer';
import { BlockResolver } from './graphql/resolvers/BlockResolver';
import { DatabaseConnection } from './infra/database/DatabaseConnection';
import { Server } from './infra/server/App';

(async () => {
  const port = Number(env.get('SERVER_PORT'));
  const graphQLServer = new GraphQLServer();
  const schema = graphQLServer.schema();
  const yoga = graphQLServer.setup(schema);
  const httpServer = new Server();
  const app = httpServer.setup();

  // Create a new HTTP server to handle both GraphQL and WebSocket
  const server = http.createServer(app);
  const io = new SocketIOServer(server, { cors: { origin: '*' } });

  // Initialize the database
  DatabaseConnection.getInstance();

  // Use the Yoga server for GraphQL on the same app
  app.use(yoga.graphqlEndpoint, yoga);

  // Listen on the same port for both HTTP and WebSocket
  server.listen(port, async () => {
    logger.info(
      `📟 GraphQL server is running on http://localhost:${port}${yoga.graphqlEndpoint}`,
    );
    logger.info('📝 GraphQLYoga event logs are available at logs/graphql.log');
    logger.info(`🚀 WebSocket server is running on port ${port}`);

    // WebSocket setup for TPS data streaming
    io.on('connection', async (socket) => {
      logger.info(`⚡ Client connected: ${socket.id}`);

      const blockResolver = BlockResolver.create();
      let lastBlockId: string | null = null;

      // Stream TPS data every second if the block ID changes
      const streamTPS = async () => {
        try {
          // Fetch the TPS data using BlockResolver
          const tpsData = await blockResolver.Query.tps(null, { last: 5 });

          // Only send the TPS data if the block ID is different from the previous one
          const latestBlockId = tpsData.nodes[0]?.blockNo;
          if (latestBlockId && latestBlockId !== lastBlockId) {
            lastBlockId = latestBlockId;
            socket.emit('tps_data', tpsData);
          }
        } catch (error) {
          logger.error('Error streaming TPS data:', error);
        }
      };

      // Initial data stream and periodic updates
      streamTPS();
      const intervalId = setInterval(streamTPS, 1000);

      // Handle client disconnect
      socket.on('disconnect', () => {
        clearInterval(intervalId);
        logger.info(`⚡ Client disconnected: ${socket.id}`);
      });
    });

    // Graceful shutdown for HTTP and WebSocket servers
    const others = ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'];
    //biome-ignore lint/complexity/noForEach: <explanation
    others.forEach((eventType) => {
      process.on(eventType, async (err) => {
        logger.error('❌ GraphQL or WebSocket shutdown error', err);
        process.exit(1);
      });
    });
  });
})();
