// Валидация ввода на русском языке
function validateRussianInput(text) {
    return /^[А-ЯЁа-яё\s]+$/.test(text);
}

// Уведомления для пользователя
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Добавляем стили для уведомлений в CSS
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-size: 1rem;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.5s ease-in-out;
    }

    .notification.info {
        background: #2196f3;
    }

    .notification.error {
        background: #ff5252;
    }

    .notification.success {
        background: #4caf50;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Загрузка файла
document.getElementById("fileInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById("textArea").value = e.target.result;
            showNotification("File succesfully loaded!", "success");
        };
        reader.onerror = () => {
            showNotification("Error while loading!", "error");
        };
        reader.readAsText(file);
    }
});

// Сохранение файла
document.getElementById("saveFileBtn").addEventListener("click", async () => {
    const text = document.getElementById("textArea").value;
    try {
        await window.api.saveFile(text);
        showNotification("File saved succesfully!", "success");
    } catch (error) {
        showNotification("Error while saving!", "error");
    }
});

// Улучшенный столбцовый шифр
document.getElementById("encrypt-columnar").addEventListener("click", () => {
    const text = document.getElementById("textArea").value.replace(/[^А-ЯЁа-яё]/g, '');
    const key = document.getElementById("keyInput").value.replace(/[^А-ЯЁа-яё]/g, '');
    if (!validateRussianInput(text) || !validateRussianInput(key)) {
        showNotification("Text and key can only contain russian symbols", "error");
        return;
    }
    document.getElementById("textArea").value = improvedColumnarEncrypt(text, key);
    showNotification("Text succesfully encoded(Columnar)", "success");
});

document.getElementById("decrypt-columnar").addEventListener("click", () => {
    const text = document.getElementById("textArea").value.replace(/[^А-ЯЁа-яё]/g, '');
    const key = document.getElementById("keyInput").value.replace(/[^А-ЯЁа-яё]/g, '');
    if (!validateRussianInput(text) || !validateRussianInput(key)) {
        showNotification("Text and key can only contain russian symbols", "error");
        return;
    }
    document.getElementById("textArea").value = improvedColumnarDecrypt(text, key);
    showNotification("Text succesfully decoded(Columnar)", "success");
});

// Шифр Виженера для русского алфавита
document.getElementById("encryptVigenere").addEventListener("click", () => {
    const text = document.getElementById("textArea").value.replace(/[^А-ЯЁа-яё]/g, '');
    const key = document.getElementById("keyInput").value.replace(/[^А-ЯЁа-яё]/g, '');
    if (!validateRussianInput(text) || !validateRussianInput(key)) {
        showNotification("Text and key can only contain russian symbols", "error");
        return;
    }
    document.getElementById("textArea").value = encryptVigenere(text, key);
    showNotification("Text succesfully decoded(Vigenere)!", "success");
});

document.getElementById("decryptVigenere").addEventListener("click", () => {
    const text = document.getElementById("textArea").value.replace(/[^А-ЯЁа-яё]/g, '');
    const key = document.getElementById("keyInput").value.replace(/[^А-ЯЁа-яё]/g, '');
    if (!validateRussianInput(text) || !validateRussianInput(key)) {
        showNotification("Text and key can only contain russian symbols", "error");
        return;
    }
    document.getElementById("textArea").value = decryptVigenere(text, key);
    showNotification("Text succesfully decoded(Vigenere)", "success");
});

function getColumnOrder(key) {
    return key.split('')
        .map((char, index) => ({ char, index }))
        .sort((a, b) => a.char.localeCompare(b.char)) // Сортируем по алфавиту
        .map((item, sortedIndex) => ({ ...item, sortedIndex })) // Присваиваем новый индекс
        .sort((a, b) => a.index - b.index) // Возвращаем в исходный порядок
        .map(item => item.sortedIndex);
}

function improvedColumnarEncrypt(plainText, key) {
    const columnOrder = getColumnOrder(key);
    const numCols = key.length;
    let table = [];
    let index = 0;

    // Формируем строки переменной длины
    for (let row = 0; row < numCols && index < plainText.length; row++) {
        let rowLength = key.length; // Длина строки = номер столбца + 1
        table.push(plainText.slice(index, index + rowLength).split(''));
        index += rowLength;
    }

    // Читаем символы в порядке столбцов
    let cipherText = '';
    for (let sortedCol = 0; sortedCol < numCols; sortedCol++) {
        let col = columnOrder.indexOf(sortedCol);
        for (let row = 0; row < table.length; row++) {
            if (col < table[row].length) {
                cipherText += table[row][col];
            }
        }
    }

    return cipherText;
}

function improvedColumnarDecrypt(cipherText, key) {
    const columnOrder = getColumnOrder(key);
    const numCols = key.length;
    let rowLengths = new Array(numCols).fill(0);
    
    // Определяем длины строк в правильном порядке
    let totalLength = cipherText.length;
    let remaining = totalLength;
    
    for (let i = 0; i < numCols; i++) {
        let colSize = Math.min(remaining, key.length);
        rowLengths[i] = colSize;
        remaining -= colSize;
    }
    
    // Создаём пустую таблицу, но теперь заполняем её ПО СТОЛБЦАМ
    let table = new Array(rowLengths.length).fill(null).map((_, row) => new Array(rowLengths[row]).fill(''));
    
    let cipherIndex = 0;
    
    // Заполняем таблицу в порядке сортировки столбцов
    for (let sortedCol = 0; sortedCol < numCols; sortedCol++) {
        let col = columnOrder.indexOf(sortedCol);
        for (let row = 0; row < rowLengths.length; row++) {
            if (col < table[row].length && cipherIndex < cipherText.length) {
                table[row][col] = cipherText[cipherIndex++];
            }
        }
    }
    
    // Читаем текст по строкам
    return table.map(row => row.join('')).join('');
}

const RUSSIAN_ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

function generateAutoKey(text, key) {
    key = key.toUpperCase();
    let autoKey = key + text.slice(0, text.length - key.length); // Дополняем ключ символами исходного текста
    return autoKey.toUpperCase();
}

function encryptVigenere(text, key) {
    key = generateAutoKey(text, key); // Генерируем самогенерирующийся ключ
    return text.replace(/[А-ЯЁа-яё]/g, (char, index) => {
        const isLower = char === char.toLowerCase();
        const baseChar = char.toUpperCase();
        const shift = RUSSIAN_ALPHABET.indexOf(key[index]); // Берем букву ключа
        const newIndex = (RUSSIAN_ALPHABET.indexOf(baseChar) + shift) % RUSSIAN_ALPHABET.length;
        const encryptedChar = RUSSIAN_ALPHABET[newIndex];
        return isLower ? encryptedChar.toLowerCase() : encryptedChar;
    });
}

function decryptVigenere(text, key) {
    key = key.toUpperCase();
    let decryptedText = "";
    let autoKey = key;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char.match(/[А-ЯЁа-яё]/)) {
            const isLower = char === char.toLowerCase();
            const baseChar = char.toUpperCase();
            const shift = RUSSIAN_ALPHABET.indexOf(autoKey[i]); // Берем букву ключа
            const newIndex = (RUSSIAN_ALPHABET.indexOf(baseChar) - shift + RUSSIAN_ALPHABET.length) % RUSSIAN_ALPHABET.length;
            const decryptedChar = RUSSIAN_ALPHABET[newIndex];
            decryptedText += isLower ? decryptedChar.toLowerCase() : decryptedChar;
            autoKey += decryptedChar; // Добавляем расшифрованный символ в ключ
        } else {
            decryptedText += char;
        }
    }

    return decryptedText;
}