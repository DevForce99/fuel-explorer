import { WebSocketServer } from 'ws';
import { logger } from '~/core/Logger';
import BlockDAO from '../dao/BlockDAO';

export class WebSocketService {
  private wss: WebSocketServer;
  private blockDAO: BlockDAO;

  constructor(httpServer: any) {
    // Attach WebSocket server to the existing HTTP server
    this.wss = new WebSocketServer({ server: httpServer });
    this.blockDAO = new BlockDAO();

    this.wss.on('connection', async (ws: any) => {
      logger.info('🔗 Client connected to WebSocket');

      // Send initial data on connection (6 blocks)
      await this.sendTpsData(ws, 6, 'Error fetching initial TPS data');

      // Set up periodic data fetch every 2 seconds (3 blocks)
      const interval = this.setupPeriodicData(ws, 3);

      // Handle WebSocket close and clear the interval
      ws.on('close', () => this.handleDisconnection(interval));
    });
  }

  private async sendTpsData(
    ws: any,
    blockCount: number,
    errorMessage: string,
  ): Promise<void> {
    try {
      const tpsData = await this.blockDAO.tps(
        { cursor: null, direction: 'before' },
        blockCount, // Fetch the specified number of blocks
      );
      ws.send(JSON.stringify({ type: 'tps_data', data: tpsData }));
    } catch (error) {
      this.handleError(ws, errorMessage, error);
    }
  }

  // Set up an interval to send periodic TPS data (default 3 blocks every 2 seconds)
  private setupPeriodicData(ws: any, blockCount: number): NodeJS.Timeout {
    return setInterval(async () => {
      if (ws.readyState === ws.OPEN) {
        await this.sendTpsData(
          ws,
          blockCount,
          'Error fetching periodic TPS data',
        );
      }
    }, 2000); // Every 2 seconds
  }

  // Handle client disconnection and clear the interval
  private handleDisconnection(interval: NodeJS.Timeout): void {
    logger.info('🔌 Client disconnected from WebSocket');
    clearInterval(interval);
  }

  // Handle and log errors
  private handleError(ws: any, errorMessage: string, error: any): void {
    logger.error(`${errorMessage}:`, error);
    ws.send(JSON.stringify({ type: 'error', message: errorMessage }));
  }

  // Broadcast a message to all connected clients
  broadcast(message: string): void {
    this.wss.clients.forEach((client: any) => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  }
}
