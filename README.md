# Система типов
**Описание**: Cистемы типов Wasaby, обеспечивающая эффективную работу различных типов, структур данных, коллекций и операций над ними.

- Ответственный: [Буранов Азамат](https://online.sbis.ru/person/9323a379-618c-46bc-b721-f4f1b046878d "Буранов Азамат")
- Ответственный за Meta и MetaUnit: [Санников Кирилл](https://online.sbis.ru/person/eaa71514-f494-4ba4-9655-83ec59b449ef "Санников Кирилл")
- Тестирование: [Кулясов Павел](https://online.sbis.ru/person/396040b1-e9a0-4eae-9ea3-68ade828e87e "Кулясов Павел")

**ТД** – [ссылка](https://wi.sbis.ru/docs/js/Types/ "ссылка")

## Настройка окружения для разработки

1. Клонируйте репозиторий в отдельную папку:

        git clone git@git.sbis.ru:saby/Types.git ./

1. Установите зависимости:

        npm install

1. Соберите проект:

        npm run build

### Доступные скрипты

- Сборка TypeScript:

        npm run build:compile

- Запуск юнит-тестов в Node.js:

        npm test

- Запуск юнит-тестов в локальном HTTP сервере для просмотра [результатов в браузере](http://localhost:1025/):

        npm start


- Запуск юнит-тестов в Node.js и отображение отчета о покрытии:

        npm test:coverage

## Интеграция с Jenkins

С помощью флажка

*✓ Inject environment variables to the build process*

вы можете использовать следующие переменные окружения:

- `test_server_port` - порт для локального HTTP-сервера (по умолчанию `1025`);
- `test_url_host` - имя хоста, на котором запущен HTTP-сервер (по умолчанию `localhost`). Вы должны установить эту переменную, если используется Selenium Grid на другом хосте;
- `test_url_port` - то же, что и `test_server_port`;
- `test_report` - имя файла XUnit report для сохранения отчета (по умолчанию `artifacts/xunit-report.xml`).
