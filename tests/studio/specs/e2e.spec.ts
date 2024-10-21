import { test, expect } from "@playwright/test";
import { OPENAPI_DATA } from "./data/openapi-simple";

const OPENAPI_DATA_STR: string = JSON.stringify(OPENAPI_DATA, null, 4);

const STUDIO_URL: string = process.env["STUDIO_URL"] || "http://localhost:8888";
const USERNAME: string = process.env["TEST_USERNAME"] || "user";
const PASSWORD: string = process.env["TEST_PASSWORD"] || "password";


test("End to End Test (Studio)", async ({ page }) => {
    await page.goto(STUDIO_URL);

    await expect(page).toHaveTitle(/Sign in to apicurio/, { timeout: 10000 });

    // Log in
    await page.locator("#username").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("#kc-login").click();

    // Should then redirect to Studio
    await expect(page).toHaveTitle(/Apicurio Studio/);

    expect(page.getByTestId("btn-toolbar-create-draft")).toBeDefined();

    const now: string = `${Date.now()}`;
    const groupId: string = "e2e-test-group";
    const draftId: string = `e2e-test-draft-${now}`;
    const version: string = "1.0";
    const name: string = `Test API`;
    const description: string = "A new, fantastic, OpenAPI API design.";

    // Click the "Create draft" button
    await page.getByTestId("btn-toolbar-create-draft").click();
    await expect(page.getByTestId("create-draft-modal-group")).toHaveValue("");

    // Create a new draft
    await page.getByTestId("create-draft-modal-group").fill(groupId);
    await page.getByTestId("create-draft-modal-id").fill(draftId);
    await page.getByTestId("create-draft-modal-version").fill(version);
    await page.getByText("Next").click();
    await page.locator("#draft-content").fill(OPENAPI_DATA_STR);
    await page.getByText("Next").click();
    await page.getByTestId("create-draft-modal-draft-metadata-name").fill(name);
    await page.getByTestId("create-draft-modal-draft-metadata-description").fill(description);
    await page.locator("#next-wizard-page").click();

    // Make sure we redirected to the draft details page.
    let expectedPageUrlPattern: RegExp = /.+\/drafts\/e2e-test-group\/e2e-test-draft-[0-9]+\/1.0/;
    await expect(page).toHaveURL(expectedPageUrlPattern);

    // Click the Delete Draft button
    await page.getByTestId("draft-btn-delete").click();

    // Click the Delete button on the resulting confirmation modal
    await page.getByTestId("modal-btn-delete").click();

    // Make sure we redirected to the editor page.
    expectedPageUrlPattern = /.+\/drafts/;
    await expect(page).toHaveURL(expectedPageUrlPattern);
});
