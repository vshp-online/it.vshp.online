const SANDBOX_API = "https://sandbox.vshp.tech/api/v1";
const ASSIGNMENT_CODE = "it03-select-moscow";
const ASSIGNMENT_PATH = `${SANDBOX_API}/assignments/${encodeURIComponent(ASSIGNMENT_CODE)}`;

function seedAuthorizedSession(win) {
  win.localStorage.setItem("authorized", "true");
  win.localStorage.setItem("jwtToken", "e2e-test-token");
  win.localStorage.setItem("userName", "Тестовый Студент");
  win.localStorage.setItem("userId", "999");
}

function mockHomeworkApi() {
  cy.intercept("OPTIONS", `${SANDBOX_API}/**`, {
    statusCode: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,PUT,POST,OPTIONS",
      "access-control-allow-headers": "authorization,content-type",
    },
  });

  cy.intercept("GET", `${SANDBOX_API}/disciplines`, {
    data: [
      {
        code: "it03",
        title: "Основы проектирования баз данных",
        canRun: true,
        canSubmit: true,
        reason: null,
      },
    ],
  }).as("getDisciplines");

  cy.intercept("GET", `${SANDBOX_API}/disciplines/it03/homework-groups`, {
    data: [
      {
        code: "it03-l04-select",
        title: "Лекция 4: SELECT + WHERE",
        lectureRef: "it03/lectures/04_lecture.md",
        sortOrder: 1,
      },
    ],
  }).as("getGroups");

  cy.intercept("GET", `${SANDBOX_API}/homework-groups/it03-l04-select/assignments`, {
    data: [
      {
        code: ASSIGNMENT_CODE,
        title: "Сотрудники из Москвы",
        sortOrder: 1,
      },
    ],
  }).as("getAssignments");

  cy.intercept("GET", ASSIGNMENT_PATH, {
    data: {
      code: ASSIGNMENT_CODE,
      title: "Сотрудники из Москвы",
      promptMd:
        "Выведите имена сотрудников из Москвы. Результат должен содержать только один столбец `name` и быть отсортирован по имени по возрастанию.",
      sandbox: "sqlite",
      templateSql: "SELECT name\nFROM employees\nWHERE city = 'Москва'\nORDER BY name;",
      access: {
        canRun: true,
        canSubmit: true,
        reason: null,
      },
    },
  }).as("getAssignment");

  cy.intercept("GET", `${ASSIGNMENT_PATH}/draft`, {
    data: {
      code: "SELECT name\nFROM employees\nWHERE city = 'Москва'\nORDER BY name;",
      updatedAt: "2026-02-15T18:00:00.000Z",
    },
  }).as("getDraft");

  cy.intercept("PUT", `${ASSIGNMENT_PATH}/draft`, {
    data: {
      updatedAt: "2026-02-15T18:05:00.000Z",
    },
  }).as("saveDraft");

  cy.intercept("GET", new RegExp(`${ASSIGNMENT_PATH}/runs\\?limit=\\d+$`), {
    data: [],
  }).as("getRuns");

  cy.intercept("GET", new RegExp(`${ASSIGNMENT_PATH}/submissions\\?limit=\\d+$`), {
    data: [],
  }).as("getSubmissions");

  cy.intercept("POST", `${ASSIGNMENT_PATH}/run`, (req) => {
    expect(req.headers.authorization).to.eq("Bearer e2e-test-token");
    expect(req.body.code).to.contain("SELECT name");

    req.reply({
      data: {
        id: 101,
        runStatus: "OK",
        durationMs: 34,
        stdout: "┌───────┐\n│ name  │\n├───────┤\n│ Анна  │\n│ Виктор│\n│ Дмитрий│\n└───────┘",
        stderr: "",
        createdAt: "2026-02-15T18:10:00.000Z",
      },
    });
  }).as("runCode");

  cy.intercept("POST", `${ASSIGNMENT_PATH}/submit`, (req) => {
    expect(req.headers.authorization).to.eq("Bearer e2e-test-token");
    expect(req.body.code).to.contain("SELECT name");

    req.reply({
      data: {
        id: 201,
        submissionStatus: "CHECKED",
        isPassed: true,
        score: 100,
        feedback: "Решение принято",
        createdAt: "2026-02-15T18:11:00.000Z",
      },
    });
  }).as("submitCode");
}

describe("Домашние задания ИТ.03 (smoke)", () => {
  it("показывает баннер авторизации для неавторизованного пользователя", () => {
    cy.visit("/test/homework-it03.html");

    cy.contains("h3", "Для выполнения домашних заданий нужна авторизация").should("be.visible");
    cy.contains("a", "Перейти к авторизации")
      .should("be.visible")
      .and("have.attr", "href")
      .and("include", "/auth/");

    cy.contains("button", "Запустить").should("not.exist");
    cy.contains("button", "Отправить на проверку").should("not.exist");
  });

  it("проходит поток run -> submit на тестовой странице", () => {
    mockHomeworkApi();

    cy.visit("/test/homework-it03.html", {
      onBeforeLoad(win) {
        seedAuthorizedSession(win);
      },
    });

    cy.wait(["@getDisciplines", "@getGroups", "@getAssignments", "@getAssignment", "@getDraft", "@getRuns", "@getSubmissions"]);

    cy.contains("h2", "Тест домашних заданий (ИТ.03)").should("be.visible");
    cy.contains("h3", "Сотрудники из Москвы").should("be.visible");

    cy.contains("button", "Запустить").should("not.be.disabled").click();
    cy.wait("@runCode");

    cy.contains("Результат запуска:").should("be.visible");
    cy.contains("stdout").should("be.visible");

    cy.contains("button", "Отправить на проверку").should("not.be.disabled").click();
    cy.wait("@submitCode");

    cy.contains(/#201$/).should("be.visible");
    cy.contains("Проверка:").should("be.visible");

    cy.contains("summary", "Все отправленные решения").click();
    cy.contains("td", "#201").should("be.visible");
  });

  it("показывает историю домашних заданий в личном кабинете", () => {
    cy.intercept("GET", `${SANDBOX_API}/account/homework-history`, {
      data: [
        {
          id: 201,
          disciplineCode: "it03",
          assignmentTitle: "Сотрудники из Москвы",
          submissionStatus: "CHECKED",
          isPassed: true,
          score: 100,
          createdAt: "2026-02-15T18:11:00.000Z",
        },
      ],
    }).as("getAccountHistory");

    cy.visit("/account/", {
      onBeforeLoad(win) {
        seedAuthorizedSession(win);
      },
    });

    cy.wait("@getAccountHistory");

    cy.contains("h1", "Личный кабинет").should("be.visible");
    cy.contains("h2", "Домашние задания").should("be.visible");
    cy.contains("td", "IT03").should("be.visible");
    cy.contains("td", "Сотрудники из Москвы").should("be.visible");
    cy.contains("td", "CHECKED").should("be.visible");
  });
});
