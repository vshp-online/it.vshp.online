import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";

// Создаем интерфейс для работы с консолью
const rl = createInterface({
  input: stdin,
  output: stdout,
});

// Функция для вывода приветствия
function greetUser(name) {
  if (name && name.trim() !== "") {
    console.log(`Привет, ${name}! Рады тебя видеть!`);
  } else {
    console.log("Привет, дорогой друг! Добро пожаловать!");
  }
}

// Запрашиваем имя пользователя
console.log(
  "Введите ваше имя (или нажмите Enter для стандартного приветствия):"
);
rl.question("Ваше имя: ", (userInput) => {
  // Выводим приветствие
  greetUser(userInput);

  // Закрываем интерфейс
  rl.close();
});
