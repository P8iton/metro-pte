
const situations = [
    {
        id: 1,
        title: "Потеря управления поездом",
        category: "Управление",
        description: "Демонстрационная карточка для проверки работы справочника.",
        signs: [
            "Отсутствует ожидаемая реакция на органы управления",
            "Появляются сообщения о неисправности"
        ],
        actions: [
            "Зафиксировать наблюдаемые признаки неисправности.",
            "Обратиться к действующим инструкциям и установленному порядку доклада.",
            "Дальнейшие действия выполнять только по утверждённому алгоритму."
        ],
        restrictions: "Не использовать эту демонстрационную карточку как руководство к действиям.",
        source: "Нормативный документ и пункт необходимо добавить после проверки.",
        status: "Черновик"
    },
    {
        id: 2,
        title: "Неисправность тормозной системы",
        category: "Тормоза",
        description: "Демонстрационная карточка для будущего справочника.",
        signs: [
            "Появление сообщения о неисправности тормозов",
            "Необычное поведение тормозного оборудования"
        ],
        actions: [
            "Определить и зафиксировать признаки неисправности.",
            "Найти соответствующий алгоритм в действующей документации.",
            "Не выполнять действия по непроверенным рекомендациям."
        ],
        restrictions: "Карточка не содержит утверждённого алгоритма эксплуатации.",
        source: "Нормативный документ и пункт необходимо добавить после проверки.",
        status: "Черновик"
    },
    {
        id: 3,
        title: "Неисправность связи",
        category: "Связь",
        description: "Демонстрационная карточка для проверки поиска.",
        signs: [
            "Отсутствие связи с диспетчером",
            "Нарушение работы переговорного оборудования"
        ],
        actions: [
            "Зафиксировать характер неисправности.",
            "Определить предусмотренный документацией порядок связи.",
            "Действовать согласно утверждённому регламенту."
        ],
        restrictions: "Не использовать карточку вместо официальной инструкции.",
        source: "Нормативный документ и пункт необходимо добавить после проверки.",
        status: "Черновик"
    }
];

const situationsContainer = document.getElementById("situations");
const searchInput = document.getElementById("search");
const resultCount = document.getElementById("resultCount");
const categoryCards = document.querySelectorAll(".category-card");

let selectedCategory = null;

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

        const matchesSearch = searchableText.includes(query);

        return matchesCategory && matchesSearch;
    });
}

// Отображение карточек
function renderSituations(list) {
    situationsContainer.innerHTML = "";

    if (resultCount) {
        resultCount.textContent = `${list.length} найдено`;
    }

    if (list.length === 0) {
        situationsContainer.innerHTML =
            "<p>В этой категории пока нет ситуаций.</p>";
        return;
    }

    list.forEach(situation => {
        const card = document.createElement("div");
        card.className = "situation-card";

        card.innerHTML = `
            <h3>${situation.title}</h3>
            <p>${situation.description}</p>
            <span class="tag">${situation.category}</span>
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
            <span class="tag">${situation.status}</span>

            <h2>${situation.title}</h2>

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
            <p>${situation.source}</p>
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

// Фильтрация по категориям
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

// Первый запуск
renderSituations(situations);
