#!/bin/bash
cd /home/kavia/workspace/code-generation/secure-user-authentication-system-141101-141110/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

