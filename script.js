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

// Элементы данных
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const feelsLike = document.getElementById('feels-like');
const weatherIcon = document.getElementById('weather-icon');

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

// Скрыть ошибки
function hideError() {
    errorMessage.classList.remove('show');
}

// Загрузка
function showLoading() {
    searchIcon.style.display = 'none';
    loader.style.display = 'block';
    searchBtn.disabled = true;
}

// Скрыть загрузки
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

// Обработка формы
async function handleSubmit(e) {
    e.preventDefault();

    const city = cityInput.value.trim();
    if (!city) {
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

// Скрыть ошибку при вводе
function handleInput() {
    if (errorMessage.classList.contains('show')) {
        hideError();
    }
}

// Инициализация
form.addEventListener('submit', handleSubmit);
cityInput.addEventListener('input', handleInput);
cityInput.focus();