'use strict';

const request = require('supertest');
const assert = require('assert');
const util = require('util');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.run = util.promisify(db.run);
db.get = util.promisify(db.get);
db.all = util.promisify(db.all);

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => { 
            if (err) {
                return done(err);
            }

            buildSchemas(db);

            done();
        });
    });

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('GET /rides/:id', () => {
        before((done) => {
            const values = [1, 1, 2, 2, 'john', 'peter', 'toyota vios'];
            db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
                if (err) {
                    return done(err);
                }
            });
            done();
        });
        it('should return a ride', (done) => {
            request(app)
                .get('/rides/1')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    console.log(response.body)
                    assert(response.body.rideID, 1);
                    assert(response.body.startLat, 1);
                    assert(response.body.startLong, 1);
                    assert(response.body.endLat, 2);
                    assert(response.body.endLong, 2);
                    assert(response.body.riderName, 'john');
                    assert(response.body.driverName, 'peter');
                    assert(response.body.driverVehicle, 'toyota vios');
                    done();
                }).catch(err => done(err));
        });
        it('should return a 404 when rideID does not exist', (done) => {
            request(app)
                .get('/rides/2')
                .expect('Content-Type', /json/)
                .expect(404)
                .then(response => {
                    assert(response.body.error_code, 'RIDES_NOT_FOUND_ERROR');
                    assert(response.body.message, 'Could not find any rides');
                    done();
                }).catch(err => done(err));
        });
    });

    describe('GET /rides', () => {
        before((done) => {
            const values = [1, 1, 2, 2, 'john', 'peter', 'toyota vios'];
            for (let i = 0; i < 6; i++) {
                db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
                    if (err) {
                        return done(err);
                    }
                });
            }
            done();
        });
        describe('GET all /rides', () => {
            it('should return all rides', (done) => {
                request(app)
                    .get('/rides')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .then(response => {
                        assert(response.body.rides.length, 6);
                        done();
                    }).catch(err => done(err));
            });
        });
        describe('GET paginated /rides', () => {
            it('should return the first 2 rides', (done) => {
                request(app)
                    .get('/rides?limit=2&order=ASC')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .then(response => {
                        assert(response.body.rides.length, 2);
                        assert(response.body.rides[0].rideID, 1);
                        assert(response.body.rides[1].rideID, 2);
                        assert(response.body.next_cursor, 3);
                        done();
                    }).catch(err => done(err));
            });
            it('should return the next 2 rides', (done) => {
                request(app)
                    .get('/rides?limit=2&next_cursor=3&order=ASC')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .then(response => {
                        assert(response.body.rides.length, 2);
                        assert(response.body.rides[0].rideID, 3);
                        assert(response.body.rides[1].rideID, 4);
                        assert(response.body.next_cursor, 5);
                        done();
                    }).catch(err => done(err));
            });
            it('should return the last 2 rides', (done) => {
                request(app)
                    .get('/rides?limit=2&next_cursor=5&order=ASC')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .then(response => {
                        assert(response.body.rides.length, 2);
                        assert(response.body.rides[0].rideID, 5);
                        assert(response.body.rides[1].rideID, 6);
                        done();
                    }).catch(err => done(err));
            });
            it('should return a 422 when a field is invalid', (done) => {
                request(app)
                    .get('/rides?limit=WORD&next_cursor=5&order=TEST')
                    .expect('Content-Type', /json/)
                    .expect(422)
                    .then(response => {
                        assert(response.body.error_code, 'VALIDATION_ERROR');
                        done();
                    }).catch(err => done(err));
            });
        });
    });

    
    describe('POST /rides', () => {
        before((done) => {
            const values = [1, 1, 2, 2, 'john', 'peter', 'toyota vios'];
            db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
                if (err) {
                    return done(err);
                }
            });
            done();
        });
        it('should return a ride', (done) => {
            request(app)
                .post('/rides')
                .send({
                    start_lat: 1,
                    start_long: 1,
                    end_lat: 2,
                    end_long: 2,
                    rider_name: 'john',
                    driver_name: 'peter',
                    driver_vehicle: 'toyota vios'
                })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    assert(response.body.rideID, 1);
                    assert(response.body.startLat, 1);
                    assert(response.body.startLong, 1);
                    assert(response.body.endLat, 2);
                    assert(response.body.endLong, 2);
                    assert(response.body.riderName, 'john');
                    assert(response.body.driverName, 'peter');
                    assert(response.body.driverVehicle, 'toyota vios');
                    done();
                }).catch(err => done(err));
        });
        it('should return a 422 when a field is invalid', (done) => {
            request(app)
                .post('/rides')
                .send({
                    start_lat: 1,
                    start_long: -1000,
                    end_lat: 2,
                    end_long: 2,
                    rider_name: 'john',
                    driver_name: 'peter',
                    driver_vehicle: 'toyota vios'
                })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(422)
                .then(response => {
                    assert(response.body.error_code, 'VALIDATION_ERROR');
                    assert(response.body.message, 'Start Longitude must be -180 to 180 degrees');
                    done();
                }).catch(err => done(err));
        });
    });
});