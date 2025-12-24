import type { Page } from "@playwright/test";
import { expect } from "../fixtures";

export class AuthPage {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async gotoLogin() {
		await this.page.goto("/login");
		await expect(
			this.page.getByRole("heading", { name: "Welcome Back" }),
		).toBeVisible();
	}

	async gotoRegister() {
		await this.page.goto("/register");
		await expect(
			this.page.getByRole("heading", { name: "Create Account" }),
		).toBeVisible();
	}

	async register(email: string, password: string) {
		await this.gotoRegister();
		await this.page.getByPlaceholder("user@acme.com").click();
		await this.page.getByPlaceholder("user@acme.com").fill(email);
		await this.page.getByLabel("Password").click();
		await this.page.getByLabel("Password").fill(password);
		// Use exact match to avoid "Sign up with Google"
		await this.page
			.getByRole("button", { name: "Sign Up", exact: true })
			.click();
	}

	async login(email: string, password: string) {
		await this.gotoLogin();
		await this.page.getByPlaceholder("user@acme.com").click();
		await this.page.getByPlaceholder("user@acme.com").fill(email);
		await this.page.getByLabel("Password").click();
		await this.page.getByLabel("Password").fill(password);
		// Use exact match to avoid "Sign in with Google" if applicable
		await this.page
			.getByRole("button", { name: "Sign In", exact: true })
			.click();
	}

	async logout(email: string, password: string) {
		await this.login(email, password);
		await this.page.waitForURL("/");

		await this.openSidebar();

		const userNavButton = this.page.getByTestId("user-nav-button");
		await expect(userNavButton).toBeVisible();

		await userNavButton.click();
		const userNavMenu = this.page.getByTestId("user-nav-menu");
		await expect(userNavMenu).toBeVisible();

		const authMenuItem = this.page.getByTestId("user-nav-item-auth");
		await expect(authMenuItem).toContainText("Sign out");

		await authMenuItem.click();

		const userEmail = this.page.getByTestId("user-email");
		await expect(userEmail).toContainText("Guest");
	}

	async expectToastToContain(text: string) {
		await expect(this.page.getByTestId("toast")).toContainText(text);
	}

	async openSidebar() {
		const sidebarToggleButton = this.page.getByTestId("sidebar-toggle-button");
		await sidebarToggleButton.click();
	}
}
