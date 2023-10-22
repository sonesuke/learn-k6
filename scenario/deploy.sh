# make a zip file for deployment
zip scenario scripts/*
aws s3 cp scenario.zip s3://k6-attacker-source-bucket/scenario.zip
