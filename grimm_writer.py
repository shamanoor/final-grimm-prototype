from io import BytesIO
import json
import os
import numpy as np
import tensorflow as tf
import model, sample, encoder
from flask import Flask, request, make_response
import torch
from pytorch_pretrained_biggan import (BigGAN, one_hot_from_names, truncated_noise_sample)
import base64
import create_pdf


# USAGE via CLI:
# set FLASK_APP=grimm_writer.py
# flask run --host=127.0.0.1 --port=5000
# visit http://127.0.0.1:5000/static/generate-story.html

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
app =Flask(__name__)

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
            print("raw_text: ", raw_text)

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

                    response = {
                        'text': text,
                    }

                    return response


@app.route("/pdf", methods=["post"])
def main():
    response = request.get_json()

    content = response['prompt']
    story_title = response['title']

    if '<br>' in story_title:
        story_title = story_title.replace('<br>', '')

    start_img, end_img = create_pdf.get_img_indices(content)
    txt_indices = create_pdf.get_txt_indices(start_img, end_img, content)

    # temporary test of empty line at start of file
    content = content.strip()

    imgs = []
    txts = []
    for i in range(max(len(txt_indices), len(start_img))):
        if i < len(txt_indices) and i < len(start_img):
            idx_text = txt_indices[i][0]
            idx_img = start_img[i]
            if idx_text < idx_img:
                txts.append(content[txt_indices[i][0]:txt_indices[i][1]])
                imgs.append(content[start_img[i]: end_img[i]])
            else:
                imgs.append(content[start_img[i]: end_img[i]])
                txts.append(content[txt_indices[i][0]:txt_indices[i][1]])
        elif not i < len(txt_indices) and i < len(start_img):
            imgs.append(content[start_img[i]: end_img[i]])
        elif not i < len(start_img) and i < len(txt_indices):
            txts.append(content[txt_indices[i][0]:txt_indices[i][1]])

    response = make_response(create_pdf.generate_pdf_from_list(txt_indices, start_img, txts, imgs, story_title))
    response.headers['Content-Disposition'] = "attachment; filename='test2.pdf"
    response.mimetype = 'application/pdf'
    return response


@app.route("/generate_image", methods=["post"])
def generate_image():
    keyword = request.get_json()
    keyword = keyword['keyword']
    keyword = keyword.strip()
    # Load pre-trained model tokenizer (vocabulary)
    model = BigGAN.from_pretrained('biggan-deep-512')

    # Prepare a input
    truncation = 0.4
    class_vector = one_hot_from_names([keyword], batch_size=1)
    noise_vector = truncated_noise_sample(truncation=truncation, batch_size=1)

    # All in tensors
    noise_vector = torch.from_numpy(noise_vector)
    class_vector = torch.from_numpy(class_vector)

    # Generate an image
    with torch.no_grad():
        output = model(noise_vector, class_vector, truncation)

    output = output.numpy()
    output = np.reshape(output, (3, 512, 512))

    xmax, xmin = output.max(), output.min()
    normalized_output = (output - xmin) / (xmax - xmin)

    imgs = tf.keras.preprocessing.image.array_to_img(normalized_output, data_format="channels_first", scale=True)

    buffered = BytesIO()
    imgs.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue())

    return img_str