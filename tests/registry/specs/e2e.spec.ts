import { test, expect } from "@playwright/test";
import { OPENAPI_DATA } from "./data/openapi-simple";

const OPENAPI_DATA_STR: string = JSON.stringify(OPENAPI_DATA, null, 4);

const REGISTRY_URL: string = process.env["REGISTRY_URL"] || "http://localhost:8888";
const USERNAME: string = process.env["TEST_USERNAME"] || "user";
const PASSWORD: string = process.env["TEST_PASSWORD"] || "password";


test("End to End - Login", async ({ page }) => {
    await page.goto(REGISTRY_URL);

    await expect(page).toHaveTitle(/Sign in to apicurio/, { timeout: 10000 });

    // Log in
    await page.locator("#username").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("#kc-login").click();

    // Should then redirect to Registry
    await expect(page).toHaveTitle(/Apicurio Registry/);
});

test("End to End - Upload artifact", async ({ page }) => {
    await page.goto(REGISTRY_URL);
    await expect(page).toHaveTitle(/Apicurio Registry/);

    expect(page.getByTestId("btn-toolbar-upload-artifact")).toBeDefined();

    // Click the "Upload artifact" button
    await page.getByTestId("btn-toolbar-upload-artifact").click();
    await expect(page.getByTestId("upload-artifact-form-group")).toHaveValue("");

    // Upload a new artifact
    await page.getByTestId("upload-artifact-form-group").fill("e2e.tester");
    await page.getByTestId("upload-artifact-form-id").fill("TestArtifact");
    await page.getByTestId("upload-artifact-form-type-select").click();
    await page.getByTestId("upload-artifact-form-OPENAPI").click();
    await page.locator("#artifact-content").fill(OPENAPI_DATA_STR);
    await page.getByTestId("upload-artifact-modal-btn-upload").click();

    // Make sure we redirected to the artifact detail page.
    await expect(page).toHaveURL(/.+\/artifacts\/e2e.tester\/TestArtifact\/versions\/latest/);

    // Assert the meta-data is as expected
    await expect(page.getByTestId("artifact-details-id")).toHaveText("TestArtifact");
    await expect(page.getByTestId("artifact-details-state")).toHaveText("ENABLED");
});


test("End to End - Edit metadata", async ({ page }) => {
    // Navigate to the artifact details page
    await page.goto(`${REGISTRY_URL}/artifacts/e2e.tester/TestArtifact/versions/latest`);

    // Click the "Edit" button to show the modal
    await page.getByTestId("artifact-btn-edit").click();
    await expect(page.getByTestId("edit-metadata-modal-name")).toHaveValue("Empty API Spec");

    // Change/add some values
    await page.getByTestId("edit-metadata-modal-name").fill("My Empty API");
    await page.getByTestId("edit-metadata-modal-description").fill("A simple empty API.");

    // Save changes
    await page.getByTestId("modal-btn-edit").click();

    // Assert the meta-data is as expected
    await expect(page.getByTestId("artifact-details-name")).toHaveText("My Empty API");
    await expect(page.getByTestId("artifact-details-description")).toHaveText("A simple empty API.");
    await expect(page.getByTestId("artifact-details-id")).toHaveText("TestArtifact");
    await expect(page.getByTestId("artifact-details-state")).toHaveText("ENABLED");
});


test("End to End - Delete artifact", async ({ page }) => {
    await page.goto(`${REGISTRY_URL}/artifacts/e2e.tester/TestArtifact/versions/latest`);
    await page.getByTestId("header-btn-delete").click();
    await page.getByTestId("modal-btn-delete").click();

    await expect(page).toHaveURL(/.+\/artifacts/);
});
