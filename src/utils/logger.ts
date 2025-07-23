const isProduction = process.env.EXPO_PUBLIC_ENVIRONMENT === 'production';

class Logger {
  private prefix: string;

  constructor(prefix: string = 'App') {
    this.prefix = prefix;
  }

  log(message: string, ...args: any[]) {
    if (!isProduction) {
      console.log(`[${this.prefix}] ${message}`, ...args);
    }
  }

  error(message: string, error?: any) {
    // En producción, solo loggeamos errores críticos
    if (isProduction) {
      console.error(`[${this.prefix}] ERROR: ${message}`, error);
    } else {
      console.error(`[${this.prefix}] ${message}`, error);
    }
  }

  warn(message: string, ...args: any[]) {
    if (!isProduction) {
      console.warn(`[${this.prefix}] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (!isProduction) {
      console.info(`[${this.prefix}] ${message}`, ...args);
    }
  }
}

export const createLogger = (prefix: string) => new Logger(prefix);
export const logger = new Logger(); 