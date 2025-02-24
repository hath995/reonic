
# Reonic Backend Coding Challenge

## Submission for [Aaron Elligsen](https://www.linkedin.com/in/aaronelligsen/)

### Setup

Using docker run the following commands to setup a postgres database
```sh
docker build -t reonic-coding-challenge-db .
docker run --name reonic-coding-challenge-db -p 5432:5432 -d reonic-coding-challenge-db
touch .env
```
in the .env fill in these values

```ini
POSTGRES_DB=reonic-coding-challenge
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mypassword123!
POSTGRES_HOST=localhost:5432
```

then run the following commands
```sh
npm install
#if on apple
npm run compile_runner_mac
#else if on windows
npm run compile_runner_win 
npm start
```


### APIs

```
GET /simulations
POST /simulations
PUT /simulations/:simulationId/settings
PUT /simulations/:simulationId/settings/partial
GET  /simulations/:simulationId/demand-probabilities
POST /simulations/:simulationId/demand-probabilities
PUT  /simulations/:simulationId/demand-probabilities
GET /simulations/:simulationId/arrival-probabilities
PUT /simulations/:simulationId/arrival-probabilities
POST /simulations/:simulationId/simulate
GET /simulations/:simulationId/results
```

Each route which accepts data from the user is validated using the Zod library. Here I am using integer indexes and routes for convenience. However, in a production application it would be better to use a uuid or something similar. 


## Workflow

### Setup
Create a new simulation by using the /simulations post route. The default simulation 0 is always created and can be used for simulation as well. 

```sh
curl --location 'localhost:3000/simulations' \
--header 'Content-Type: application/json' \
--data '{"name": "test 1", "seed": 123}'
```

Upon creation of a new simulation each simulation is given a copy of the default settings which can either be modified or added to. 

For example to increase the number of charging ports from 20 to 30. 
```sh
curl --location --request PUT 'localhost:3000/simulations/1/settings/partial' \
--header 'Content-Type: application/json' \
--data '[["chargePoints", 30]]'
```

### Simulation
Once you have edit the parameters as needed it is time to run a simulation.

```sh
curl --location 'localhost:3000/simulations/0/simulate' \
--header 'Content-Type: application/json' \
--data '{"start_timestamp":"2025-01-01 00:00:00", "end_timestamp":"2026-01-01 00:00:00"}'
```

This will take a few seconds (~5-6) to complete. Once finished you can observe the data in the database or by the provided summary route.

```sh
curl --location 'localhost:3000/simulations/0/results'
```

### Feautures and Limitations

#### Threaded
As the simulation is a rather long running and potentially heavy calculation it is best to move it onto a separate thread. I have done this using the nodejs worker thread api so that a calculation is not blocking the web server from responding. 

#### Deterministic
A deterministic psuedorandom number library Prando was used so that a simulation can be rerun as well as broken up into smaller periods, paused and resumed. 

For example
```sh
curl --location 'localhost:3000/simulations' \
--header 'Content-Type: application/json' \
--data '{"name": "test 2", "seed": 123}' #returning id = 2

curl --location 'localhost:3000/simulations' \
--header 'Content-Type: application/json' \
--data '{"name": "test 3", "seed": 123}' #returning id = 3

curl --location 'localhost:3000/simulations/2/simulate' \
--header 'Content-Type: application/json' \
--data '{"start_timestamp":"2025-01-01 00:00:00", "end_timestamp":"2025-03-01 00:00:00"}'

#will be equal to
curl --location 'localhost:3000/simulations/3/simulate' \
--header 'Content-Type: application/json' \
--data '{"start_timestamp":"2025-01-01 00:00:00", "end_timestamp":"2025-02-01 00:00:00"}'
# Please wait for completion before running the following
curl --location 'localhost:3000/simulations/3/simulate' \
--header 'Content-Type: application/json' \
--data '{"start_timestamp":"2025-02-01 00:00:00", "end_timestamp":"2025-03-01 00:00:00"}'

#if we compare the following they should be identical
curl --location 'localhost:3000/simulations/2/results'
curl --location 'localhost:3000/simulations/3/results'

```

### Limitations
Currently, there are no protections against rerunning a simulation twice or more and generating overlapping records. With a bit more work it would be ideal to make multiple simulation calls for the same simulation and period idempotent. 

Although a simulation can be resumed from a previous stopping point it is necessary to process these simulation commands sequentially or the records needed to continue might not be present yet. Potentially, this could be solved in a couple ways, either with a lock to the simulation id prevent calculations from starting until the previous sim finished or by building a reconcilliation process which could be a bit tricky.


