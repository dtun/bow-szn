import { findDisallowedEmails, SUPPORT_EMAIL } from "./store-email";

describe("findDisallowedEmails", () => {
  it("passes the support address", () => {
    expect(findDisallowedEmails(`Write to ${SUPPORT_EMAIL} for help`)).toEqual([]);
  });

  it("passes the support address in any letter case", () => {
    expect(findDisallowedEmails("Support@PaperStreetApp.com")).toEqual([]);
  });

  it("fails another address", () => {
    expect(findDisallowedEmails("me@example.com")).toEqual(["me@example.com"]);
  });

  it("fails another address that sits beside the support address", () => {
    expect(findDisallowedEmails(`${SUPPORT_EMAIL} me@example.com`)).toEqual(["me@example.com"]);
  });

  it("fails an address on the company domain that is not the support address", () => {
    expect(findDisallowedEmails("dtun@paperstreetapp.com")).toEqual(["dtun@paperstreetapp.com"]);
  });
});
