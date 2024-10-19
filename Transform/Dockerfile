FROM python:alpine

WORKDIR /streamer

RUN apk add ffmpeg

RUN python3 -m venv venv

RUN ./venv/bin/pip install "fastapi[standard]" ffmpeg-python

RUN mkdir library

COPY . .

EXPOSE 8000

CMD ["./venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]