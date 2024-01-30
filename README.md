# libraryTable2.0
 
Class Table - 

Аргументы:
1. ID контейнера 2. Данные таблицы

Методы:

insertRow(rowIndex) вставляет пустой ряд в заданную точку
insertColumn(columnIndex, columnHeader) вставляет пустую колонку в заданную точку - обязательно вторым аргументам передать header

pushRow -  вставляет ряд в конец
pushColumn - вставляет колонку в конец

deleteRow(rowIndex) - удаляет ряд по индексу
deleteColumn(rowIndex) - удаляет колонку по индексу

getChartData(rowIndex) - метод для получение данных для графика
setTable - установка новой таблицы

subscribe - метод для подписки на событие - их список
- changeCellContent
- addRow
- addColumn
- removeRow
- removeColumn
-setTable

Class Chart

Аргументы:
1. ID контейнера 2. Данные таблицы 3. Список заголовков 4. Тип графика(линейный по умолчанию)

Методы:

setChartType - установка типа графика (line, column)
setChartData -  установка данных для графика

setMarkColor - установка цвета отметок 
setMarkCount - установка кол-во отметок
setMarkWidth - установка толщины отметок
setMarkTextColor - установка цвета текстовых отметок
setLineColor - установка цвета ребер в линейном в графике
setLineWidth - установка толщины линии
setCircleColor - установка цвета вершин на графике
setCircleRadius - установка радиуса вершин
setColumnColor - установка цвета колонок
setColumnBorder - установка границ колонок
setChartWidth - установка ширины графика
setChartHeight - установка высоты графика

Class Modal

Аргументы:
1.Содержимое (html или element) 
2. ID под котором будет контейнер для контента(по умолчанию basicIdContent) 
3. Настройка режима модального окно - false - не удаление модального окна после закрытие - true удаление модального окна при закрытии 
(false по умолчанию)

Методы: 

openModal - открытие модального окна
closeModal - закрытие модального окна

setBackGroundColorModal - установка цвета заднего фона на content части
setBackGroundColorOverlay - установка цвета заднего фона  overlay части
setMaxWidth - установка максимальной ширины 
setMaxHeight - установка максимальной высоты