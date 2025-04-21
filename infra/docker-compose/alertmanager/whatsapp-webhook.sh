#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' /home/agzo/consolidated_bills/infra/docker-compose/.env | xargs)

# Get the alert message from stdin (e.g. from Alertmanager)
MESSAGE=$(jq -r '.alerts[0].annotations.description' < /dev/stdin)

# Send message via CallMeBot
curl -s -X GET "https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${MESSAGE// /+}&apikey=${CALLMEBOT_APIKEY}"


