
const situationsContainer = document.getElementById("situations");
const searchInput = document.getElementById("search");
const resultCount = document.getElementById("resultCount");

const categoryCards = document.querySelectorAll(".category-card");
const typeButtons = document.querySelectorAll(".type-button");
const resetFilters = document.getElementById("resetFilters");

let selectedCategory = null;
let selectedType = "all";

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

// Фильтрация материалов
function getFilteredSituations() {
    const query = searchInput.value.toLowerCase().trim();

    return situations.filter(item => {
        const matchesCategory =
            !selectedCategory || item.category === selectedCategory;

        const matchesType =
            selectedType === "all" || item.type === selectedType;

        const searchableText = [
            item.title,
            item.category,
            item.description,
            ...item.signs,
            ...item.actions
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(query);

        return matchesCategory && matchesType && matchesSearch;
    });
}

// Отображение карточек
function renderSituations(list) {
    situationsContainer.innerHTML = "";

    resultCount.textContent = `${list.length} найдено`;

    if (list.length === 0) {
        situationsContainer.innerHTML =
            "<p>Материалов не найдено.</p>";
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

// Подробная информация
function openSituation(id) {
    const situation = situations.find(item => item.id === id);

    if (!situation) return;

    situationsContainer.innerHTML = `
        <button class="back-button" id="backButton">
            ← Назад к материалам
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

// Фильтр категорий
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

// Фильтр типов
typeButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedType = button.dataset.type;

        typeButtons.forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.type === selectedType
            );
        });

        renderSituations(getFilteredSituations());

        document.querySelector(".situations-section")
            .scrollIntoView({ behavior: "smooth" });
    });
});

// Сброс фильтров
if (resetFilters) {
    resetFilters.addEventListener("click", () => {
        selectedCategory = null;
        selectedType = "all";
        searchInput.value = "";

        categoryCards.forEach(card => {
            card.classList.remove("active");
        });

        typeButtons.forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.type === "all"
            );
        });

        renderSituations(situations);
    });
}

// Первый запуск
renderSituations(situations);
