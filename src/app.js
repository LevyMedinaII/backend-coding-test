'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

module.exports = (db) => {
    app.get('/health', (req, res) => res.send('Healthy'));

    app.post('/rides', jsonParser, (req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Driver name must be a non empty string'
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Vehicle must be a non empty string'
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];
        
        db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    return res.send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error'
                    });
                }

                res.send(rows);
            });
        });
    });

    app.get('/rides', (req, res) => {
        const DEFAULT_ORDER = 'ASC';
        const order = req.query.order || DEFAULT_ORDER;
        const limit = Number(req.query.limit);
        let nextCursor = Number(req.query.next_cursor);

        let query = 'SELECT * FROM Rides';

        if (nextCursor && typeof nextCursor !== 'number') {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Pagination next_cursor must be a valid number'
            });
        }

        if (limit && typeof limit !== 'number') {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Pagination limit must be a valid number'
            });
        }

        if (order && (typeof order !== 'string' || !['ASC', 'DESC'].find(o => o === order))) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Pagination order must either be ASC or DESC'
            });
        }

        if (nextCursor) {
            if (order === 'DESC') {
                query = `${query} WHERE rideID <= ${nextCursor}`;
            } else {
                query = `${query} WHERE rideID >= ${nextCursor}`;
            }
        }
        if (order) {
            query = `${query} ORDER BY rideID ${order}`;
        }
        if (limit) {
            query = `${query} LIMIT ${limit + 1}`;
        }

        db.all(query, function (err, rows) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

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
        });
    });

    app.get('/rides/:id', (req, res) => {
        db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    return app;
};
