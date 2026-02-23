const dropArea = document.getElementById("dropArea");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const form = document.getElementById("uploadForm");
const result = document.getElementById("result");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");

// Клік — відкриття вибору файлу
dropArea.addEventListener("click", () => imageInput.click());

// Вибір через input
imageInput.addEventListener("change", () => {
    if (imageInput.files.length > 0) {
        showPreview(imageInput.files[0]);
    }
});

// Drag & drop
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");

    if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];

        const dt = new DataTransfer();
        dt.items.add(file);
        imageInput.files = dt.files;

        showPreview(file);
    }
});

// Показати превʼю
function showPreview(file) {
    const reader = new FileReader();
    reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = "block";
        clearBtn.style.display = "inline-block";
    };
    reader.readAsDataURL(file);
}

// Видалити зображення
clearBtn.addEventListener("click", () => {
    preview.src = "";
    preview.style.display = "none";

    // Очищаємо input
    imageInput.value = "";

    // Очищаємо повідомлення
    result.textContent = "";
    // ховаємо кнопку копіювання
    copyBtn.style.display = "none";

    // Ховаємо кнопку
    clearBtn.style.display = "none";
});

// Обробка сабміту
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (imageInput.files.length === 0) {
        result.style.color = "red";
        result.textContent = "Будь ласка, виберіть файл!";
        return;
    }

    result.style.color = "black";
    result.textContent = "Сканування...";
    // поки чекаємо на результат, ховаємо кнопку копіювання
    copyBtn.style.display = "none";

    let formData = new FormData();
    formData.append("image", imageInput.files[0]);

    let response = await fetch("/upload", {
        method: "POST",
        body: formData
    });

    let data = await response.json();
    result.textContent = data.text || "Помилка!";
    // показуємо кнопку копіювання якщо є текст
    if (data.text) {
        showCopyButton();
    } else {
        copyBtn.style.display = "none";
    }
});

function showCopyButton() {
    copyBtn.style.display = "inline-block";
}

// Логіка копіювання
copyBtn.addEventListener("click", () => {
    const text = result.textContent;
    navigator.clipboard.writeText(text)
        .then(() => {
            copyBtn.textContent = "Скопійовано!";
            setTimeout(() => copyBtn.textContent = "Скопіювати", 1500);
        });
});