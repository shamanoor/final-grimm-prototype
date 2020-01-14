# final-grimm-prototype

How to use this project:

1. Download the zip
2. Download the additional file (for models folder, named 'model-2160.data-00000-of-00001') and add it to the models/Grimm folder. The file is too big to be uploaded on github, so I made it available via google drive: https://drive.google.com/open?id=1aGDPRUH368N-R_Jd3t2ziDrbCjf5X5WK
3. Install pytorch using:
- pip install torch===1.3.1 torchvision===0.4.2 -f https://download.pytorch.org/whl/torch_stable.html
4. Install requirements: pip install -r requirements.txt
5. Go to project terminal and enter the following two arguments:

- set FLASK_APP=grimm_writer.py
- flask run --host=127.0.0.1 --port=5000

Then you should be able to visit the webapp at http://127.0.0.1:5000/static/generate-story.html
