sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Text",
  "sap/m/VBox",
  "sap/m/HBox",
  "sap/m/Title",
  "sap/m/ObjectStatus"
], function (Controller, Dialog, Button, Text, VBox, HBox, Title, ObjectStatus) {
  "use strict";

  return Controller.extend("onescanpicker.ui5.controller.App", {
    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      if (oRouter) {
        oRouter.attachRouteMatched(this.onRouteMatched, this);
      }
    },

    onRouteMatched: function (oEvent) {
      var sRouteName = oEvent.getParameter("name");
      var oAppState = this.getOwnerComponent().getModel("appState");
      if (!oAppState) {
        return;
      }

      var sKey = "dashboard";
      if (sRouteName === "dashboard" || sRouteName === "dashboardExplicit") {
        sKey = "dashboard";
      } else if (sRouteName === "taskList" || sRouteName === "taskDetails") {
        sKey = "taskList";
      } else if (sRouteName === "scan") {
        sKey = "scan";
      } else if (sRouteName === "history") {
        sKey = "history";
      } else if (sRouteName === "diagnostics") {
        sKey = "diagnostics";
      }

      oAppState.setProperty("/selectedRoute", sKey);
    },

    onSideNavButtonPress: function () {
      var oToolPage = this.byId("toolPage");
      if (oToolPage) {
        oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
      }
    },

    onItemSelect: function (oEvent) {
      var oItem = oEvent.getParameter("item");
      var sKey = oItem ? oItem.getKey() : null;
      if (sKey) {
        this.getOwnerComponent().getRouter().navTo(sKey);
      }
    },

    onHelpPress: function () {
      var oDashboardModel = this.getOwnerComponent().getModel("dashboard");
      var sMode = oDashboardModel ? oDashboardModel.getProperty("/mode") : "mock";
      var sStatus = oDashboardModel ? oDashboardModel.getProperty("/connectionStatus") : "Connected";

      var oDialog = new Dialog({
        title: "About OneScanPicker",
        contentWidth: "460px",
        content: new VBox({
          class: "sapUiSmallMargin",
          items: [
            new Title({ text: "OneScan Intelligent Picking & Verification", level: "H3", class: "sapUiTinyMarginBottom" }),
            new Text({ text: "Enterprise SAP EWM barcode picking application built with SAP CAP (Node.js) and SAPUI5/Fiori.", class: "sapUiSmallMarginBottom" }),
            new HBox({
              alignItems: "Center",
              class: "sapUiTinyMarginBottom",
              items: [
                new Text({ text: "Architecture Mode: ", class: "sapUiTinyMarginEnd" }),
                new ObjectStatus({ text: sMode.toUpperCase(), state: sMode === "mock" ? "Information" : "Success" })
              ]
            }),
            new HBox({
              alignItems: "Center",
              class: "sapUiTinyMarginBottom",
              items: [
                new Text({ text: "Connectivity Status: ", class: "sapUiTinyMarginEnd" }),
                new ObjectStatus({ text: sStatus, state: sStatus === "Connected" ? "Success" : "Error" })
              ]
            }),
            new Text({ text: "Version: 0.4.0 (Milestone 3)", class: "sapUiTinyMarginTop" })
          ]
        }),
        beginButton: new Button({
          text: "Close",
          type: "Emphasized",
          press: function () {
            oDialog.close();
            oDialog.destroy();
          }
        })
      });

      this.getView().addDependent(oDialog);
      oDialog.open();
    }
  });
});