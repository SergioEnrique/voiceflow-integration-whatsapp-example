Run image:
docker rm -f voiceflow-july && docker run --env NODE_ENV=prod -d --restart=always --name=voiceflow-july registry.kuitz.es/voiceflow-july:latest

Specific version:
docker rm -f voiceflow-july:1.0.0 && docker run --env NODE_ENV=prod -d --restart=always -p 35486:35486 --name=voiceflow-july registry.kuitz.es/voiceflow-july:1.0.0

Check tags:
curl -s -X GET https://registry.kuitz.es/v2/voiceflow-july/tags/list