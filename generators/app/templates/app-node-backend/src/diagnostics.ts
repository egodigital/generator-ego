import * as _ from 'lodash';
import * as egoose from '@egodigital/egoose';
import { AppContext } from './contracts';
import { Log } from './entities/Log';

/**
 * The global logger.
 */
export const LOGGER = new egoose.Logger();

/**
 * Initializes the global logger.
 *
 * @param {AppContext} app The underlying application context.
 */
export async function initLogger(app: AppContext) {
    // console
    app.logger.addAction((ctx) => {
        if (ctx.type >= egoose.LogType.Debug) {
            if (!egoose.IS_LOCAL_DEV) {
                return;
            }
        }

        let icon: string;
        let logFunc = console.log;

        if (egoose.LogType.Emerg === ctx.type) {
            icon = `☢️`;
        } else if (egoose.LogType.Alert === ctx.type) {
            icon = `🚨`;
        } else if (egoose.LogType.Crit === ctx.type) {
            icon = `🧨`;
        } else if (egoose.LogType.Err === ctx.type) {
            icon = `❗️`;
        } else if (egoose.LogType.Warn === ctx.type) {
            icon = `⚠️`;
        } else if (egoose.LogType.Notice === ctx.type) {
            icon = `📢`;
        } else if (egoose.LogType.Info === ctx.type) {
            icon = `ℹ️ `;
        } else if (egoose.LogType.Debug === ctx.type) {
            icon = `🔬`;
        }

        if (ctx.type <= egoose.LogType.Err) {
            logFunc = console.error;
        } else if (ctx.type <= egoose.LogType.Warn) {
            logFunc = console.warn;
        } else if (ctx.type <= egoose.LogType.Notice) {
            logFunc = console.info;
        } else if (ctx.type <= egoose.LogType.Debug) {
            logFunc = console.debug;
        } else if (ctx.type <= egoose.LogType.Trace) {
            logFunc = console.trace;
        }

        logFunc.bind(console)(
            `${icon ? (icon + ' ') : ''} ${ctx.time.format('YYYY-MM-DD HH:mm:ss')} => [${ctx.tag}] ${ctx.message}`
        );
    });

    app.logger.addAction((ctx) => {
        app.withDatabase(async (conn) => {
            let newLog = conn.manager.create(Log);
            if (!egoose.isEmptyString(ctx.tag)) {
                newLog.tag = egoose.normalizeString(ctx.tag);
            }
            newLog.message = ctx.message;
            newLog.type = ctx.type;
            newLog.time = egoose.utc()
                .toDate();

            newLog = await conn.manager.save(newLog);
        }).catch((err) => {
            console.error(err);
        });
    });
}