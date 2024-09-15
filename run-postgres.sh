#!/bin/sh

docker run --name postgres-docker \
-e POSTGRES_PASSWORD='1234' \
-d postgres