FROM python:3.9-slim

# Environment variables
ENV ENV_FILE=/run/secrets/envvars

# Install required tools
RUN apt-get update && apt-get install -y gettext-base jq curl

# Set up directories
WORKDIR /app
RUN mkdir -p /scripts

# Copy application files
COPY webhook.py /app/
COPY whatsapp-webhook.sh /scripts/
COPY alertmanager.tmpl.yml /etc/alertmanager/alertmanager.tmpl.yml

# Make script executable
RUN chmod +x /scripts/whatsapp-webhook.sh

# Install Python dependencies
RUN pip install flask

# Expose the port
EXPOSE 5001

# Start the Flask app
CMD ["python", "webhook.py"]
