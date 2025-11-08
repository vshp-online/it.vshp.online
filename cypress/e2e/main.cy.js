describe("Основная навигация сайта", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("показывает активный блок на главной", () => {
    cy.contains("h1", "Кафедра Информационных Технологий").should("be.visible");
    cy.contains("a", "Обучение").should("have.attr", "href", "/disciplines/");
  });

  it("переходит в раздел «Блог» из навигации", () => {
    cy.contains("a", "Блог").click();
    cy.url().should("include", "/blog/");
    cy.contains("h1", "Блог").should("be.visible");
  });

  it("открывает раздел «Учебные материалы» по прямой ссылке", () => {
    cy.visit("/disciplines/");
    cy.contains("h1", "Учебные материалы").should("be.visible");
    cy.contains("a", "ИТ.03 - Основы проектирования баз данных").should(
      "have.attr",
      "href",
      "/disciplines/it03/"
    );
  });
});
