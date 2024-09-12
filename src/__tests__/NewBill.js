/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.getAttribute("class")).toBe("active-icon");
    });
  });
  describe("When I select a file to transfer", () => {
    test("Input file length should show be equal to 1", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const file = new File(["hello"], "hello.png", { type: "image/png" });
      const handleFileInputChange = jest.fn((e) => newBill.handleChangeFile(e));
      await waitFor(() => screen.getByTestId("file"));
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleFileInputChange);
      userEvent.upload(inputFile, file);
      expect(inputFile.files).toHaveLength(1);
    });
  });
  describe("When I submit new bill form with success", () => {
    test("I should see bills page with my new bill with pending status", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      await waitFor(() => screen.getByTestId("form-new-bill"));
      const formNewBill = screen.getByTestId("form-new-bill");

      const expenseType = screen.getByTestId("expense-type");
      fireEvent.change(expenseType, { target: { value: "Fournitures de bureau" } });
      expect(expenseType.value).toBe("Fournitures de bureau");

      const expenseName = screen.getByTestId("expense-name");
      fireEvent.change(expenseName, { target: { value: "ordinateur" } });
      expect(expenseName.value).toBe("ordinateur");

      const expenseDate = screen.getByTestId("datepicker");
      fireEvent.change(expenseDate, { target: { value: "2024-09-15" } });
      expect(expenseDate.value).toBe("2024-09-15");

      const expenseAmount = screen.getByTestId("amount");
      fireEvent.change(expenseAmount, { target: { value: "350" } });
      expect(expenseAmount.value).toBe("350");

      const expenseVat = screen.getByTestId("vat");
      fireEvent.change(expenseVat, { target: { value: "70" } });
      expect(expenseVat.value).toBe("70");

      const expensePct = screen.getByTestId("pct");
      fireEvent.change(expensePct, { target: { value: "20" } });
      expect(expensePct.value).toBe("20");

      const commentary = screen.getByTestId("commentary");
      fireEvent.change(commentary, { target: { value: "Bla bla bla" } });
      expect(commentary.value).toBe("Bla bla bla");

      const file = new File(["hello"], "hello.png", { type: "image/png" });
      const inputFile = screen.getByTestId("file");
      userEvent.upload(inputFile, file);
      expect(inputFile.files).toHaveLength(1);

      const submitNewBill = jest.fn((e) => newBill.handleSubmit(e));
      formNewBill.addEventListener("submit", submitNewBill);
      fireEvent.submit(formNewBill);
      expect(submitNewBill).toHaveBeenCalled();
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
  });
});
