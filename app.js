
const situationsContainer = document.getElementById("situations");
const searchInput = document.getElementById("search");
const resultCount = document.getElementById("resultCount");
const categoryCards = document.querySelectorAll(".category-card");

let selectedCategory = null;

// Названия типов материалов
function getTypeName(type) {
    const types = {
        malfunction: "Неисправность",
        emergency: "Аварийная ситуация",
        procedure: "Порядок действий",
        signal: "Сигнализация",
        rule: "Нормативное требование"
    };

    return types[type] || "Другое";
}

// Получение отфильтрованных ситуаций
function getFilteredSituations() {
    const query = searchInput.value.toLowerCase().trim();

    return situations.filter(item => {
        const matchesCategory =
            !selectedCategory || item.category === selectedCategory;

        const searchableText = [
            item.title,
            item.category,
            item.description,
            ...item.signs
        ].join(" ").toLowerCase();

        return matchesCategory && searchableText.includes(query);
    });
}

// Отображение карточек
function renderSituations(list) {
    situationsContainer.innerHTML = "";

    resultCount.textContent = `${list.length} найдено`;

    if (list.length === 0) {
        situationsContainer.innerHTML =
            "<p>Ситуаций не найдено.</p>";
        return;
    }

    list.forEach(situation => {
        const card = document.createElement("div");
        card.className = "situation-card";

        card.innerHTML = `
            <h3>${situation.title}</h3>

            <p>${situation.description}</p>

            <span class="tag">${situation.category}</span>

            <span class="tag">
                ${getTypeName(situation.type)}
            </span>

            <span class="tag">${situation.status}</span>
        `;

        card.addEventListener("click", () => {
            openSituation(situation.id);
        });

        situationsContainer.appendChild(card);
    });
}

// Открытие подробной информации
function openSituation(id) {
    const situation = situations.find(item => item.id === id);

    if (!situation) return;

    situationsContainer.innerHTML = `
        <button class="back-button" id="backButton">
            ← Назад к ситуациям
        </button>

        <div class="situation-card details-card">

            <h2>${situation.title}</h2>

            <span class="tag">${situation.category}</span>
            <span class="tag">${getTypeName(situation.type)}</span>
            <span class="tag">${situation.status}</span>

            <h3>Описание</h3>
            <p>${situation.description}</p>

            <h3>Признаки</h3>
            <ul>
                ${situation.signs.map(sign => `<li>${sign}</li>`).join("")}
            </ul>

            <h3>Порядок действий</h3>
            <ol>
                ${situation.actions.map(action => `<li>${action}</li>`).join("")}
            </ol>

            <h3>Запреты и ограничения</h3>
            <p>${situation.restrictions}</p>

            <h3>Нормативное основание</h3>
            <p>
                ${situation.source.document || "Не указано"}
                <br>
                Раздел: ${situation.source.section || "Не указан"}
                <br>
                Пункт: ${situation.source.paragraph || "Не указан"}
            </p>

        </div>
    `;

    document.getElementById("backButton").addEventListener("click", () => {
        renderSituations(getFilteredSituations());
    });
}

// Поиск
searchInput.addEventListener("input", () => {
    renderSituations(getFilteredSituations());
});

// Категории
categoryCards.forEach(card => {
    card.addEventListener("click", () => {
        const category = card.dataset.category;

        selectedCategory =
            selectedCategory === category ? null : category;

        categoryCards.forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.category === selectedCategory
            );
        });

        renderSituations(getFilteredSituations());

        document.querySelector(".situations-section")
            .scrollIntoView({ behavior: "smooth" });
    });
});

// Сброс фильтров
const resetFilters = document.getElementById("resetFilters");

if (resetFilters) {
    resetFilters.addEventListener("click", () => {
        selectedCategory = null;
        searchInput.value = "";

        categoryCards.forEach(card => {
            card.classList.remove("active");
        });

        renderSituations(situations);
    });
}

// Первый запуск
renderSituations(situations);
