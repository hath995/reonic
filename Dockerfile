FROM postgres:17

ENV POSTGRES_DB=reonic-coding-challenge
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=mypassword123!

# docker build -t reonic-coding-challenge-db .
# docker run --name reonic-coding-challenge-db -p 5432:5432 -d reonic-coding-challenge-db