sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
  "use strict";

  return Controller.extend("onescanpicker.ui5.controller.TaskDetails", {
    onInit: function () {
      var oDetailModel = new JSONModel({});
      this.getView().setModel(oDetailModel, "detail");

      var oRouter = this.getOwnerComponent().getRouter();
      if (oRouter) {
        oRouter.getRoute("taskDetails").attachPatternMatched(this._onRouteMatched, this);
      }
    },

    _onRouteMatched: function (oEvent) {
      var sTaskId = oEvent.getParameter("arguments").taskId;
      this._loadTask(sTaskId);
    },

    _loadTask: function (sTaskId) {
      var that = this;
      var oDetailModel = this.getView().getModel("detail");

      fetch("/odata/v4/one-scan-picker/Tasks")
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var aTasks = data.value || [];
          var oTask = aTasks.find(function (t) { return t.taskNumber === sTaskId || t.ID === sTaskId; });
          if (oTask) {
            oDetailModel.setData(oTask);
          } else {
            MessageToast.show("Task " + sTaskId + " not found.");
          }
        })
        .catch(function (err) {
          console.error("Failed to load task details:", err);
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

      fetch("/odata/v4/one-scan-picker/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskNumber: oTaskData.taskNumber })
      })
        .then(function (res) { return res.json(); })
        .then(function (resData) {
          var result = resData.value || resData;
          if (result && result.success) {
            MessageBox.success("Task " + oTaskData.taskNumber + " confirmed successfully!");
            that._loadTask(oTaskData.taskNumber);
          } else {
            MessageBox.error((result && result.message) || "Confirmation failed.");
          }
        })
        .catch(function (err) {
          MessageBox.error("Network error during confirmation: " + err.message);
        });
    }
  });
});