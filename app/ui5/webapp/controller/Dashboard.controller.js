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
      }
      this.loadDashboardData();
    },

    onRefresh: function () {
      this.loadDashboardData();
      MessageToast.show("Dashboard metrics updated.");
    },

    loadDashboardData: function () {
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
              endpoint: item.endpoint || "local-sqlite"
            });
          }
        })
        .catch(function (err) {
          console.warn("Could not fetch OData live summary, falling back to local model state:", err);
          if (window.__ONESCAN_DASHBOARD_DATA__ && oDashboardModel) {
            oDashboardModel.setData(window.__ONESCAN_DASHBOARD_DATA__);
          }
        });
    },

    onGoToTasks: function () {
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