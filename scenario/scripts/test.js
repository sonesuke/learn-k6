import { browser } from "k6/experimental/browser";

export const options = {
  scenarios: {
    ui: {
      executor: "shared-iterations",
      vus: 5,
      iterations: 5,
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
};

export function setup(){
    // setup code
}

export default async function () {
  const page = browser.newPage();

  try {
    await page.goto("https://test.k6.io/");
    page.screenshot({ path: "/app/screenshots/screenshot.png" });
  } finally {
    page.close();
  }
}

export function teardown(){
    // teardown code
}