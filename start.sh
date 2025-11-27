set -e
npx pm2 start dist/server.js --name server
npx pm2 start dist/workers/runWorkers.js --name worker
npx pm2 logs
