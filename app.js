
const situationsContainer = document.getElementById("situations");
const searchInput = document.getElementById("search");
const resultCount = document.getElementById("resultCount");

const menuToggle = document.getElementById("menuToggle");
const menuClose = document.getElementById("menuClose");
const menuOverlay = document.getElementById("menuOverlay");
const sideMenu = document.getElementById("sideMenu");

const searchClear = document.getElementById("searchClear");
const stockButtons = document.querySelectorAll(".stock-button");
const menuItems = document.querySelectorAll(".menu-item");

const resultsTitle = document.getElementById("resultsTitle");
const resultsSubtitle = document.getElementById("resultsSubtitle");

const infoPage = document.getElementById("infoPage");
const infoContent = document.getElementById("infoContent");
const infoBack = document.getElementById("infoBack");

let selectedCategory = null;
let selectedType = "all";
let selectedRollingStock = "all";
let currentView = "materials";

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

// Форматирование даты
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

// Управление боковым меню
function openMenu() {
    sideMenu.classList.add("active");
    menuOverlay.classList.add("active");
    document.body.classList.add("menu-open");

    menuToggle.setAttribute("aria-expanded", "true");
}

function closeMenu() {
    sideMenu.classList.remove("active");
    menuOverlay.classList.remove("active");
    document.body.classList.remove("menu-open");

    menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", openMenu);
menuClose.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeMenu();
    }
});

// Обновление активных пунктов меню
function updateMenuItems() {
    menuItems.forEach(item => {
        const category = item.dataset.category;
        const type = item.dataset.type;

        const isActive =
            (category && category === selectedCategory) ||
            (type && type === selectedType);

        item.classList.toggle("active", Boolean(isActive));
    });
}

// Обновление кнопок состава
function updateStockButtons() {
    stockButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.rollingStock === selectedRollingStock
        );
    });
}

// Фильтрация материалов
function getFilteredSituations() {
    const query = searchInput.value.toLowerCase().trim();

    return situations.filter(item => {

        const matchesCategory =
            !selectedCategory ||
            item.category === selectedCategory;

        const matchesType =
            selectedType === "all" ||
            item.type === selectedType;

        const stockList = item.rollingStock || [];

        const matchesRollingStock =
            selectedRollingStock === "all" ||
            stockList.includes("Все") ||
            stockList.includes(selectedRollingStock);

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

        const matchesSearch =
            searchableText.includes(query);

        return (
            matchesCategory &&
            matchesType &&
            matchesRollingStock &&
            matchesSearch
        );
    });
}

// Переход к списку материалов
function showMaterials() {
    currentView = "materials";

    infoPage.hidden = true;
    situationsContainer.style.display = "flex";

    document.querySelector(".results-section").style.display = "block";

    renderSituations(getFilteredSituations());
}

// Отображение карточек
function renderSituations(list) {
    situationsContainer.innerHTML = "";

    resultCount.textContent = `${list.length} найдено`;

    if (list.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";

        empty.appendChild(
            createTextElement("h3", "Ничего не найдено")
        );

        empty.appendChild(
            createTextElement(
                "p",
                "Попробуй изменить запрос или фильтры."
            )
        );

        situationsContainer.appendChild(empty);
        return;
    }

    list.forEach(situation => {

        const card = document.createElement("div");
        card.className = "situation-card";

        const header = document.createElement("div");
        header.className = "situation-card-header";

        header.appendChild(
            createTextElement("h3", situation.title)
        );

        header.appendChild(
            createTextElement("span", "→", "situation-card-arrow")
        );

        card.appendChild(header);

        card.appendChild(
            createTextElement("p", situation.description)
        );

        const tags = document.createElement("div");
        tags.className = "tags";

        tags.append(
            createTextElement("span", situation.category, "tag"),
            createTextElement("span", getTypeName(situation.type), "tag"),
            createTextElement("span", getStatusName(situation.status), "tag")
        );

        if (situation.rollingStock?.length) {
            situation.rollingStock.forEach(stock => {
                tags.appendChild(
                    createTextElement("span", stock, "tag")
                );
            });
        }

        card.appendChild(tags);

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

    currentView = "details";

    situationsContainer.innerHTML = "";
    resultCount.textContent = "";

    const backButton = document.createElement("button");
    backButton.className = "back-button";
    backButton.textContent = "← Назад к материалам";

    backButton.addEventListener("click", showMaterials);

    situationsContainer.appendChild(backButton);

    const details = document.createElement("div");
    details.className = "situation-card details-card";

    details.appendChild(
        createTextElement("h2", situation.title)
    );

    const tags = document.createElement("div");
    tags.className = "tags";

    tags.append(
        createTextElement("span", situation.category, "tag"),
        createTextElement("span", getTypeName(situation.type), "tag"),
        createTextElement("span", getStatusName(situation.status), "tag")
    );

    if (situation.rollingStock?.length) {
        situation.rollingStock.forEach(stock => {
            tags.appendChild(
                createTextElement("span", stock, "tag")
            );
        });
    }

    details.appendChild(tags);

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
    }

    addSectionTitle(details, "Описание");

    details.appendChild(
        createTextElement("p", situation.description)
    );

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

    if (situation.restrictions) {
        addSectionTitle(details, "Запреты и ограничения");

        details.appendChild(
            createTextElement("p", situation.restrictions)
        );
    }

    addSectionTitle(details, "Нормативное основание");

    const source = situation.source || {};

    details.append(
        createTextElement(
            "p",
            `Документ: ${source.document || "Не указан"}`
        ),
        createTextElement(
            "p",
            `Раздел: ${source.section || "Не указан"}`
        ),
        createTextElement(
            "p",
            `Пункт: ${source.paragraph || "Не указан"}`
        )
    );

    addSectionTitle(details, "Контроль актуальности");

    details.append(
        createTextElement(
            "p",
            `Последняя проверка: ${formatDate(situation.lastVerified)}`
        ),
        createTextElement(
            "p",
            `Статус материала: ${getStatusName(situation.status)}`
        )
    );

    situationsContainer.appendChild(details);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Информационные страницы
function openInfoPage(type) {
    closeMenu();

    currentView = "info";

    document.querySelector(".results-section").style.display = "none";
    infoPage.hidden = false;
    infoContent.innerHTML = "";

    const content = {
        about: {
            title: "О справочнике",
            paragraphs: [
                "METRO PTE — справочная система для изучения устройства подвижного состава, неисправностей, сигнализации и нормативных требований метрополитена.",
                "Материалы сгруппированы по категориям и версиям подвижного состава.",
                "Информация в справочнике должна сверяться с действующими нормативными документами и инструкциями метрополитена."
            ]
        },

        disclaimer: {
            title: "Важная информация",
            paragraphs: [
                "Справочник предназначен для обучения и ознакомления с материалами.",
                "Он не заменяет действующие инструкции, приказы, распоряжения и указания уполномоченных работников метрополитена.",
                "При выполнении служебных обязанностей необходимо руководствоваться действующими официальными документами.",
                "Материалы со статусом «Черновик» или «Требует проверки» не следует считать подтверждёнными инструкциями."
            ]
        }
    };

    const page = content[type];

    if (!page) return;

    infoContent.appendChild(
        createTextElement("h2", page.title)
    );

    page.paragraphs.forEach(paragraph => {
        infoContent.appendChild(
            createTextElement("p", paragraph)
        );
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

infoBack.addEventListener("click", () => {
    showMaterials();
});

// Поиск
searchInput.addEventListener("input", () => {
    if (currentView !== "materials") {
        showMaterials();
    }

    searchClear.classList.toggle(
        "visible",
        searchInput.value.length > 0
    );

    renderSituations(getFilteredSituations());

    if (searchInput.value.trim()) {
        resultsTitle.textContent = "Результаты поиска";
        resultsSubtitle.textContent = "Материалы по твоему запросу";
    } else {
        resultsTitle.textContent = "Последние материалы";
        resultsSubtitle.textContent = "Актуальная информация из справочника";
    }
});

// Очистка поиска
searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchClear.classList.remove("visible");

    resultsTitle.textContent = "Последние материалы";
    resultsSubtitle.textContent = "Актуальная информация из справочника";

    renderSituations(getFilteredSituations());
    searchInput.focus();
});

// Выбор состава
stockButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedRollingStock = button.dataset.rollingStock;

        updateStockButtons();

        if (currentView !== "materials") {
            showMaterials();
        } else {
            renderSituations(getFilteredSituations());
        }
    });
});

// Пункты бокового меню
menuItems.forEach(item => {
    item.addEventListener("click", () => {

        if (item.dataset.category) {
            selectedCategory = item.dataset.category;
            selectedType = "all";

            closeMenu();
            updateMenuItems();
            showMaterials();

            resultsTitle.textContent = item.dataset.category;
            resultsSubtitle.textContent = "Материалы выбранной категории";
        }

        if (item.dataset.type) {
            selectedType = item.dataset.type;
            selectedCategory = null;

            closeMenu();
            updateMenuItems();
            showMaterials();

            resultsTitle.textContent =
                selectedType === "all"
                    ? "Все материалы"
                    : getTypeName(selectedType);

            resultsSubtitle.textContent = "Фильтр по типу материала";
        }

        if (item.dataset.info) {
            openInfoPage(item.dataset.info);
        }
    });
});

// Первый запуск
updateStockButtons();
updateMenuItems();

renderSituations(
    [...situations]
        .sort((a, b) => {
            return (b.lastVerified || "").localeCompare(
                a.lastVerified || ""
            );
        })
);
