import paralleldots
import fire
import json
import os
import numpy as np
import tensorflow as tf
import model, sample, encoder
from flask import Flask, request, jsonify
import requests

# USAGE via CLI:
# set FLASK_APP=modelvgg16_grimm.py
# flask run --host=127.0.0.1 --port=5000
# visit http://127.0.0.1:5000/static/predict.html

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

app =Flask(__name__)
@app.route("/predict", methods=["post", "get"])

# TODO CHANGE NAME OF METHOD
# also, probably don't need this, but anyway it took a while to learn how to send data from js to python
# so I'd like to keep it in for now. Sorry for the mess xxx
def predict():
    conditional = request.get_json()
    print("content of conditional: ", conditional)
    print("another thing xoxo")

    return " "

@app.route("/write_cond", methods=["post"])
def write_cond():
    return ""

@app.route("/sample_model", methods=["post"])
def sample_model(
    model_name='Grimm',
    seed=None,
    nsamples=1,
    batch_size=1,
    length=200,
    temperature=1,
    top_k=0,
    top_p=0.0
):
    """
    Run the sample_model
    :model_name=117M : String, which model to use
    :seed=None : Integer seed for random number generators, fix seed to
     reproduce results
    :nsamples=0 : Number of samples to return, if 0, continues to
     generate samples indefinately.
    :batch_size=1 : Number of batches (only affects speed/memory).
    :length=None : Number of tokens in generated text, if None (default), is
     determined by model hyperparameters
    :temperature=1 : Float value controlling randomness in boltzmann
     distribution. Lower temperature results in less random completions. As the
     temperature approaches zero, the model will become deterministic and
     repetitive. Higher temperature results in more random completions.
    :top_k=0 : Integer value controlling diversity. 1 means only 1 word is
     considered for each step (token), resulting in deterministic completions,
     while 40 means 40 words are considered at each step. 0 (default) is a
     special setting meaning no restrictions. 40 generally is a good value.
    :top_p=0.0 : Float value controlling diversity. Implements nucleus sampling,
     overriding top_k if set to a value > 0. A good setting is 0.9.
    """
    enc = encoder.get_encoder(model_name)
    hparams = model.default_hparams()
    with open(os.path.join('models', model_name, 'hparams.json')) as f:
        hparams.override_from_dict(json.load(f))

    if length is None:
        length = hparams.n_ctx
    elif length > hparams.n_ctx:
        raise ValueError("Can't get samples longer than window size: %s" % hparams.n_ctx)

    with tf.Session(graph=tf.Graph()) as sess:
        np.random.seed(seed)
        tf.set_random_seed(seed)

        output = sample.sample_sequence(
            hparams=hparams, length=length,
            start_token=enc.encoder['<|endoftext|>'],
            batch_size=batch_size,
            temperature=temperature, top_k=top_k, top_p=top_p
        )[:, 1:]

        saver = tf.train.Saver()
        ckpt = tf.train.latest_checkpoint(os.path.join('models', model_name))
        saver.restore(sess, ckpt)

        generated = 0
        while nsamples == 0 or generated < nsamples:
            out = sess.run(output)
            for i in range(batch_size):
                generated += batch_size
                text = enc.decode(out[i])
                print("=" * 40 + " SAMPLE " + str(generated) + " " + "=" * 40)
                print("Generated text: ", text)


        # connect to paralleldots API for keyword extraction
        # paralleldots.set_api_key('22oBWnyRjZbEzU1H8tKpoLmIkSZXTnAuPV8EP8gwzaI')
        # keywords_dict = paralleldots.batch_keywords([text])
        # print("keywords: ", keywords_dict)
        # print("type of keywords: ", type(keywords_dict))
        #
        # keywords = []
        # for idx in range(len(keywords_dict['keywords'][0])):
        #     keywords.append(keywords_dict['keywords'][0][idx]['keyword'])

        # keywords_deepai = requests.post(
        #     "https://api.deepai.org/api/text-tagging",
        #     data={
        #         'text': text,
        #     },
        #     headers={'api-key': '9ceb784c-0739-41d9-93a2-f3a9d19af543'}
        # )
        # print("keywords_deepai.json() : ", keywords_deepai.json())
        # keywords_deepai = keywords_deepai.json()
        # keywords_deepai = keywords_deepai['output'].split('\n')

        response = {
            'text': text,
            'keywords1': ['empty'],#keywords,
            'keywords2' : ['empty'] #keywords_deepai,
        }

        return jsonify(response)

@app.route("/get_prompt", methods=["get", "post"])
def get_prompt():
    raw_text = request.get_json()
    return " "


@app.route("/interact_model", methods=["post"])
def interact_model(
    model_name='Grimm',
    seed=None,
    nsamples=1,
    batch_size=1,
    length=200,
    temperature=1,
    top_k=0,
    top_p=0.0,
):
    """
    Interactively run the model
    :model_name=117M : String, which model to use
    :seed=None : Integer seed for random number generators, fix seed to reproduce
     results
    :nsamples=1 : Number of samples to return total
    :batch_size=1 : Number of batches (only affects speed/memory).  Must divide nsamples.
    :length=None : Number of tokens in generated text, if None (default), is
     determined by model hyperparameters
    :temperature=1 : Float value controlling randomness in boltzmann
     distribution. Lower temperature results in less random completions. As the
     temperature approaches zero, the model will become deterministic and
     repetitive. Higher temperature results in more random completions.
    :top_k=0 : Integer value controlling diversity. 1 means only 1 word is
     considered for each step (token), resulting in deterministic completions,
     while 40 means 40 words are considered at each step. 0 (default) is a
     special setting meaning no restrictions. 40 generally is a good value.
    :top_p=0.0 : Float value controlling diversity. Implements nucleus sampling,
     overriding top_k if set to a value > 0. A good setting is 0.9.
    """
    raw_text = request.get_json()

    print("raw text: ", raw_text)
    if batch_size is None:
        batch_size = 1
    assert nsamples % batch_size == 0

    enc = encoder.get_encoder(model_name)
    hparams = model.default_hparams()
    with open(os.path.join('models', model_name, 'hparams.json')) as f:
        hparams.override_from_dict(json.load(f))

    if length is None:
        length = hparams.n_ctx // 2
    elif length > hparams.n_ctx:
        raise ValueError("Can't get samples longer than window size: %s" % hparams.n_ctx)

    with tf.Session(graph=tf.Graph()) as sess:
        context = tf.placeholder(tf.int32, [batch_size, None])
        np.random.seed(seed)
        tf.set_random_seed(seed)
        output = sample.sample_sequence(
            hparams=hparams, length=length,
            context=context,
            batch_size=batch_size,
            temperature=temperature, top_k=top_k, top_p=top_p
        )

        saver = tf.train.Saver()
        ckpt = tf.train.latest_checkpoint(os.path.join('models', model_name))
        saver.restore(sess, ckpt)

        while True:
            # GET RAW TEXT FROM JS!!!!!!!!!!
            print("raw_text: ", raw_text)

            # while not raw_text:
            #     print('Prompt should not be empty!')
            #     raw_text = input("Model prompt >>> ")
            context_tokens = enc.encode(raw_text['unconditional'])
            generated = 0
            for _ in range(nsamples // batch_size):
                out = sess.run(output, feed_dict={
                    context: [context_tokens for _ in range(batch_size)]
                })[:, len(context_tokens):]
                for i in range(batch_size):
                    generated += 1
                    text = enc.decode(out[i])
                    print("=" * 40 + " SAMPLE " + str(generated) + " " + "=" * 40)
                    print(text)

                    # connect to paralleldots API for keyword extraction
                    paralleldots.set_api_key('22oBWnyRjZbEzU1H8tKpoLmIkSZXTnAuPV8EP8gwzaI')
                    keywords_dict = paralleldots.batch_keywords([text])
                    print("keywords: ", keywords_dict)
                    print("type of keywords: ", type(keywords_dict))

                    keywords = []
                    for idx in range(len(keywords_dict['keywords'][0])):
                        keywords.append(keywords_dict['keywords'][0][idx]['keyword'])

                    # deepai request
                    keywords_deepai = requests.post(
                        "https://api.deepai.org/api/text-tagging",
                        data={
                            'text': text,
                        },
                        headers={'api-key': '9ceb784c-0739-41d9-93a2-f3a9d19af543'}
                    )
                    print("keywords_deepai.json() : ", keywords_deepai.json())
                    keywords_deepai = keywords_deepai.json()
                    keywords_deepai = keywords_deepai['output'].split('\n')

                    response = {
                        'text': text,
                        'keywords1': keywords,
                        'keywords2': keywords_deepai,
                    }

                    return response