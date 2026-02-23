from flask import Flask, request, jsonify, send_from_directory  # type: ignore
import pytesseract  # type: ignore
from PIL import Image, ImageFilter  # type: ignore
import imghdr
import io

app = Flask(__name__)

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Головна сторінка
@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/script.js")
def js():
    return send_from_directory(".", "script.js")

@app.route("/style.css")
def css():
    return send_from_directory(".", "style.css")

@app.route("/upload", methods=["POST"])
def upload():

    # Перевірка наявності файлу
    if "image" not in request.files:
        return jsonify({"text": "Файл не отримано"})

    file = request.files["image"]

    # Перевірка розширення
    if not allowed_file(file.filename):
        return jsonify({"text": "Невідповідний тип файлу!"})

    # Перевірка реального формату через imghdr
    file_bytes = file.read()
    file.seek(0)

    real_type = imghdr.what(None, h=file_bytes)
    if real_type not in ALLOWED_EXTENSIONS:
        return jsonify({"text": "Невідповідний тип файлу!"})

    # Спроба відкрити як зображення
    try:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except Exception:
        return jsonify({"text": "Невідповідний тип файлу!"})

    img = img.convert("L")
    img = img.filter(ImageFilter.SHARPEN)
    w, h = img.size
    img = img.resize((w * 2, h * 2))

    # OCR з кращими параметрами
    config = "--oem 3 --psm 6"
    text = pytesseract.image_to_string(img, lang="ukr", config=config)

    return jsonify({"text": text})


if __name__ == "__main__":
    app.run(debug=True)