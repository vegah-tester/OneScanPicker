sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("onescanpicker.ui5.controller.Dashboard", {
    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      if (oRouter) {
        oRouter.getRoute("dashboard").attachPatternMatched(this.loadDashboardData, this);
        oRouter.getRoute("dashboardExplicit").attachPatternMatched(this.loadDashboardData, this);
      }
      this.loadDashboardData();
    },

    onRefresh: function () {
      this.loadDashboardData();
      MessageToast.show("Dashboard metrics updated.");
    },

    loadDashboardData: function () {
      var oPage = this.byId("dashboardPage");
      if (oPage) {
        oPage.setBusy(true);
      }

      var oComponent = this.getOwnerComponent();
      var oDashboardModel = oComponent ? oComponent.getModel("dashboard") : null;

      fetch("/odata/v4/one-scan-picker/DashboardSummary")
        .then(function (response) {
          if (!response.ok) {
            throw new Error("HTTP error " + response.status);
          }
          return response.json();
        })
        .then(function (data) {
          var item = (data.value && data.value[0]) ? data.value[0] : data;
          if (oDashboardModel && item) {
            oDashboardModel.setData({
              openTasks: item.openTasks || 0,
              confirmedTasks: item.confirmedTasks || 0,
              failedTasks: item.failedTasks || 0,
              connectionStatus: item.connectionStatus || "Connected",
              mode: item.mode || "mock",
              endpoint: item.endpoint || "local-sqlite",
              lastCheck: new Date().toLocaleTimeString()
            });
          }
        })
        .catch(function (err) {
          console.warn("Could not fetch live OData summary, using fallback state:", err);
          if (window.__ONESCAN_DASHBOARD_DATA__ && oDashboardModel) {
            var fallback = window.__ONESCAN_DASHBOARD_DATA__;
            fallback.lastCheck = new Date().toLocaleTimeString();
            oDashboardModel.setData(fallback);
          }
        })
        .finally(function () {
          if (oPage) {
            oPage.setBusy(false);
          }
        });
    },

    onGoToOpenTasks: function () {
      var oAppState = this.getOwnerComponent().getModel("appState");
      if (oAppState) {
        oAppState.setProperty("/initialStatusFilter", "Open");
      }
      this.getOwnerComponent().getRouter().navTo("taskList");
    },

    onGoToConfirmedTasks: function () {
      var oAppState = this.getOwnerComponent().getModel("appState");
      if (oAppState) {
        oAppState.setProperty("/initialStatusFilter", "Confirmed");
      }
      this.getOwnerComponent().getRouter().navTo("taskList");
    },

    onGoToFailedTasks: function () {
      var oAppState = this.getOwnerComponent().getModel("appState");
      if (oAppState) {
        oAppState.setProperty("/initialStatusFilter", "Failed");
      }
      this.getOwnerComponent().getRouter().navTo("taskList");
    },

    onGoToTasks: function () {
      var oAppState = this.getOwnerComponent().getModel("appState");
      if (oAppState) {
        oAppState.setProperty("/initialStatusFilter", "ALL");
      }
      this.getOwnerComponent().getRouter().navTo("taskList");
    },

    onGoToScan: function () {
      this.getOwnerComponent().getRouter().navTo("scan");
    },

    onGoToHistory: function () {
      this.getOwnerComponent().getRouter().navTo("history");
    },

    onGoToDiagnostics: function () {
      this.getOwnerComponent().getRouter().navTo("diagnostics");
    }
  });
});