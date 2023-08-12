# Backend Server

This repository contains the code for the server, built using FastAPI, and it relies on a Python/Conda virtual environment to manage dependencies.

## Getting Started

### Prerequisites

- Python 3.10
- Conda (Anaconda distribution is recommended)

# Backend Server Setup

This guide will walk you through setting up a Python/Conda virtual environment, activating the environment, and starting the backend server using a Python3 script.

## Setup Instructions

1. Create a Conda virtual environment for the project:

   ```bash
   conda create -n myenv python=3.10
   ```

   or

   ```bash
   python3 -m venv myenv
   ```

   Replace `myenv` with the desired environment name.

2. Activate the virtual environment:

   On macOS and Linux:

   ```bash
   conda activate myenv
   ```

   or

   ```bash
   source myenv/bin/activate
   ```

   On Windows:

   ```bash
   conda activate myenv
   ```

3. Install the required packages:

   ```bash
   pip install -r requirements.txt
   ```

   Make sure you are in the project root directory where the `requirements.txt` file is located.

4. Start the backend server with your `OPENAI_API_KEY`, `OPENAI_API_BASE`, `ACTIVELOOP_TOKEN` for the corresponding `Embedding`, `GPT` models and `DeepLake` account:

   ```bash
   python3 code.py
   ```

   This command will execute the `code.py` script, which will start the backend server. Make sure the script has the necessary server setup and listen to the specified port ("8080" in our demo). You can modify your own keys in `code.py`.

5. Access the backend:

   Once the server is running, you should be able to access the backend using the appropriate API endpoints or by visiting the server URL in your browser.

6. Deactivate the virtual environment:

   When you're done using the virtual environment, you can deactivate it:

   ```bash
   conda deactivate
   ```

If you encounter any issues or need further assistance, please don't hesitate to reach out our team.
