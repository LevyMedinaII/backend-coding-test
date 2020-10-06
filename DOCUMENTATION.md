# Rider API

[![Build Status](https://travis-ci.com/LevyMedinaII/backend-coding-test.svg?token=wH1SvmquyGVoZYzTsppH&branch=master)](https://travis-ci.com/LevyMedinaII/backend-coding-test)

An API for storing and retrieving rides built with ExpressJS and SQLite.


## Setup & Usage
1. Pull this repository.
2. Install Node (>8.6 and <= 10) and npm are installed.
3. Install the dependencies via `npm install`.
4. To run the server, run `npm start`.
5. To run the server in debug mode, run `npm run start:dev`.
6. To convert this documentation file to HTML format, run `npm run documentation`.
7. To run the eslint linter and autofix errors, run `npm run lint-fix`.
8. To load test, run `npm test:load`.

## Routes
### Get Ride
Returns a ride given an id.

**URI:** /rides/:id

**Request Method:** GET

**Response Body:**
```
{
    rideID<integer>: unique id for each ride,
    startLat<decimal>: starting latitude coordinate of the ride,
    startLong<decimal>: starting longitude coordinate of the ride,
    endLat<decimal>: ending latitude coordinate of the ride,
    endLong<decimal>: ending longitude coordinate of the ride,
    riderName<string>: name of the rider,
    driverName<string>: name of the driver,
    driverVehicle<string>: name of the vehicle,
    created<datetime>: date the ride was saved
}
```

### Get Multiple Rides
Returns multiple stored rides. Pagination is supported through `cursoring`. As long are there are rides not included in the initial request, the response will contain a `next_cursor`. Using that `next_cursor` as a query parameter in the next request with the same `order`, and `limit` will return the next set of entries.

**URI:** /rides

**Request Method:** GET

**Query Parameters:**
```
{
    order <optional string, ASC|DESC, default: ASC>: defines the sorting of the result,
    next_cursor <optional integer>: indicates the starting rideID of the rides to be fetched,
    limit <optional integer>: defines the number of entries to be fetched, will return all rides if empty
}

**Response Body:**
```
{
    rides<list>: [
        {
            rideID<integer>: unique id for each ride,
            startLat<decimal>: starting latitude coordinate of the ride,
            startLong<decimal>: starting longitude coordinate of the ride,
            endLat<decimal>: ending latitude coordinate of the ride,
            endLong<decimal>: ending longitude coordinate of the ride,
            riderName<string>: name of the rider,
            driverName<string>: name of the driver,
            driverVehicle<string>: name of the vehicle,
            created<datetime>: date the ride was saved
        },
        ...
    ],
    order<optional string, ASC|DESC>: defines the sorting of the result,
    next_cursor <optional integer>: next_cursor value to be used to fetch the next set of entries,
    limit <optional integer>: defines the number of entries fetched, 
}
```

### Create a Ride
Returns all stored rides.

**URI:** /rides

**Request Method:** POST

**Request Body:**
```
{
    start_lat <decimal>: starting latitude coordinate of the ride,
    start_long <decimal>: starting longitude coordinate of the ride,
    end_lat <decimal>: ending latitude coordinate of the ride,
    end_long <decimal>: ending longitude coordinate of the ride,
    rider_name <string>: name of the rider,
    driver_name <string>: name of the driver,
    driver_vehicle <string>: name of the vehicle
}
```

**Response Body:**
```
{
    rideID<integer>: unique id for each ride,
    startLat<decimal>: starting latitude coordinate of the ride,
    startLong<decimal>: starting longitude coordinate of the ride,
    endLat<decimal>: ending latitude coordinate of the ride,
    endLong<decimal>: ending longitude coordinate of the ride,
    riderName<string>: name of the rider,
    driverName<string>: name of the driver,
    driverVehicle<string>: name of the vehicle,
    created<datetime>: date the ride was saved
}
```

## Automatic HTML Documentation
The Rider API supports conversion of this DOCUMENTATION.md file into HTML format using `showdown`.

1. Install dependencies via `npm install`.
2. Run `npm run documentation`.
3. The HTML files will appear inside  `documentation/`.
4. Deploy these static HTML files to the deployment platform of choice.
