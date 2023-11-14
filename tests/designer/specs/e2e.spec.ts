import { test, expect } from "@playwright/test";

const REGISTRY_URL: string = process.env["DESIGNER_URL"] || "http://localhost:8888";
const USERNAME: string = process.env["TEST_USERNAME"] || "user";
const PASSWORD: string = process.env["TEST_PASSWORD"] || "password";


test("End to End Test (Designer)", async ({ page }) => {
    await page.goto(REGISTRY_URL);

    await expect(page).toHaveTitle(/Sign in to apicurio/, { timeout: 10000 });

    // Log in
    await page.locator("#username").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("#kc-login").click();

    // Should then redirect to Designer
    await expect(page).toHaveTitle(/Apicurio API Designer/);

    expect(page.getByTestId("btn-create-design")).toBeDefined();

    const name: string = `TestAvro_${Date.now()}`;
    const description: string = "A new Avro schema.";

    // Click the "Create design" button
    await page.getByTestId("btn-create-design").click();

    // Fill out the form
    await page.getByTestId("text-design-name").fill(name);
    await page.getByTestId("textarea-design-description").fill(description);
    // Set the type to Avro
    await page.getByTestId("select-design-type").click();
    await page.getByTestId("select-design-type-item-ASYNCAPI").click();

    // Click the Create button
    await page.getByTestId("btn-modal-create").click();

    // Make sure we redirected to the editor page
    await expect(page).toHaveURL(/.+\/designs\/.+\/editor/);
    expect(page.locator(".editor-context-breadcrumbs").getByText(name)).toBeDefined();

    // Delete the design
    await page.getByTestId("select-actions").click();
    await page.getByTestId("action-delete").click();
    expect(page.getByText("Delete design?")).toBeDefined();
    await page.getByTestId("checkbox-confirm-delete").click();
    await page.getByTestId("btn-modal-delete").click();

    expect(page.getByText("API and Schema Designs")).toBeDefined();
});
