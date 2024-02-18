Run image:
docker rm -f voiceflow-kuitz && docker run --env NODE_ENV=prod -d --restart=always -p 35486:35486 --name=voiceflow-kuitz registry.kuitz.es/voiceflow-kuitz:latest

Specific version:
docker rm -f voiceflow-kuitz && docker run --env NODE_ENV=prod -d --restart=always -p 35486:35486 --name=voiceflow-kuitz registry.kuitz.es/voiceflow-kuitz:2.0.1

Check tags:
curl -s -X GET https://registry.kuitz.es/v2/voiceflow-kuitz/tags/list