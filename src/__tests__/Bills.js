/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import $ from "jquery";
$.fn.modal = jest.fn();

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //[Ajout de tests unitaires et d'intégration]
      //composant views/Bills : [...] il manque la mention “expect”. Ajoute cette mention pour que le test vérifie bien ce que l’on attend de lui.
      expect(windowIcon.getAttribute("class")).toBe("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByTestId("date").map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    test("Then clicking on add bill button should redirect to add bill page", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const billsInstance = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });

      const handleShowAddBill = jest.fn((e) => billsInstance.handleClickNewBill());
      await waitFor(() => screen.getByTestId("btn-new-bill"));
      const button = screen.getByTestId("btn-new-bill");
      button.addEventListener("click", handleShowAddBill);
      userEvent.click(button);
      await waitFor(() => screen.getByText("Envoyer une note de frais"));
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
    test("Then clicking on eye icon should show modal", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const billsInstance = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });
      await waitFor(() => screen.getAllByTestId("icon-eye"));

      const handleClickIconEye = jest.fn((icon) =>
        billsInstance.handleClickIconEye(icon)
      );

      const iconEye = screen.getAllByTestId("icon-eye")[0];
      iconEye.addEventListener("click", () => handleClickIconEye(iconEye));
      userEvent.click(iconEye);
      expect(handleClickIconEye).toHaveBeenCalled();

      const modale = screen.getByTestId("modal-employee");
      expect(modale).toBeTruthy();
    });
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const rows = await screen.getAllByTestId("bill-row");
      expect(rows).toBeTruthy();
    });
  });
});
