// Cloud Logging integration for structured logs
export const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      severity: 'INFO',
      message,
      data,
      timestamp: new Date().toISOString(),
    }));
  },

  error: (message: string, data?: any) => {
    console.error(JSON.stringify({
      severity: 'ERROR',
      message,
      data,
      timestamp: new Date().toISOString(),
    }));
  },

  warn: (message: string, data?: any) => {
    console.warn(JSON.stringify({
      severity: 'WARNING',
      message,
      data,
      timestamp: new Date().toISOString(),
    }));
  },

  debug: (message: string, data?: any) => {
    console.log(JSON.stringify({
      severity: 'DEBUG',
      message,
      data,
      timestamp: new Date().toISOString(),
    }));
  },
};
