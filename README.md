
# Reonic Backend Coding Challenge

## Submission for [Aaron Elligsen](https://www.linkedin.com/in/aaronelligsen/)

### Setup

Using docker run the following commands to setup a postgres database
```
docker build -t reonic-coding-challenge-db .
docker run --name reonic-coding-challenge-db -p 5432:5432 -d reonic-coding-challenge-db

```

then run the following commands
```
npm install
npm start
```
