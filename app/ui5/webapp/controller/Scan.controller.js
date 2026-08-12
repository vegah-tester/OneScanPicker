sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
  "use strict";

  return Controller.extend("onescanpicker.ui5.controller.Scan", {
    onInit: function () {
      var oScanStateModel = new JSONModel({
        scanValue: "BIN-A01|MAT-1001|SER-1001|HU-9001",
        parsedBin: "",
        material: "",
        serialNumber: "",
        handlingUnit: "",
        parseMessage: "Ready to scan",
        isParsed: false,
        validationMessage: "Press '1. Validate Pick Data' to verify scan against active task parameters.",
        validationMessageType: "Information",
        canConfirm: false,
        activeTaskNumber: "WT1001",
        expectedMaterial: "MAT-1001",
        expectedSourceBin: "BIN-A01",
        expectedDestinationBin: "BIN-B01",
        expectedHU: "HU-9001",
        expectedSerial: "SER-1001"
      });

      this.getView().setModel(oScanStateModel, "scanState");

      var oRouter = this.getOwnerComponent().getRouter();
      if (oRouter) {
        oRouter.getRoute("scan").attachPatternMatched(this._onRouteMatched, this);
      }
    },

    _onRouteMatched: function () {
      var oAppState = this.getOwnerComponent().getModel("appState");
      var oSelectedTask = oAppState ? oAppState.getProperty("/selectedTask") : null;
      var oScanModel = this.getView().getModel("scanState");

      if (oSelectedTask && oScanModel) {
        oScanModel.setProperty("/activeTaskNumber", oSelectedTask.taskNumber || "WT1001");
        oScanModel.setProperty("/expectedMaterial", oSelectedTask.material || "MAT-1001");
        oScanModel.setProperty("/expectedSourceBin", oSelectedTask.sourceBin || "BIN-A01");
        oScanModel.setProperty("/expectedDestinationBin", oSelectedTask.destinationBin || "BIN-B01");
        oScanModel.setProperty("/expectedHU", oSelectedTask.handlingUnit || "HU-9001");
        oScanModel.setProperty("/expectedSerial", oSelectedTask.serialNumber || "SER-1001");

        // Set matching scan value preset by default for convenience
        var sDefaultScan = (oSelectedTask.sourceBin || "BIN-A01") + "|" +
                           (oSelectedTask.material || "MAT-1001") + "|" +
                           (oSelectedTask.serialNumber || "SER-1001") + "|" +
                           (oSelectedTask.handlingUnit || "HU-9001");
        oScanModel.setProperty("/scanValue", sDefaultScan);
      }
    },

    onParseScan: function () {
      var that = this;
      var oScanModel = this.getView().getModel("scanState");
      var sValue = oScanModel.getProperty("/scanValue");

      if (!sValue) {
        MessageToast.show("Please enter or scan a barcode payload.");
        return;
      }

      fetch("/odata/v4/one-scan-picker/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanValue: sValue })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var result = data.value || data;
          if (result) {
            oScanModel.setProperty("/parsedBin", result.parsedBin || "");
            oScanModel.setProperty("/material", result.material || "");
            oScanModel.setProperty("/serialNumber", result.serialNumber || "");
            oScanModel.setProperty("/handlingUnit", result.handlingUnit || "");
            oScanModel.setProperty("/parseMessage", result.message || "Parsed");
            oScanModel.setProperty("/isParsed", result.isValid || false);
            MessageToast.show("Scan string parsed successfully.");
          }
        })
        .catch(function (err) {
          MessageBox.error("Failed to parse scan string: " + err.message);
        });
    },

    onClearScan: function () {
      var oScanModel = this.getView().getModel("scanState");
      oScanModel.setProperty("/scanValue", "");
      oScanModel.setProperty("/parsedBin", "");
      oScanModel.setProperty("/material", "");
      oScanModel.setProperty("/serialNumber", "");
      oScanModel.setProperty("/handlingUnit", "");
      oScanModel.setProperty("/parseMessage", "Scan cleared");
      oScanModel.setProperty("/isParsed", false);
      oScanModel.setProperty("/validationMessage", "Scan cleared. Enter or scan new payload.");
      oScanModel.setProperty("/validationMessageType", "Information");
      oScanModel.setProperty("/canConfirm", false);
    },

    onApplyPreset: function (oEvent) {
      var sButtonText = oEvent.getSource().getText();
      var oScanModel = this.getView().getModel("scanState");

      if (sButtonText.indexOf("WT1001") !== -1) {
        oScanModel.setProperty("/scanValue", "BIN-A01|MAT-1001|SER-1001|HU-9001");
      } else if (sButtonText.indexOf("WT1003") !== -1) {
        oScanModel.setProperty("/scanValue", "BIN-A03|MAT-1003|SER-1003|HU-9003");
      } else {
        oScanModel.setProperty("/scanValue", "INVALID-BIN|MAT-9999|SER-0000|HU-0000");
      }
      this.onParseScan();
    },

    onValidatePick: function () {
      var that = this;
      var oScanModel = this.getView().getModel("scanState");

      if (!oScanModel.getProperty("/parsedBin") && !oScanModel.getProperty("/material")) {
        this.onParseScan();
      }

      var payload = {
        taskNumber: oScanModel.getProperty("/activeTaskNumber"),
        material: oScanModel.getProperty("/material") || oScanModel.getProperty("/expectedMaterial"),
        sourceBin: oScanModel.getProperty("/parsedBin") || oScanModel.getProperty("/expectedSourceBin"),
        destinationBin: oScanModel.getProperty("/expectedDestinationBin"),
        handlingUnit: oScanModel.getProperty("/handlingUnit") || oScanModel.getProperty("/expectedHU"),
        serialNumber: oScanModel.getProperty("/serialNumber") || oScanModel.getProperty("/expectedSerial")
      };

      fetch("/odata/v4/one-scan-picker/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var result = data.value || data;
          if (result && result.isValid) {
            oScanModel.setProperty("/validationMessage", "Validation Passed: All scan parameters match active task " + payload.taskNumber + "!");
            oScanModel.setProperty("/validationMessageType", "Success");
            oScanModel.setProperty("/canConfirm", true);
            MessageToast.show("Pick validation passed!");
          } else {
            oScanModel.setProperty("/validationMessage", "Validation Warning: " + ((result && result.message) || "Discrepancy detected in pick payload."));
            oScanModel.setProperty("/validationMessageType", "Warning");
            oScanModel.setProperty("/canConfirm", false);
          }
        })
        .catch(function (err) {
          MessageBox.error("Validation service error: " + err.message);
        });
    },

    onConfirmTask: function () {
      var that = this;
      var oScanModel = this.getView().getModel("scanState");
      var sTaskNumber = oScanModel.getProperty("/activeTaskNumber");

      fetch("/odata/v4/one-scan-picker/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskNumber: sTaskNumber })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var result = data.value || data;
          if (result && result.success) {
            MessageBox.success("Warehouse Task " + sTaskNumber + " confirmed successfully in system!", {
              onClose: function () {
                that.getOwnerComponent().getRouter().navTo("taskList");
              }
            });
          } else {
            MessageBox.error((result && result.message) || "Failed to confirm warehouse task.");
          }
        })
        .catch(function (err) {
          MessageBox.error("Confirmation network error: " + err.message);
        });
    },

    onGoToTasks: function () {
      this.getOwnerComponent().getRouter().navTo("taskList");
    },

    onSelectTask: function () {
      this.getOwnerComponent().getRouter().navTo("taskList");
    }
  });
});