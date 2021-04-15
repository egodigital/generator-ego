import { createLogger, format, transports } from 'winston';
import { IS_DEV, IS_PROD } from './constants';

/**
 * The default logger.
 */
export const logger = createLogger({
    level: IS_DEV ? 'debug' : 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
    ]
});

if (!IS_PROD) {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}
