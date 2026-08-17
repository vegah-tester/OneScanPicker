sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
  "use strict";

  return Controller.extend("onescanpicker.ui5.controller.Diagnostics", {
    onInit: function () {
      var oDiagModel = new JSONModel({
        mode: "mock",
        endpoint: "http://localhost:4004/odata/v4/one-scan-picker/",
        status: "Connected",
        destinationName: "LOCAL_MOCK_DESTINATION",
        destinationStatus: "Not Configured (Mock Mode)",
        ewmStatus: "Mock Mode (SQLite)",
        csrfStatus: "N/A (Mock Mode)",
        latencyMs: 8,
        details: "Local SQLite mock persistence layer.",
        lastCheck: new Date().toLocaleTimeString()
      });
      this.getView().setModel(oDiagModel, "diag");

      var oRouter = this.getOwnerComponent().getRouter();
      if (oRouter) {
        oRouter.getRoute("diagnostics").attachPatternMatched(this.onRunDiagnostic, this);
      }
      this.onRunDiagnostic();
    },

    onRunDiagnostic: function () {
      var that = this;
      var oPage = this.byId("diagnosticsPage");
      if (oPage) {
        oPage.setBusy(true);
      }

      var oDiagModel = this.getView().getModel("diag");
      var oDashboardModel = this.getOwnerComponent().getModel("dashboard");
      var nStart = Date.now();

      fetch("/odata/v4/one-scan-picker/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })
        .then(function (res) {
          if (!res.ok) {
            throw new Error("HTTP error " + res.status);
          }
          return res.json();
        })
        .then(function (data) {
          var nLatency = Date.now() - nStart;
          var result = data.value || data;
          var nFinalLatency = (result && result.latencyMs !== undefined) ? result.latencyMs : nLatency;

          if (oDiagModel && result) {
            oDiagModel.setData({
              mode: result.mode || "mock",
              endpoint: result.endpoint || "local-sqlite",
              status: result.status || "Connected",
              destinationName: result.destinationName || "LOCAL_MOCK_DESTINATION",
              destinationStatus: result.destinationStatus || "Not Configured (Mock Mode)",
              ewmStatus: result.ewmStatus || "Mock Mode (SQLite)",
              csrfStatus: result.csrfStatus || "N/A (Mock Mode)",
              details: result.details || "Connection established successfully.",
              latencyMs: nFinalLatency,
              lastCheck: new Date().toLocaleTimeString()
            });
          }

          if (oDashboardModel && result) {
            oDashboardModel.setProperty("/connectionStatus", result.status || "Connected");
            oDashboardModel.setProperty("/mode", result.mode || "mock");
            oDashboardModel.setProperty("/endpoint", result.endpoint || "local-sqlite");
          }

          MessageToast.show("Diagnostic check completed (" + nFinalLatency + " ms).");
        })
        .catch(function (err) {
          var nLatency = Date.now() - nStart;
          if (oDiagModel) {
            oDiagModel.setProperty("/status", "Offline / Error");
            oDiagModel.setProperty("/latencyMs", nLatency);
            oDiagModel.setProperty("/details", "Failed to contact CAP backend: " + err.message);
            oDiagModel.setProperty("/lastCheck", new Date().toLocaleTimeString());
          }
          MessageBox.error("Diagnostic check failed: " + err.message);
        })
        .finally(function () {
          if (oPage) {
            oPage.setBusy(false);
          }
        });
    }
  });
});