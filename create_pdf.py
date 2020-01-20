from io import BytesIO
import re
import reportlab.rl_config
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.platypus.flowables import DocAssign, PageBreak
from reportlab.platypus.flowables import Image as reportlab_image

def get_img_indices(content):
    start_img = [m.start() for m in re.finditer('<', content)]
    end_img = [m.end() for m in re.finditer('>', content)]
    print("start_img: ", start_img)
    print("end_img: ", end_img)

    return start_img, end_img

def get_txt_indices(start_img, end_img, content):
    num_images = len(start_img)

    txt_indices = []
    if len(start_img) > 0:
        imgfirst = start_img[0] == 0
    else:
        imgfirst = False
    imglast = content[-3:] == '=/>'

    print("imglast: ", imglast)

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


def generate_pdf_from_list(txt_indices, start_img, txts, imgs, story_title):
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
    paragraph = Paragraph(15 * '<br/>' + "<b>Generated Stories</b>" + 15 * '<br/>', title)
    story.append(paragraph)


    story.append(PageBreak())
    print("story_title: ", story_title)
    story.append(Paragraph("<b>"+story_title+"</b>" + 5*"<br/>", header))


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
            image_url_idx = [m.start() for m in re.finditer('"', img)]
            url = img[image_url_idx[0] + 1: image_url_idx[1]]
            img = reportlab_image(url, width=3 * inch, height=3 * inch)
            lastimg = False
        else:
            lastimg = True

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

            if idx_text == idx_img:
                story.append(img)
                story.append(Spacer(1, 0.25 * inch))

        # in case last image (has already been added)
        if lastimg and not lasttext:
            print("text: ", text)
            story.append(Paragraph(text, normal))
            story.append(Spacer(1, 0.25 * inch))

        if lasttext and not lastimg:
            print("lasttext and not lastimg")
            story.append(img)
            story.append(Spacer(1, 0.25 * inch))

    buff = BytesIO()

    doc = SimpleDocTemplate(buff)
    doc.build(story)

    return buff.getvalue()