#!/usr/bin/env bash

set -ex

cd test/tmp/uaa
./gradlew cargoStartLocal -Pversion=99.99.99 2>&1 > /dev/null

START_TIME_IN_SEC=$(date +%s)
UAA_START_TIMEOUT_SEC=600

while [ $(($(date +%s) - ${START_TIME_IN_SEC})) -lt ${UAA_START_TIMEOUT_SEC} ]; do
  resp=$(set +e; curl -sf "http://localhost:8080/uaa"; echo $?);
  if [ "${resp}" = "0" ]; then
    echo "UAA is now running";
    break;
  fi
  sleep 5;
done

ACCESS_TOKEN=$(curl http://localhost:8080/uaa/oauth/token -X POST  \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    -H 'Accept: application/json' \
    -d 'client_id=admin&client_secret=adminsecret&grant_type=client_credentials&token_format=opaque&response_type=token' \
    | jq '.access_token' \
    | tr -d '"')

echo "Creating the test client singular-test-client"
curl http://localhost:8080/uaa/oauth/clients -X POST \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H 'Accept: application/json' \
    -d '{
  "scope" : [ "cloud_controller.read", "cloud_controller.write", "openid" ],
  "client_id" : "singular-test-client",
  "resource_ids" : [ ],
  "authorized_grant_types" : [ "implicit" ],
  "redirect_uri" : [ "http://localhost:8000/**"],
  "autoapprove" : true,
  "name" : "Singular Test Client"
}'
