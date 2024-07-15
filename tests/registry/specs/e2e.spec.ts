import { test, expect } from "@playwright/test";
import { OPENAPI_DATA } from "./data/openapi-simple";

const OPENAPI_DATA_STR: string = JSON.stringify(OPENAPI_DATA, null, 4);

const REGISTRY_URL: string = process.env["REGISTRY_URL"] || "http://localhost:8888";
const USERNAME: string = process.env["TEST_USERNAME"] || "user";
const PASSWORD: string = process.env["TEST_PASSWORD"] || "password";


test("End to End Test (Registry)", async ({ page }) => {
    const testArtifactId = `TestArtifact-${Date.now()}`;
    await page.goto(REGISTRY_URL);

    await expect(page).toHaveTitle(/Sign in to apicurio/, { timeout: 10000 });

    // Log in
    await page.locator("#username").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("#kc-login").click();

    // Should then redirect to Registry
    await expect(page).toHaveTitle(/Apicurio Registry/);

    expect(page.getByTestId("btn-toolbar-create-artifact")).toBeDefined();

    // Click the "Create artifact" button
    await page.getByTestId("btn-toolbar-create-artifact").click();
    await expect(page.getByTestId("create-artifact-modal-group")).toHaveValue("");

    // Create a new artifact

    // Fill out page 1 of the create artifact wizard
    await page.getByTestId("create-artifact-modal-group").fill("e2e.tester");
    await page.getByTestId("create-artifact-modal-id").fill(testArtifactId);
    await page.getByTestId("create-artifact-modal-type-select").click();
    await page.getByTestId("create-artifact-modal-OPENAPI").click();

    // Click "Next" on the wizard
    await page.locator("#next-wizard-page").click();

    // Fill out page 2 of the create artifact wizard
    await page.getByTestId("create-artifact-modal-artifact-metadata-name").fill("Test Artifact");
    await page.getByTestId("create-artifact-modal-artifact-metadata-description").fill("Artifact description.");

    // Click "Next" on the wizard
    await page.locator("#next-wizard-page").click();

    // Fill out page 3 of the create artifact wizard
    await page.getByTestId("create-artifact-modal-version").fill("1.0.0");
    await page.locator("#artifact-content").fill(OPENAPI_DATA_STR);

    // Click "Next" on the wizard
    await page.locator("#next-wizard-page").click();

    // Leave page 4 empty and click "Complete"
    await page.locator("#next-wizard-page").click();

    // Make sure we redirected to the artifact detail page.
    await expect(page).toHaveURL(/.+\/explore\/e2e.tester\/TestArtifact-[\d]+/);

    // Click the "Edit" button to show the Edit Metadata modal
    await page.getByTestId("artifact-btn-edit").click();
    await expect(page.getByTestId("edit-metadata-modal-name")).toHaveValue("Test Artifact");

    // Change/add some values
    await page.getByTestId("edit-metadata-modal-name").fill("My Empty API");
    await page.getByTestId("edit-metadata-modal-description").fill("A simple empty API.");

    // Save changes
    await page.getByTestId("modal-btn-edit").click();

    // Assert the meta-data is as expected
    await expect(page.getByTestId("artifact-details-name")).toHaveText("My Empty API");
    await expect(page.getByTestId("artifact-details-description")).toHaveText("A simple empty API.");

    // Delete the artifact
    await page.getByTestId("header-btn-delete").click();
    await page.getByTestId("modal-btn-delete").click();

    await expect(page).toHaveURL(/.+\/explore/);
});
