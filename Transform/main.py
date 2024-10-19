# TO RUN DEV: fastapi dev main.py
# TO RUN PRD: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

from fastapi import FastAPI
import ffmpeg
import os

app = FastAPI()

@app.get("/")
def read_root():
    return {"Status": "Success", "Message": "ffmpeg server is online 😊"}

@app.get("/transform/{media}")
def transform_to_m3u8(media: str):
    filename = media.split('.')
    os.makedirs(os.path.join('./library', filename[0]), exist_ok=True)

    input_video = f'./library/{media}'
    output_playlist = './library/'+filename[0]+'/'+filename[0]+'.m3u8'
    convert_to_hls(input_video, output_playlist)
    return {"Status": "Success", "Message": "Video converted successfully."}


def convert_to_hls(video_path, output_path):
    output_dir = output_path.rsplit('/', 1)[0]
    (
        ffmpeg
        .input(video_path)
        .output(output_path, format='hls', hls_time=10, hls_playlist_type='vod', hls_segment_filename=f'{output_dir}/%03d.ts')
        .run()
    )