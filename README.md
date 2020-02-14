# final-grimm-prototype

How to use this project:

1. Download the zip
2. Download these additional files 
    - download 'model-2160.data-00000-of-00001' located [here](https://drive.google.com/open?id=1aGDPRUH368N-R_Jd3t2ziDrbCjf5X5WK) and add it to the ./models/Grimm folder.
    - download 'latest_net_G.pth' file located [here](https://drive.google.com/file/d/13VaFc6bBIjVy-JNbcCtuVTt37p-n2VLb/view?usp=sharing)  and add it to the ./checkpoints/pretrained folder.
3. Install pytorch using:
- pip install torch===1.3.1 torchvision===0.4.2 -f https://download.pytorch.org/whl/torch_stable.html
4. Install requirements: pip install -r requirements.txt
5. Go to python console, import nltk and do nltk.download('wordnet')
6. Go to project terminal and enter the following two arguments:

- set FLASK_APP=grimm_writer.py
- flask run --host=127.0.0.1 --port=5000

Then you should be able to visit the webapp at [http://127.0.0.1:5000/static/generate-story.html](http://127.0.0.1:5000/static/generate-story.html)

If not, close the connection and repeat steps 5 and 6.



To visualize what is happening inside the model you can open the visualization notebook and run it.
