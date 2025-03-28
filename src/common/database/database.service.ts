import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      user: this.configService.get('DB_USERNAME', 'postgres'),
      password: this.configService.get('DB_PASSWORD', 'postgres'),
      database: this.configService.get('DB_DATABASE', 'pratix'),
      ssl: {
        rejectUnauthorized: false // Necessário para conexões com o Render
      }
    });
  }

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      client.release();
      console.log('Database connection established');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('Database connection closed');
  }

  async query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    const start = Date.now();
    const result = await this.pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log(`Executed query: ${text} - Duration: ${duration}ms`);
    return result;
  }

  async getClient() {
    const client = await this.pool.connect();
    return client;
  }
}