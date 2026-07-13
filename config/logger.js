import pino from "pino";

const logger = pino({
  level: "info",

  transport: {
    targets: [
      {
        target: "pino-pretty",
        level: "info",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
      {
        target: "pino/file",
        level: "info",
        options: {
          destination: "./logs/app.log",
          mkdir: true,
        },
      },
      {
        target: "pino/file",
        level: "error",
        options: {
          destination: "./logs/error.log",
          mkdir: true,
        },
      },
    ],
  },
});

export default logger;
