'use strict';

const request = require('supertest');
const assert = require('assert');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

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

    describe('GET /rides', () => {
        before((done) => {
            const values = [0, 0, 1, 1, 'john', 'peter', 'toyota vios'];
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
        });
    });
});