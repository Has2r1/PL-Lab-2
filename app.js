const dbName = "passwordManager";
let db;

function initDB() {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        db.createObjectStore("passwords", { keyPath: "id", autoIncrement: true });
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadPasswords();
    };

    request.onerror = (event) => {
        console.error("Database error:", event.target.error);
    };
}

function addPassword(login, url, password) {
    const transaction = db.transaction("passwords", "readwrite");
    const store = transaction.objectStore("passwords");
    store.add({ login, url, password });

    transaction.oncomplete = loadPasswords;
}

function loadPasswords() {
    const transaction = db.transaction("passwords", "readonly");
    const store = transaction.objectStore("passwords");

    const tableBody = document.querySelector("#passwordTable tbody");
    tableBody.innerHTML = "";

    store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const { login, url, password } = cursor.value;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${login}</td>
                <td>${url}</td>
                <td>${password}</td>
            `;
            tableBody.appendChild(row);
            cursor.continue();
        }
    };
}

function generatePassword() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    document.querySelector("#password").value = password;
}

document.querySelector("#addPasswordForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const login = document.querySelector("#login").value;
    const url = document.querySelector("#url").value;
    const password = document.querySelector("#password").value;

    addPassword(login, url, password);

    document.querySelector("#addPasswordForm").reset();
});

document.querySelector("#generatePassword").addEventListener("click", generatePassword);

initDB();
