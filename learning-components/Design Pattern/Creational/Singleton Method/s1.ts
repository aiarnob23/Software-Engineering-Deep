export default class Logger {
    private static instance: Logger;

    private constructor() {
        console.log("Logger instance created");
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    log(message: string) {
        console.log(`[LOG]: ${message}`);
    }
}


//Usage
const logger = Logger.getInstance();
logger.log("Server started");