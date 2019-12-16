from io import BytesIO
import paralleldots
import fire
import json
import os
import numpy as np
import tensorflow as tf
import model, sample, encoder
from flask import Flask, request, jsonify, make_response
import requests

# USAGE via CLI:
# set FLASK_APP=modelvgg16_grimm.py
# flask run --host=127.0.0.1 --port=5000
# visit http://127.0.0.1:5000/static/conditional.html

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
        #
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
            'keywords1': 'hi',
            'keywords2' : 'hi',
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

########################################################################################################################
########################################################################################################################
##################################### EVERYTHING FOR REPORTLAB IS UNDER THIS LINE ######################################
########################################################################################################################
########################################################################################################################

import re
import reportlab.rl_config
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.platypus.flowables import DocAssign, Image, PageBreak


def get_img_indices(content):
    start_img = [m.start() for m in re.finditer('<', content)]
    end_img = [m.end() for m in re.finditer('>', content)]

    return start_img, end_img

def get_txt_indices(start_img, end_img, content):
    # ALLOW TO START WITH EITHER IMAGE OR TEXT
    # FOR EVERY IMAGE THAT IS MORE THAN THE NUMBER OF PARAGRAPHS OF TEXT PRESENT, THIS APPENDS THE EMPTY STRING
    # TO THE FINAL TXT INDICES AT THE END OF THE SCRIPT

    # NOW FIGURE OUT HOW TO ALLOW BOTH TEXT AND IMAGE TO APPEAR AT THE END OF THE PDF
    # NEEDED: CHECK IF THERE IS A CHARACTER AFTER LAST END_IMG, AND IF SO, IT WILL BE TEXT.

    num_images = len(start_img)

    txt_indices = []
    if len(start_img) > 0:
        imgfirst = start_img[0] == 0
    else:
        imgfirst = False
    imglast = content[-3:] == '"/>'

    if imgfirst:
        for i in range(1, num_images):
            if (start_img[i] == 0):
                start_txt = end_img[0]
                end_txt = start_img[1]
            else:
                start_txt = end_img[i - 1]
                end_txt = start_img[i]
            txt_indices.append([start_txt, end_txt])
    else:
        for i in range(num_images):
            if (i == 0):
                start_txt = 0
            else:
                start_txt = end_img[i - 1]
            end_txt = start_img[i]
            txt_indices.append([start_txt, end_txt])

    if not imglast:
        if num_images > 0:
            start_txt = end_img[num_images - 1]
        else:
            start_txt = 0
        txt_indices.append([start_txt, None])

    return txt_indices

@app.route("/pdf", methods=["post"])
def main():
    content = request.get_json()

    start_img, end_img = get_img_indices(content)
    txt_indices = get_txt_indices(start_img, end_img, content)

    content = re.sub('<br>', '', content)

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

    coverimg = '<img src="https://api.deepai.org/job-view-file/f11fafd9-011a-4b38-95d2-24e78c8ac89c/outputs/output.jpg">'
    #response = generate_pdf_from_list(txt_indices, start_img, txts, imgs, coverimg)
    response = make_response(generate_pdf_from_list(txt_indices, start_img, txts, imgs, coverimg))
    response.headers['Content-Disposition'] = "attachment; filename='test2.pdf"
    response.mimetype = 'application/pdf'
    return response


def generate_pdf_from_list(txt_indices, start_img, txts, imgs, coverimg):
    reportlab.rl_config.warnOnMissingFontGlyphs = 0

    pdfmetrics.registerFont(TTFont('Vera', 'Vera.ttf'))
    pdfmetrics.registerFont(TTFont('VeraBd', 'VeraBd.ttf'))
    pdfmetrics.registerFont(TTFont('VeraIt', 'VeraIt.ttf'))
    pdfmetrics.registerFont(TTFont('VeraBI', 'VeraBI.ttf'))

    registerFontFamily('Vera', normal='Vera', bold='VeraBd', italic='VeraIt', boldItalic='VeraBI')

    normal = ParagraphStyle(name="Normal", fontName="Helvetica", fontSize=12, leading=11)
    title = ParagraphStyle(name="Title", fontName="Helvetica", fontSize=42, leftIndent=50)
    header = ParagraphStyle(name='Header', fontName="Helvetica", fontSize=18, leading=11)

    # def generate_pdf_from_list(list):
    story = [
        DocAssign("currentFrame", "doc.frame.id"),
        DocAssign("currentPageTemplate", "doc.pageTemplate.id"),
        DocAssign("aW", "availableWidth"),
        DocAssign("aH", "availableHeight"),
        DocAssign("aWH", "availableWidth,availableHeight")
    ]

    # story frontpage
    paragraph = Paragraph("<b>Generated Stories</b>" + 15 * '<br/>', title)
    story.append(paragraph)

    img = coverimg

    image_url_idx = [m.start() for m in re.finditer('"', img)]
    url_mainpage = img[image_url_idx[0] + 1: image_url_idx[1]]
    img = Image(url_mainpage, width=3 * inch, height=3 * inch)

    story.append(img)
    story.append(PageBreak())

    # get list with pos of imgs, pos of txts
    # it will indicate the order, the file does not necessarily contain an img or a txt
    # so only create object and append to story if it actually exists
    for i in range(max(len(txt_indices), len(imgs))):
        if i < len(txt_indices):
            idx_text = txt_indices[i][0]
            text = txts[i]
            lasttext = False
        else:
            lasttext = True
        if i < len(imgs):
            idx_img = start_img[i]
            img = imgs[i]
            print("img: ", img)
            image_url_idx = [m.start() for m in re.finditer('"', img)]
            url = img[image_url_idx[0] + 1: image_url_idx[1]]
            img = Image(url, width=3 * inch, height=3 * inch)
            lastimg = False
        else:
            lastimg = True

        # in case both are not empty:
        if not lastimg and not lasttext:
            if idx_text < idx_img:
                # begin story
                story.append(Paragraph(text, normal))
                story.append(Spacer(1, 0.25 * inch))
                story.append(img)
                story.append(Spacer(1, 0.25 * inch))

            # in case img before text:
            if idx_text > idx_img:
                # begin story
                story.append(img)
                story.append(Spacer(1, 0.25 * inch))
                story.append(Paragraph(text, normal))
                story.append(Spacer(1, 0.25 * inch))
        # in case last image (has already been added)
        if lastimg and not lasttext:
            print("text: ", text)
            story.append(Paragraph(text, normal))
            story.append(Spacer(1, 0.25 * inch))
        if lasttext and not lastimg:
            story.append(img)
            story.append(Spacer(1, 0.25 * inch))

    print("hey")
    buff = BytesIO()

    doc = SimpleDocTemplate(buff)
    doc.build(story)

    return buff.getvalue()

# print("hey")
#     doctitle = "heyyy.pdf"
#     doc = SimpleDocTemplate(doctitle)
#     doc.build(story)
#     shutil.copy(doctitle, 'static/'+doctitle)
#
#     return doctitle

import shutil