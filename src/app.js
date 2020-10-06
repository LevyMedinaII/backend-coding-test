'use strict';

const express = require('express');
const app = express();
const util = require('util');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const logger = require('./utils/logger');

const { validateLatitude, validateLongitude, validateName } = require('./validators/rides');
const { validateOrder } = require('./validators/pagination');
const { validateNumber } = require('./validators/typing');
const { DatabaseError } = require('./errors');

module.exports = (db) => {
    app.get('/health', (req, res) => res.send('Healthy'));

    app.post('/rides', jsonParser, async (req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        try {
            validateLatitude(startLatitude, 'Start latitude must be -90 to 90 degrees');
            validateLongitude(startLongitude, 'Start Longitude must be -180 to 180 degrees');
            validateLatitude(endLatitude, 'End latitude must be -90 to 90 degrees');
            validateLongitude(endLongitude, 'End Longitude must be -180 to 180 degrees');
            validateName(riderName, 'Rider name must be a non empty string');
            validateName(driverName, 'Driver name must be a non empty string');
            validateName(driverVehicle, 'Vehicle name must be a non empty string');

            var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];
            const statement = db.prepare('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)');

            statement.run = util.promisify(statement.run);
            statement.finalize = util.promisify(statement.finalize);

            await statement.run(values);
            await statement.finalize();

            const ride = await db.get('SELECT * FROM Rides ORDER BY rideID DESC LIMIT 1');

            res.send(ride);
        } catch (err) {
            logger.error(err);
            switch (err.name) {
            case 'ValidationError':
                return res.status(422).send({
                    error_code: err.code,
                    message: err.message,
                });
            default:
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }
        }
    });

    app.get('/rides', async (req, res) => {
        const DEFAULT_ORDER = 'ASC';
        const order = req.query.order || DEFAULT_ORDER;
        const limit = Number(req.query.limit);
        let nextCursor = Number(req.query.next_cursor);

        try {
            if (order) validateOrder(order);
            if (limit) validateNumber(limit, 'Pagination limit must be a valid number');
            if (nextCursor) validateNumber(nextCursor, 'Pagination next_cursor must be a valid number');

            let query = 'SELECT * FROM Rides';
            const dbValues = [];
            if (nextCursor) {
                if (order === 'DESC') {
                    query = `${query} WHERE rideID <= ?`;
                } else {
                    query = `${query} WHERE rideID >= ?`;
                }
                dbValues.push(nextCursor);
            }
            if (order) {
                if (order === 'DESC') query = `${query} ORDER BY rideID DESC`;
                else query = `${query} ORDER BY rideID ASC`;
            }
            if (limit) {
                query = `${query} LIMIT ?`;
                dbValues.push(limit+1);
            }

            const statement = db.prepare(query);

            statement.all = util.promisify(statement.all);
            statement.finalize = util.promisify(statement.finalize);
            const rows = await statement.all(dbValues);
            await statement.finalize();

            if (rows.length === 0) throw new DatabaseError('RIDES_NOT_FOUND_ERROR', 'Could not find any rides');

            if (rows.length > limit) {
                const nextCursorRide = rows.pop();
                nextCursor = nextCursorRide.rideID;
            } else {
                nextCursor = null;
            }

            res.send({
                rides: rows,
                limit,
                next_cursor: nextCursor,
                order,
            });
        } catch (err) {
            logger.error(err);
            switch (err.name) {
            case 'ValidationError':
                return res.status(422).send({
                    error_code: err.code,
                    message: err.message,
                });
            case 'DatabaseError':
                return res.status(404).send({
                    error_code: err.code,
                    message: err.message,
                });
            default:
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }
        }


    });

    app.get('/rides/:id', async (req, res) => {
        try {
            const statement = db.prepare(`SELECT * FROM Rides WHERE rideID=?`);

            statement.get = util.promisify(statement.get);
            statement.finalize = util.promisify(statement.finalize);

            const ride = await statement.get([req.params.id]);
            await statement.finalize();

            if (!ride) throw new DatabaseError('RIDES_NOT_FOUND_ERROR', 'Could not find any rides');

            res.send(ride);
        } catch (err) {
            logger.error(err);
            switch (err.name) {
            case 'DatabaseError':
                return res.status(404).send({
                    error_code: err.code,
                    message: err.message,
                });
            default:
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }
        }
    });

    return app;
};
