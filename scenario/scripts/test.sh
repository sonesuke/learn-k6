set -eu

DIR=$(date +%Y%m%d%H%M)
echo ${DIR}
mkdir ${DIR}
mv scripts ${DIR}
cd ${DIR}
mkdir screenshots
mkdir results

docker run -i -u $(id -u):$(id -g) -v $(pwd):/app grafana/k6:master-with-browser run /app/scripts/test.js --out json=/app/results/result.json --out csv=/app/results/result.csv

