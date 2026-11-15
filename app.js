
const situationsContainer = document.getElementById("situations");
const searchInput = document.getElementById("search");
const resultCount = document.getElementById("resultCount");

const categoryCards = document.querySelectorAll(".category-card");
const typeButtons = document.querySelectorAll(".type-button");
const resetFilters = document.getElementById("resetFilters");

let selectedCategory = null;
let selectedType = "all";


// Названия типов
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


// Названия статусов
function getStatusName(status) {
    const statuses = {
        draft: "Черновик",
        review: "Требует проверки",
        verified: "Проверено"
    };

    return statuses[status] || "Статус не указан";
}


// Форматирование даты без смещения часового пояса
function formatDate(dateValue) {
    if (!dateValue) return "Не указана";

    const parts = dateValue.split("-");

    if (parts.length !== 3) return "Не указана";

    return `${parts[2]}.${parts[1]}.${parts[0]}`;
}


// Создание текстового элемента
function createTextElement(tag, text, className = "") {
    const element = document.createElement(tag);
    element.textContent = text || "";

    if (className) {
        element.className = className;
    }

    return element;
}


// Создание заголовка раздела
function addSectionTitle(container, title) {
    container.appendChild(
        createTextElement("h3", title)
    );
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
            item.restrictions,
            item.source?.document,
            item.source?.section,
            item.source?.paragraph,
            ...(item.signs || []),
            ...(item.actions || []),
            ...(item.rollingStock || [])
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
        situationsContainer.appendChild(
            createTextElement("p", "Материалов не найдено.")
        );
        return;
    }

    list.forEach(situation => {
        const card = document.createElement("div");
        card.className = "situation-card";

        card.appendChild(
            createTextElement("h3", situation.title)
        );

        card.appendChild(
            createTextElement("p", situation.description)
        );

        const tags = document.createElement("div");
        tags.className = "tags";

        const categoryTag = createTextElement(
            "span",
            situation.category,
            "tag"
        );

        const typeTag = createTextElement(
            "span",
            getTypeName(situation.type),
            "tag"
        );

        const statusTag = createTextElement(
            "span",
            getStatusName(situation.status),
            "tag"
        );

        tags.append(categoryTag, typeTag, statusTag);
        card.appendChild(tags);

        card.addEventListener("click", () => {
            openSituation(situation.id);
        });

        situationsContainer.appendChild(card);
    });
}


// Подробная информация о материале
function openSituation(id) {
    const situation = situations.find(item => item.id === id);

    if (!situation) return;

    situationsContainer.innerHTML = "";

    const backButton = document.createElement("button");
    backButton.className = "back-button";
    backButton.textContent = "← Назад к материалам";

    backButton.addEventListener("click", () => {
        renderSituations(getFilteredSituations());
    });

    situationsContainer.appendChild(backButton);

    const details = document.createElement("div");
    details.className = "situation-card details-card";

    details.appendChild(
        createTextElement("h2", situation.title)
    );

    // Метки материала
    const tags = document.createElement("div");
    tags.className = "tags";

    tags.append(
        createTextElement("span", situation.category, "tag"),
        createTextElement("span", getTypeName(situation.type), "tag"),
        createTextElement("span", getStatusName(situation.status), "tag")
    );

    details.appendChild(tags);

    // Предупреждение о статусе
    if (situation.status !== "verified") {
        const warning = createTextElement(
            "div",
            "ВНИМАНИЕ: этот материал не имеет статуса «Проверено». Не используй его как подтверждённую инструкцию.",
            "admin-note"
        );

        warning.style.marginTop = "18px";
        warning.style.padding = "14px";
        warning.style.border = "1px solid #9b7134";
        warning.style.borderRadius = "8px";

        details.appendChild(warning);

    } else if (!situation.lastVerified) {
        const warning = createTextElement(
            "div",
            "ВНИМАНИЕ: дата проверки не указана. Актуальность материала необходимо уточнить.",
            "admin-note"
        );

        warning.style.marginTop = "18px";
        details.appendChild(warning);
    }

    // Описание
    addSectionTitle(details, "Описание");

    details.appendChild(
        createTextElement("p", situation.description)
    );

    // Подвижной состав
    if (situation.rollingStock?.length) {
        addSectionTitle(details, "Подвижной состав");

        const stockList = document.createElement("ul");

        situation.rollingStock.forEach(item => {
            stockList.appendChild(
                createTextElement("li", item)
            );
        });

        details.appendChild(stockList);
    }

    // Признаки
    if (situation.signs?.length) {
        addSectionTitle(details, "Признаки");

        const signsList = document.createElement("ul");

        situation.signs.forEach(sign => {
            signsList.appendChild(
                createTextElement("li", sign)
            );
        });

        details.appendChild(signsList);
    }

    // Порядок действий
    if (situation.actions?.length) {
        addSectionTitle(details, "Порядок действий");

        const actionsList = document.createElement("ol");

        situation.actions.forEach(action => {
            actionsList.appendChild(
                createTextElement("li", action)
            );
        });

        details.appendChild(actionsList);
    }

    // Ограничения
    if (situation.restrictions) {
        addSectionTitle(details, "Запреты и ограничения");

        details.appendChild(
            createTextElement("p", situation.restrictions)
        );
    }

    // Нормативное основание
    addSectionTitle(details, "Нормативное основание");

    const source = situation.source || {};

    details.appendChild(
        createTextElement(
            "p",
            `Документ: ${source.document || "Не указан"}`
        )
    );

    details.appendChild(
        createTextElement(
            "p",
            `Раздел: ${source.section || "Не указан"}`
        )
    );

    details.appendChild(
        createTextElement(
            "p",
            `Пункт: ${source.paragraph || "Не указан"}`
        )
    );

    // Дата проверки
    addSectionTitle(details, "Контроль актуальности");

    details.appendChild(
        createTextElement(
            "p",
            `Последняя проверка: ${formatDate(situation.lastVerified)}`
        )
    );

    details.appendChild(
        createTextElement(
            "p",
            `Статус материала: ${getStatusName(situation.status)}`
        )
    );

    situationsContainer.appendChild(details);
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
