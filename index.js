'use strict';

const port = 8010;

const sqlite3 = require('sqlite3').verbose();
const util = require('util');

const db = new sqlite3.Database(':memory:');

db.run = util.promisify(db.run);
db.get = util.promisify(db.get);
db.all = util.promisify(db.all);

const buildSchemas = require('./src/schemas');
const logger = require('./src/utils/logger');

const compression = require('compression');

db.serialize(() => {
    buildSchemas(db);

    const app = require('./src/app')(db);

    if (process.env.NODE_ENV === 'production') {
        app.use(compression());
    }

    app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});
