
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

const departmentCards = document.querySelectorAll("[data-department-card]");
const allDepartmentsButton = document.getElementById("allDepartmentsButton");
const stockSelector = document.getElementById("stockSelector");

const resultsTitle = document.getElementById("resultsTitle");
const resultsSubtitle = document.getElementById("resultsSubtitle");

const resultsSection = document.querySelector(".results-section");

const infoPage = document.getElementById("infoPage");
const infoContent = document.getElementById("infoContent");
const infoBack = document.getElementById("infoBack");

const scrollTopButton = document.getElementById("scrollTopButton");


// СОСТОЯНИЕ ПРИЛОЖЕНИЯ

let selectedDepartment = "all";
let selectedCategory = null;
let selectedType = "all";
let selectedRollingStock = "all";

let currentView = "materials";


// НАЗВАНИЯ ОТДЕЛОВ

function getDepartmentName(department) {
    const departments = {
        all: "Все отделы",
        train: "Управление поездом",
        labor: "Охрана труда"
    };

    return departments[department] || "Управление поездом";
}


// ОПРЕДЕЛЕНИЕ ОТДЕЛА МАТЕРИАЛА

function getSituationDepartment(item) {
    return item.department === "labor"
        ? "labor"
        : "train";
}


// ПОЛУЧЕНИЕ ОСНОВНОГО ТЕКСТА МАТЕРИАЛА

function getSituationContent(item) {
    if (item.department === "labor") {
        return item.content || item.description || "";
    }

    return item.description || "";
}


// НАЗВАНИЯ ТИПОВ

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


// НАЗВАНИЯ СТАТУСОВ

function getStatusName(status) {
    const statuses = {
        draft: "Черновик",
        review: "Требует проверки",
        verified: "Проверено"
    };

    return statuses[status] || "Статус не указан";
}


// ФОРМАТИРОВАНИЕ ДАТЫ

function formatDate(dateValue) {
    if (!dateValue) return "Не указана";

    const parts = dateValue.split("-");

    if (parts.length !== 3) return "Не указана";

    return `${parts[2]}.${parts[1]}.${parts[0]}`;
}


// СОЗДАНИЕ ТЕКСТОВОГО ЭЛЕМЕНТА

function createTextElement(tag, text, className = "") {
    const element = document.createElement(tag);

    element.textContent = text || "";

    if (className) {
        element.className = className;
    }

    return element;
}


// СОЗДАНИЕ ТЕКСТА С СОХРАНЕНИЕМ АБЗАЦЕВ

function createContentElement(text, className = "") {
    const element = createTextElement("p", text, className);

    element.style.whiteSpace = "pre-line";

    return element;
}


// СОЗДАНИЕ ЗАГОЛОВКА РАЗДЕЛА

function addSectionTitle(container, title) {
    container.appendChild(
        createTextElement("h3", title)
    );
}


// СОРТИРОВКА МАТЕРИАЛОВ

function sortSituations(list) {
    return [...list].sort((a, b) => {
        return (b.lastVerified || "").localeCompare(
            a.lastVerified || ""
        );
    });
}


// КНОПКА ПРОКРУТКИ ВВЕРХ

function updateScrollTopButton() {
    if (!scrollTopButton) return;

    scrollTopButton.hidden = window.scrollY < 300;
}

if (scrollTopButton) {
    window.addEventListener("scroll", updateScrollTopButton, {
        passive: true
    });

    scrollTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    updateScrollTopButton();
}


// УПРАВЛЕНИЕ БОКОВЫМ МЕНЮ

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


// ОБНОВЛЕНИЕ АКТИВНЫХ ПУНКТОВ МЕНЮ

function updateMenuItems() {
    menuItems.forEach(item => {
        const department = item.dataset.department;
        const category = item.dataset.category;
        const type = item.dataset.type;

        let isActive = false;

        if (department && !category && !type) {
            isActive = department === selectedDepartment;
        }

        if (category) {
            isActive =
                department === selectedDepartment &&
                category === selectedCategory;
        }

        if (type) {
            isActive = type === selectedType;
        }

        item.classList.toggle("active", isActive);
    });
}


// ОБНОВЛЕНИЕ КНОПОК ПОДВИЖНОГО СОСТАВА

function updateStockButtons() {
    stockButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.rollingStock === selectedRollingStock
        );
    });
}


// ОБНОВЛЕНИЕ ВЫБОРА ОТДЕЛА

function updateDepartmentUI() {
    departmentCards.forEach(card => {
        card.classList.toggle(
            "active",
            card.dataset.departmentCard === selectedDepartment
        );
    });

    allDepartmentsButton.classList.toggle(
        "active",
        selectedDepartment === "all"
    );

    stockSelector.hidden = selectedDepartment === "labor";

    if (selectedDepartment === "all") {
        searchInput.placeholder = "Поиск по обоим отделам...";
    } else if (selectedDepartment === "train") {
        searchInput.placeholder = "Поиск по управлению поездом...";
    } else {
        searchInput.placeholder = "Поиск по охране труда...";
    }
}


// ОБНОВЛЕНИЕ ЗАГОЛОВКА РЕЗУЛЬТАТОВ

function updateResultsHeading() {
    const query = searchInput.value.trim();

    if (query) {
        resultsTitle.textContent = "Результаты поиска";

        if (selectedDepartment === "all") {
            resultsSubtitle.textContent =
                "Результаты по обоим отделам";
        } else {
            resultsSubtitle.textContent =
                `Результаты: ${getDepartmentName(selectedDepartment)}`;
        }

        return;
    }

    if (selectedCategory) {
        resultsTitle.textContent = selectedCategory;
        resultsSubtitle.textContent = "Материалы выбранной категории";
        return;
    }

    if (selectedType !== "all") {
        resultsTitle.textContent = getTypeName(selectedType);
        resultsSubtitle.textContent = "Фильтр по типу материала";
        return;
    }

    if (selectedDepartment === "all") {
        resultsTitle.textContent = "Последние материалы";
        resultsSubtitle.textContent = "Поиск по всем отделам справочника";
        return;
    }

    resultsTitle.textContent = getDepartmentName(selectedDepartment);
    resultsSubtitle.textContent = "Материалы выбранного отдела";
}


// ПРОВЕРКА ССЫЛКИ НА ВЛОЖЕНИЕ

function getSafeAttachmentUrl(url) {
    if (typeof url !== "string") {
        return null;
    }

    const normalized = url.trim();

    // Разрешаем только файлы из папки attachments.
    // Это не позволяет вставить в ссылку javascript-код
    // или произвольный путь к файлу.
    if (
        !normalized.startsWith("attachments/") ||
        normalized.includes("..") ||
        normalized.includes("\\")
    ) {
        return null;
    }

    return normalized;
}


// ПОЛУЧЕНИЕ ВЛОЖЕНИЙ МАТЕРИАЛА

function getSituationAttachments(situation) {
    if (!Array.isArray(situation.attachments)) {
        return [];
    }

    return situation.attachments.filter(attachment => {
        return (
            attachment &&
            typeof attachment.name === "string" &&
            getSafeAttachmentUrl(attachment.url)
        );
    });
}


// ОТОБРАЖЕНИЕ ВЛОЖЕНИЙ

function renderSituationAttachments(container, situation) {
    const attachments = getSituationAttachments(situation);

    if (!attachments.length) {
        return;
    }

    addSectionTitle(container, "Прикреплённые файлы");

    const list = document.createElement("div");
    list.className = "attachments-list";

    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.gap = "10px";
    list.style.marginTop = "12px";

    attachments.forEach(attachment => {
        const url = getSafeAttachmentUrl(attachment.url);

        if (!url) {
            return;
        }

        const item = document.createElement("div");
        item.className = "attachment-link-item";

        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.justifyContent = "space-between";
        item.style.flexWrap = "wrap";
        item.style.gap = "10px";
        item.style.padding = "12px";
        item.style.background = "rgba(255, 255, 255, 0.035)";
        item.style.border = "1px solid rgba(255, 255, 255, 0.09)";
        item.style.borderRadius = "9px";

        const fileInfo = document.createElement("div");

        fileInfo.style.minWidth = "0";
        fileInfo.style.flex = "1";
        fileInfo.style.overflowWrap = "anywhere";

        const fileName = createTextElement(
            "div",
            attachment.name,
            "attachment-file-name"
        );

        fileName.style.fontWeight = "500";

        const filePath = createTextElement(
            "div",
            url.split("/").pop(),
            "attachment-file-meta"
        );

        filePath.style.marginTop = "4px";
        filePath.style.color = "#929baa";
        filePath.style.fontSize = "12px";

        fileInfo.append(fileName, filePath);

        const actions = document.createElement("div");

        actions.style.display = "flex";
        actions.style.flexWrap = "wrap";
        actions.style.gap = "8px";

        const openLink = document.createElement("a");

        openLink.href = url;
        openLink.target = "_blank";
        openLink.rel = "noopener noreferrer";
        openLink.textContent = "Открыть";

        const downloadLink = document.createElement("a");

        downloadLink.href = url;
        downloadLink.download = "";
        downloadLink.textContent = "Скачать";

        [openLink, downloadLink].forEach(link => {
            link.style.display = "inline-block";
            link.style.padding = "7px 11px";
            link.style.border = "1px solid #3a485c";
            link.style.borderRadius = "6px";
            link.style.background = "#293444";
            link.style.color = "#edf0f5";
            link.style.textDecoration = "none";
            link.style.fontSize = "13px";
        });

        actions.append(openLink, downloadLink);

        item.append(fileInfo, actions);
        list.appendChild(item);
    });

    if (list.children.length) {
        container.appendChild(list);
    }
}


// ФИЛЬТРАЦИЯ МАТЕРИАЛОВ

function getFilteredSituations() {
    const query = searchInput.value.toLowerCase().trim();

    return situations.filter(item => {

        const itemDepartment = getSituationDepartment(item);

        const matchesDepartment =
            selectedDepartment === "all" ||
            itemDepartment === selectedDepartment;

        const matchesCategory =
            !selectedCategory ||
            item.category === selectedCategory;

        const matchesType =
            selectedType === "all" ||
            item.type === selectedType;

        const stockList = item.rollingStock || [];

        const matchesRollingStock =
            itemDepartment === "labor" ||
            selectedRollingStock === "all" ||
            stockList.includes(selectedRollingStock);

        const searchableText = [
            item.title,
            item.category,
            item.description,
            item.content,
            item.restrictions,
            item.source?.document,
            item.source?.section,
            item.source?.paragraph,
            ...((item.signs || [])),
            ...((item.actions || [])),
            ...((item.rollingStock || [])),
            ...getSituationAttachments(item).map(file => file.name),
            getDepartmentName(itemDepartment)
        ].join(" ").toLowerCase();

        const matchesSearch =
            searchableText.includes(query);

        return (
            matchesDepartment &&
            matchesCategory &&
            matchesType &&
            matchesRollingStock &&
            matchesSearch
        );
    });
}


// ПЕРЕХОД К СПИСКУ МАТЕРИАЛОВ

function showMaterials() {
    currentView = "materials";

    infoPage.hidden = true;
    situationsContainer.style.display = "flex";
    resultsSection.style.display = "block";

    updateDepartmentUI();
    updateMenuItems();
    updateResultsHeading();

    renderSituations(
        sortSituations(getFilteredSituations())
    );
}


// ОТОБРАЖЕНИЕ КАРТОЧЕК

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

        const department = getSituationDepartment(situation);

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

        // Описание показываем только в разделе «Управление поездом».
        // В «Охране труда» основной текст доступен после открытия карточки.

        if (department === "train" && situation.description) {
            card.appendChild(
                createTextElement("p", situation.description)
            );
        }

        const tags = document.createElement("div");
        tags.className = "tags";

        const departmentTag = createTextElement(
            "span",
            getDepartmentName(department),
            `tag department-tag ${department}`
        );

        tags.appendChild(departmentTag);

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


// ПОДРОБНАЯ ИНФОРМАЦИЯ О МАТЕРИАЛЕ

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

    const department = getSituationDepartment(situation);
    const isLabor = department === "labor";

    const tags = document.createElement("div");
    tags.className = "tags";

    tags.append(
        createTextElement(
            "span",
            getDepartmentName(department),
            `tag department-tag ${department}`
        ),
        createTextElement("span", situation.category, "tag"),
        createTextElement("span", getTypeName(situation.type), "tag"),
        createTextElement("span", getStatusName(situation.status), "tag")
    );

    if (!isLabor && situation.rollingStock?.length) {
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


    // ОТДЕЛ ОХРАНЫ ТРУДА

    if (isLabor) {
        const mainContent = getSituationContent(situation);

        addSectionTitle(details, "Основной текст");

        details.appendChild(
            createContentElement(
                mainContent || "Текст материала пока не добавлен.",
                "labor-content"
            )
        );
    }


    // ОТДЕЛ УПРАВЛЕНИЯ ПОЕЗДОМ

    else {
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
    }


    // ПРИКРЕПЛЁННЫЕ ФАЙЛЫ

    renderSituationAttachments(details, situation);


    // НОРМАТИВНОЕ ОСНОВАНИЕ

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


    // КОНТРОЛЬ АКТУАЛЬНОСТИ

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

    // Не прокручиваем страницу при открытии карточки.
}


// СТРАНИЦА СОЗДАТЕЛЯ

function renderCredits() {
    const card = document.createElement("div");
    card.className = "credits-card";

    const logo = createTextElement(
        "div",
        "🚇",
        "credits-logo"
    );

    const project = createTextElement(
        "h2",
        "METRO PTE",
        "credits-project"
    );

    const label = createTextElement(
        "div",
        "СПРАВОЧНАЯ СИСТЕМА МАШИНИСТА МЕТРОПОЛИТЕНА",
        "credits-label"
    );

    const divider = createTextElement(
        "div",
        "",
        "credits-divider"
    );

    const author = createTextElement(
        "p",
        "Портных А. М.",
        "credits-author"
    );

    const role = createTextElement(
        "div",
        "Автор и разработчик проекта",
        "credits-role"
    );

    const copyright = createTextElement(
        "div",
        "© 2026 METRO PTE",
        "credits-copyright"
    );

    card.append(
        logo,
        project,
        label,
        divider,
        author,
        role,
        copyright
    );

    infoContent.appendChild(card);
}


// ИНФОРМАЦИОННЫЕ СТРАНИЦЫ

function openInfoPage(type) {
    closeMenu();

    currentView = "info";

    resultsSection.style.display = "none";
    infoPage.hidden = false;
    infoContent.innerHTML = "";

    if (type === "credits") {
        renderCredits();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        return;
    }

    const content = {
        about: {
            title: "О справочнике",
            paragraphs: [
                "METRO PTE — справочная система для изучения устройства подвижного состава, неисправностей, сигнализации, нормативных требований и вопросов охраны труда.",
                "Справочник разделён на два основных отдела: «Управление поездом» и «Охрана труда».",
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


// ВОЗВРАТ ИЗ ИНФОРМАЦИОННОЙ СТРАНИЦЫ

infoBack.addEventListener("click", () => {
    showMaterials();
});


// ПЕРЕКЛЮЧЕНИЕ ОТДЕЛОВ

function selectDepartment(department) {
    selectedDepartment = department;

    selectedCategory = null;
    selectedType = "all";

    closeMenu();

    showMaterials();
}


// КАРТОЧКИ ОТДЕЛОВ НА ГЛАВНОЙ

departmentCards.forEach(card => {
    card.addEventListener("click", () => {
        selectDepartment(card.dataset.departmentCard);
    });
});


// КНОПКА ОБЩЕГО ПОИСКА

allDepartmentsButton.addEventListener("click", () => {
    selectDepartment("all");
});


// ПОИСК

searchInput.addEventListener("input", () => {
    if (currentView !== "materials") {
        currentView = "materials";

        infoPage.hidden = true;
        resultsSection.style.display = "block";
    }

    searchClear.classList.toggle(
        "visible",
        searchInput.value.length > 0
    );

    updateResultsHeading();

    renderSituations(
        sortSituations(getFilteredSituations())
    );
});


// ОЧИСТКА ПОИСКА

searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchClear.classList.remove("visible");

    showMaterials();

    searchInput.focus();
});


// ВЫБОР ПОДВИЖНОГО СОСТАВА

stockButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedRollingStock = button.dataset.rollingStock;

        updateStockButtons();

        if (currentView !== "materials") {
            showMaterials();
        } else {
            updateResultsHeading();

            renderSituations(
                sortSituations(getFilteredSituations())
            );
        }
    });
});


// ПУНКТЫ БОКОВОГО МЕНЮ

menuItems.forEach(item => {
    item.addEventListener("click", () => {

        // ПЕРЕКЛЮЧЕНИЕ ОТДЕЛА

        if (
            item.dataset.department &&
            !item.dataset.category &&
            !item.dataset.type
        ) {
            selectDepartment(item.dataset.department);
            return;
        }

        // ВЫБОР КАТЕГОРИИ

        if (item.dataset.category) {
            selectedDepartment =
                item.dataset.department || "train";

            selectedCategory = item.dataset.category;
            selectedType = "all";

            closeMenu();

            showMaterials();
            return;
        }

        // ВЫБОР ТИПА МАТЕРИАЛА

        if (item.dataset.type) {
            selectedType = item.dataset.type;
            selectedCategory = null;

            closeMenu();

            showMaterials();
            return;
        }

        // ИНФОРМАЦИОННЫЕ СТРАНИЦЫ

        if (item.dataset.info) {
            openInfoPage(item.dataset.info);
        }
    });
});


// ПЕРВЫЙ ЗАПУСК

updateStockButtons();
updateDepartmentUI();
updateMenuItems();

renderSituations(
    sortSituations(
        getFilteredSituations()
    )
);

updateResultsHeading();
