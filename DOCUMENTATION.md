# Rider API
An API for storing and retrieving rides built with ExpressJS and SQLite.

## Setup & Usage
1. Pull this repository.
2. Install Node (>8.6 and <= 10) and npm are installed.
3. Install the dependencies via `npm install`.
4. To run the server, run `npm start`.
5. To run the server in debug mode, run `npm run start-dev`.
6. To convert this documentation file to HTML format, run `npm run documentation`.

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

### Get All Rides
Returns all stored rides.

**URI:** /rides

**Request Method:** GET

**Response Body:**
```
[
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
]
```

### Create a Ride
Returns all stored rides.

**URI:** /rides

**Request Method:** POST

**Request Body:**
```
{
    startLat<decimal>: starting latitude coordinate of the ride,
    startLong<decimal>: starting longitude coordinate of the ride,
    endLat<decimal>: ending latitude coordinate of the ride,
    endLong<decimal>: ending longitude coordinate of the ride,
    riderName<string>: name of the rider,
    driverName<string>: name of the driver,
    driverVehicle<string>: name of the vehicle
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
