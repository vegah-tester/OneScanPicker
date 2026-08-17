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
        parseMessage: "Ready for scan input",
        isParsed: false,
        validationMessage: "Scan barcode or apply a demo preset to validate pick parameters.",
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

        var sPreset = (oSelectedTask.sourceBin || "BIN-A01") + "|" +
                      (oSelectedTask.material || "MAT-1001") + "|" +
                      (oSelectedTask.serialNumber || "SER-1001") + "|" +
                      (oSelectedTask.handlingUnit || "HU-9001");
        oScanModel.setProperty("/scanValue", sPreset);
      }
    },

    onParseAndValidate: function () {
      var that = this;
      var oScanModel = this.getView().getModel("scanState");
      var sValue = oScanModel.getProperty("/scanValue");

      if (!sValue || sValue.trim().length === 0) {
        MessageToast.show("Please enter or scan a barcode payload.");
        return;
      }

      var oPage = this.byId("scanPage");
      if (oPage) {
        oPage.setBusy(true);
      }

      fetch("/odata/v4/one-scan-picker/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanValue: sValue.trim() })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var result = data.value || data;
          if (result) {
            oScanModel.setProperty("/parsedBin", result.parsedBin || "");
            oScanModel.setProperty("/material", result.material || "");
            oScanModel.setProperty("/serialNumber", result.serialNumber || "");
            oScanModel.setProperty("/handlingUnit", result.handlingUnit || "");
            oScanModel.setProperty("/parseMessage", result.message || "Parsed successfully");
            oScanModel.setProperty("/isParsed", result.isValid || false);

            that._executeValidation(result);
          }
        })
        .catch(function (err) {
          MessageBox.error("Decoder error: " + err.message);
          if (oPage) {
            oPage.setBusy(false);
          }
        });
    },

    _executeValidation: function (parsedData) {
      var that = this;
      var oScanModel = this.getView().getModel("scanState");
      var oPage = this.byId("scanPage");

      var payload = {
        taskNumber: oScanModel.getProperty("/activeTaskNumber"),
        material: parsedData.material || oScanModel.getProperty("/expectedMaterial"),
        sourceBin: parsedData.parsedBin || oScanModel.getProperty("/expectedSourceBin"),
        destinationBin: oScanModel.getProperty("/expectedDestinationBin"),
        handlingUnit: parsedData.handlingUnit || oScanModel.getProperty("/expectedHU"),
        serialNumber: parsedData.serialNumber || oScanModel.getProperty("/expectedSerial")
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
            oScanModel.setProperty("/validationMessage", "Verification PASSED: Scanned Bin, SKU, Serial, and HU match Task " + payload.taskNumber + "!");
            oScanModel.setProperty("/validationMessageType", "Success");
            oScanModel.setProperty("/canConfirm", true);
            MessageToast.show("Scan verified successfully!");
          } else {
            oScanModel.setProperty("/validationMessage", "Verification FAILED: " + ((result && result.message) || "Discrepancy detected in scanned parameters."));
            oScanModel.setProperty("/validationMessageType", "Error");
            oScanModel.setProperty("/canConfirm", false);
          }
        })
        .catch(function (err) {
          oScanModel.setProperty("/validationMessage", "Validation service error: " + err.message);
          oScanModel.setProperty("/validationMessageType", "Warning");
          oScanModel.setProperty("/canConfirm", false);
        })
        .finally(function () {
          if (oPage) {
            oPage.setBusy(false);
          }
        });
    },

    onValidatePick: function () {
      this.onParseAndValidate();
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
      oScanModel.setProperty("/validationMessage", "Scan cleared. Enter or scan new 1-Scan barcode.");
      oScanModel.setProperty("/validationMessageType", "Information");
      oScanModel.setProperty("/canConfirm", false);
      MessageToast.show("Scan input cleared.");
    },

    onApplyPreset: function (oEvent) {
      var sButtonText = oEvent.getSource().getText();
      var oScanModel = this.getView().getModel("scanState");

      if (sButtonText.indexOf("WT1001") !== -1) {
        oScanModel.setProperty("/activeTaskNumber", "WT1001");
        oScanModel.setProperty("/expectedMaterial", "MAT-1001");
        oScanModel.setProperty("/expectedSourceBin", "BIN-A01");
        oScanModel.setProperty("/expectedDestinationBin", "BIN-B01");
        oScanModel.setProperty("/expectedHU", "HU-9001");
        oScanModel.setProperty("/expectedSerial", "SER-1001");
        oScanModel.setProperty("/scanValue", "BIN-A01|MAT-1001|SER-1001|HU-9001");
      } else if (sButtonText.indexOf("WT1003") !== -1) {
        oScanModel.setProperty("/activeTaskNumber", "WT1003");
        oScanModel.setProperty("/expectedMaterial", "MAT-1003");
        oScanModel.setProperty("/expectedSourceBin", "BIN-A03");
        oScanModel.setProperty("/expectedDestinationBin", "BIN-B03");
        oScanModel.setProperty("/expectedHU", "HU-9003");
        oScanModel.setProperty("/expectedSerial", "SER-1003");
        oScanModel.setProperty("/scanValue", "BIN-A03|MAT-1003|SER-1003|HU-9003");
      } else {
        oScanModel.setProperty("/scanValue", "BIN-WRONG|MAT-UNKNOWN|SER-0000|HU-9999");
      }

      this.onParseAndValidate();
    },

    onConfirmTask: function () {
      var that = this;
      var oScanModel = this.getView().getModel("scanState");
      var sTaskNumber = oScanModel.getProperty("/activeTaskNumber");
      var oPage = this.byId("scanPage");

      if (oPage) {
        oPage.setBusy(true);
      }

      fetch("/odata/v4/one-scan-picker/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskNumber: sTaskNumber })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var result = data.value || data;
          if (result && result.success) {
            MessageBox.success("Warehouse Task " + sTaskNumber + " pick confirmed and posted successfully!", {
              actions: ["View All Tasks", "Pick Next Task"],
              emphasizedAction: "View All Tasks",
              onClose: function (sAction) {
                if (sAction === "View All Tasks") {
                  that.getOwnerComponent().getRouter().navTo("taskList");
                } else {
                  that.onClearScan();
                }
              }
            });
          } else {
            MessageBox.error((result && result.message) || "Failed to confirm warehouse task.");
          }
        })
        .catch(function (err) {
          MessageBox.error("Confirmation error: " + err.message);
        })
        .finally(function () {
          if (oPage) {
            oPage.setBusy(false);
          }
        });
    },

    onSelectTask: function () {
      this.getOwnerComponent().getRouter().navTo("taskList");
    }
  });
});