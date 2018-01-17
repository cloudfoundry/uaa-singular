#!/usr/bin/env bash
./node_modules/http-server/bin/http-server > test/tmp/httpServer.log 2> test/tmp/httpServer.err.log -p 8000 &
echo $! > test/tmp/httpServer.pid.tmp
