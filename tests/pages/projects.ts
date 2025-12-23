import { expect, type Page } from "@playwright/test";

export class ProjectsPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/projects");
  }

  get createProjectButton() {
    return this.page.getByRole("button", { name: "Create Project" });
  }

  get searchInput() {
    return this.page.getByPlaceholder("Search projects...");
  }

  async createProject(name: string, description: string) {
    await this.createProjectButton.click();

    await expect(this.page.getByRole("dialog")).toBeVisible();
    await expect(this.page.getByRole("heading", { name: "Create Project" })).toBeVisible();

    await this.page.getByLabel("Name").fill(name);
    await this.page.getByLabel("Description").fill(description);

    // Select visibility if needed, defaulting to private in the UI
    // await this.page.getByLabel("Visibility").click();

    const submitButton = this.page.getByRole("button", { name: "Create Project" }).last();
    await submitButton.click();

    // Expect redirection to writer
    await expect(this.page).toHaveURL(/\/projects\/.+/);
  }

  async openProject(name: string) {
    // Wait for the grid to load
    await expect(this.page.getByText("Projects")).toBeVisible();

    // Click on the project card with the given name
    // This assumes the project name is visible as text
    const projectCard = this.page.getByRole("heading", { name: name });
    await projectCard.click();
  }
}
