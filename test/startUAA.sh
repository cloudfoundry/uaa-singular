#!/usr/bin/env bash

set -e

cd test/tmp/uaa
./gradlew cargoRunLocal &

while [ true ]; do
  resp=$(set +e; curl -sf "http://localhost:8080/uaa"; echo $?);
  if [ "${resp}" = "0" ]; then
    echo "UAA is now running";
    break;
  fi
  sleep 5;
done
