sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
  "use strict";

  return Controller.extend("onescanpicker.ui5.controller.Diagnostics", {
    onInit: function () {
      var oDiagModel = new JSONModel({
        mode: "mock",
        endpoint: "http://localhost:4004/odata/v4/one-scan-picker/",
        status: "Connected",
        latencyMs: 12,
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
      var oDiagModel = this.getView().getModel("diag");
      var nStart = Date.now();

      fetch("/odata/v4/one-scan-picker/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var nLatency = Date.now() - nStart;
          var result = data.value || data;
          if (oDiagModel && result) {
            oDiagModel.setData({
              mode: result.mode || "mock",
              endpoint: result.endpoint || "http://localhost:4004/odata/v4/one-scan-picker/",
              status: result.status || "Connected",
              latencyMs: nLatency,
              lastCheck: new Date().toLocaleTimeString()
            });
          }
          MessageToast.show("Diagnostic check completed in " + nLatency + "ms.");
        })
        .catch(function (err) {
          var nLatency = Date.now() - nStart;
          if (oDiagModel) {
            oDiagModel.setProperty("/status", "Offline / Error");
            oDiagModel.setProperty("/latencyMs", nLatency);
            oDiagModel.setProperty("/lastCheck", new Date().toLocaleTimeString());
          }
          MessageToast.show("Diagnostic check failed: " + err.message);
        });
    }
  });
});