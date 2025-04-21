from flask import Flask, request, jsonify
import subprocess
import logging
import sys
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('webhook')

# Initialize Flask app
app = Flask(__name__)

@app.route("/", methods=["POST"])
def alert():
    try:
        data = request.get_data()
        logger.info(f"Received alert webhook: {data[:200]}...")
        
        # Check if script exists
        script_path = "/scripts/whatsapp-webhook.sh"
        if not os.path.isfile(script_path):
            logger.error(f"Script not found: {script_path}")
            return jsonify({"error": "Script not found"}), 500
            
        # Run the webhook script
        result = subprocess.run(
            [script_path], 
            input=data, 
            shell=False, 
            capture_output=True, 
            text=True
        )
        
        # Log the result
        if result.returncode == 0:
            logger.info(f"Alert sent successfully: {result.stdout}")
        else:
            logger.error(f"Error sending alert: {result.stderr}")
            
        return jsonify({"status": "ok", "code": result.returncode}), 200
        
    except Exception as e:
        logger.exception(f"Error processing webhook: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

# Run the app
if __name__ == "__main__":
    logger.info("Starting WhatsApp webhook service on port 5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
