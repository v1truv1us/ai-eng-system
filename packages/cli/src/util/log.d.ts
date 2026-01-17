export declare namespace Log {
    type Level = "DEBUG" | "INFO" | "WARN" | "ERROR";
    interface Options {
        print: boolean;
        level?: Level;
        logDir?: string;
    }
    function file(): string;
    function init(options: Options): Promise<void>;
    interface Logger {
        debug(message: string, extra?: Record<string, any>): void;
        info(message: string, extra?: Record<string, any>): void;
        warn(message: string, extra?: Record<string, any>): void;
        error(message: string, extra?: Record<string, any>): void;
    }
    function create(tags?: Record<string, string>): Logger;
    const Default: Logger;
}
