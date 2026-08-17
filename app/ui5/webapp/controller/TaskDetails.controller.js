sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
  "use strict";

  return Controller.extend("onescanpicker.ui5.controller.TaskDetails", {
    onInit: function () {
      var oDetailModel = new JSONModel({
        taskNumber: "",
        material: "",
        sourceBin: "",
        destinationBin: "",
        handlingUnit: "",
        serialNumber: "",
        status: "Open"
      });
      this.getView().setModel(oDetailModel, "detail");

      var oRouter = this.getOwnerComponent().getRouter();
      if (oRouter) {
        oRouter.getRoute("taskDetails").attachPatternMatched(this._onRouteMatched, this);
      }
    },

    _onRouteMatched: function (oEvent) {
      var sTaskId = oEvent.getParameter("arguments").taskId;
      this._sCurrentTaskId = sTaskId;
      this._loadTask(sTaskId);
    },

    onRefresh: function () {
      if (this._sCurrentTaskId) {
        this._loadTask(this._sCurrentTaskId);
        MessageToast.show("Task details reloaded.");
      }
    },

    _loadTask: function (sTaskId) {
      var that = this;
      var oPage = this.byId("taskDetailsPage");
      if (oPage) {
        oPage.setBusy(true);
      }

      var oDetailModel = this.getView().getModel("detail");

      fetch("/odata/v4/one-scan-picker/Tasks")
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var aTasks = data.value || [];
          var oTask = aTasks.find(function (t) {
            return String(t.taskNumber || "").toUpperCase() === String(sTaskId || "").toUpperCase() ||
                   String(t.ID || "") === String(sTaskId || "");
          });

          if (oTask) {
            oDetailModel.setData(oTask);
          } else {
            MessageBox.warning("Warehouse Task '" + sTaskId + "' not found in active list.", {
              onClose: function () {
                that.onNavBack();
              }
            });
          }
        })
        .catch(function (err) {
          console.error("Failed to load task details:", err);
          MessageToast.show("Error loading task details: " + err.message);
        })
        .finally(function () {
          if (oPage) {
            oPage.setBusy(false);
          }
        });
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("taskList");
    },

    onGoToScan: function () {
      var oTaskData = this.getView().getModel("detail").getData();
      var oAppState = this.getOwnerComponent().getModel("appState");
      if (oAppState && oTaskData) {
        oAppState.setProperty("/selectedTask", oTaskData);
      }
      this.getOwnerComponent().getRouter().navTo("scan");
    },

    onConfirmTask: function () {
      var that = this;
      var oTaskData = this.getView().getModel("detail").getData();
      if (!oTaskData || !oTaskData.taskNumber) {
        MessageToast.show("No task loaded.");
        return;
      }

      MessageBox.confirm("Confirm picking and warehouse transfer for Task " + oTaskData.taskNumber + "?", {
        title: "Confirm Warehouse Pick",
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        emphasizedAction: MessageBox.Action.YES,
        onClose: function (sAction) {
          if (sAction !== MessageBox.Action.YES) {
            return;
          }

          var oPage = that.byId("taskDetailsPage");
          if (oPage) {
            oPage.setBusy(true);
          }

          fetch("/odata/v4/one-scan-picker/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskNumber: oTaskData.taskNumber })
          })
            .then(function (res) { return res.json(); })
            .then(function (resData) {
              var result = resData.value || resData;
              if (result && result.success) {
                MessageBox.success("Task " + oTaskData.taskNumber + " confirmed successfully!", {
                  onClose: function () {
                    that._loadTask(oTaskData.taskNumber);
                  }
                });
              } else {
                MessageBox.error((result && result.message) || "Confirmation failed.");
              }
            })
            .catch(function (err) {
              MessageBox.error("Network error during confirmation: " + err.message);
            })
            .finally(function () {
              if (oPage) {
                oPage.setBusy(false);
              }
            });
        }
      });
    }
  });
});