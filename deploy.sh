#!/bin/bash
set -e

echo "==== Building and deploying React app ===="
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
firebase deploy --only hosting

echo "==== Building and deploying Firebase Functions ===="
cd backend-functions
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run lint -- --fix
npm run build
firebase deploy --only functions

echo "==== Deployment completed successfully! ===="
