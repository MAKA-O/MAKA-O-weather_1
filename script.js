// API
const API_KEY = '92d2783d973f81773396dda0345732fd';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM элементы
const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const searchIcon = document.getElementById('search-icon');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const weatherResult = document.getElementById('weather-result');
const autocompleteContainer = document.getElementById('autocomplete-suggestions');

// Элементы данных
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const feelsLike = document.getElementById('feels-like');
const weatherIcon = document.getElementById('weather-icon');

// Массив городов
const popularCities = [
    'Алматы', 'Нур-Султан', 'Шымкент', 'Актобе', 'Тараз', 'Павлодар',
    'Усть-Каменогорск', 'Семей', 'Атырау', 'Костанай', 'Кызылорда',
    'Уральск', 'Петропавловск', 'Актау', 'Темиртау', 'Туркестан',
    'Кокшетау', 'Талдыкорган', 'Экибастуз', 'Рудный', 'Жезказган',
    'Балхаш', 'Караганда', 'Шахтинск', 'Степногорск', 'Лисаковск',
    'Жанаозен', 'Риддер', 'Аркалык', 'Капчагай', 'Текели',
    'Житикара', 'Хромтау', 'Аксу', 'Булаево', 'Макинск',
    'Есик', 'Жаркент', 'Талгар', 'Каскелен', 'Отеген батыр',
    'Шу', 'Сарыагаш', 'Арысь', 'Кентау', 'Сатпаев', 'Приозерск',
    'Аягоз', 'Серебрянск', 'Зыряновск',
    'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
    'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону',
    'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград', 'Краснодар',
    'Саратов', 'Тюмень', 'Тольятти', 'Ижевск', 'Барнаул', 'Ульяновск',
    'Иркутск', 'Хабаровск', 'Ярославль', 'Владивосток', 'Махачкала',
    'Томск', 'Оренбург', 'Кемерово', 'Новокузнецк', 'Рязань',
    'Набережные Челны', 'Астрахань', 'Пенза', 'Липецк', 'Тула',
    'Киров', 'Чебоксары', 'Калининград', 'Брянск', 'Курск',
    'Иваново', 'Магнитогорск', 'Тверь', 'Ставрополь', 'Сочи', 'Белгород',
    'Лондон', 'Париж', 'Берлин', 'Мадрид', 'Рим', 'Амстердам', 'Прага',
    'Вена', 'Стокгольм', 'Осло', 'Копенгаген', 'Хельсинки', 'Варшава',
    'Нью-Йорк', 'Лос-Анджелес', 'Чикаго', 'Хьюстон', 'Феникс', 'Филадельфия',
    'Токио', 'Пекин', 'Сеул', 'Бангкок', 'Сингапур', 'Дубай'
];

// Переменные для автодополнения
let autocompleteTimeout;
let activeIndex = -1;
let isAutocompleteOpen = false;

// Конвертация температуры
function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

// Ошибки
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    weatherResult.classList.remove('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}

// Загрузка
function showLoading() {
    searchIcon.style.display = 'none';
    loader.style.display = 'block';
    searchBtn.disabled = true;
}

function hideLoading() {
    searchIcon.style.display = 'block';
    loader.style.display = 'none';
    searchBtn.disabled = false;
}

// Отобразить погоду
function displayWeather(data) {
    cityName.textContent = data.name;
    temperature.textContent = kelvinToCelsius(data.main.temp);
    description.textContent = data.weather[0].description;
    humidity.textContent = data.main.humidity + '%';
    feelsLike.textContent = kelvinToCelsius(data.main.feels_like) + '°C';

    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.src = iconUrl;
    weatherIcon.alt = data.weather[0].description;

    weatherResult.classList.add('show');
}

// Получить данные о погоде
async function getWeather(city) {
    try {
        const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&lang=ru`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Город не найден');
            }
            throw new Error('Ошибка сервера');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

// Поиск совпадений в городах
function findCityMatches(query) {
    if (!query || query.length < 2) return [];

    const lowercaseQuery = query.toLowerCase();
    return popularCities
        .filter(city => city.toLowerCase().includes(lowercaseQuery))
        .slice(0, 6);
}

// Отображение предложений автодополнения
function displaySuggestions(cities) {
    autocompleteContainer.innerHTML = '';
    activeIndex = -1;

    if (cities.length === 0) {
        hideAutocomplete();
        return;
    }

    cities.forEach((city, index) => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion-item';
        suggestion.innerHTML = `
            <span class="material-icons">location_on</span>
            ${city}
        `;

        suggestion.addEventListener('click', async () => {
            cityInput.value = city;
            hideAutocomplete();
            await performSearch(city);
        });

        suggestion.addEventListener('mouseenter', () => {
            setActiveIndex(index);
        });

        autocompleteContainer.appendChild(suggestion);
    });

    showAutocomplete();
}

// Показать автодополнение
function showAutocomplete() {
    autocompleteContainer.style.display = 'block';
    isAutocompleteOpen = true;
}

// Скрыть автодополнение
function hideAutocomplete() {
    autocompleteContainer.style.display = 'none';
    isAutocompleteOpen = false;
    activeIndex = -1;
}

// Установить активный элемент
function setActiveIndex(index) {
    const suggestions = autocompleteContainer.querySelectorAll('.suggestion-item');
    suggestions.forEach((item, idx) => {
        item.classList.toggle('active', idx === index);
    });
    activeIndex = index;
}

// Выполнить поиск погоды
async function performSearch(city) {
    if (!city.trim()) {
        showError('Введите название города');
        return;
    }

    hideError();
    showLoading();

    try {
        const data = await getWeather(city);
        displayWeather(data);
        cityInput.value = '';
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Обработка формы
async function handleSubmit(e) {
    e.preventDefault();
    const city = cityInput.value.trim();
    hideAutocomplete();
    await performSearch(city);
}

function handleInput(e) {
    const query = e.target.value.trim();

    // Скрыть ошибку при вводе
    if (errorMessage.classList.contains('show')) {
        hideError();
    }

    // Очистить предыдущий таймер
    if (autocompleteTimeout) {
        clearTimeout(autocompleteTimeout);
    }


    // Добавить задержку для оптимизации
    autocompleteTimeout = setTimeout(() => {
        const matches = findCityMatches(query);
        displaySuggestions(matches);
    }, 150);
}

// Обработка клавиатурной навигации
function handleKeyNavigation(e) {
    if (!isAutocompleteOpen) return;

    const suggestions = autocompleteContainer.querySelectorAll('.suggestion-item');
    if (suggestions.length === 0) return;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            activeIndex = (activeIndex + 1) % suggestions.length;
            setActiveIndex(activeIndex);
            break;

        case 'ArrowUp':
            e.preventDefault();
            activeIndex = activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1;
            setActiveIndex(activeIndex);
            break;

        case 'Enter':
            if (activeIndex >= 0) {
                e.preventDefault();
                suggestions[activeIndex].click();
            }
            break;

        case 'Escape':
            hideAutocomplete();
            cityInput.blur();
            break;
    }
}

// Скрытие предложений при клике вне
function handleDocumentClick(e) {
    if (!e.target.closest('.input-group')) {
        hideAutocomplete();
    }
}

// Инициализация событий
function initializeEvents() {
    form.addEventListener('submit', handleSubmit);
    cityInput.addEventListener('input', handleInput);
    cityInput.addEventListener('keydown', handleKeyNavigation);
    document.addEventListener('click', handleDocumentClick);
    cityInput.focus();
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', initializeEvents);