import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.factory';

// Cached across warm Lambda invocations so we only bootstrap Nest once per instance.
let serverPromise: Promise<express.Express> | null = null;

async function createServer(): Promise<express.Express> {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  configureApp(app);
  await app.init();
  return expressApp;
}

export function getServer(): Promise<express.Express> {
  if (!serverPromise) serverPromise = createServer();
  return serverPromise;
}
