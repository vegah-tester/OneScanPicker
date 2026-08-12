sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, MessageToast) {
  "use strict";

  return Controller.extend("onescanpicker.ui5.controller.TaskList", {
    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      if (oRouter) {
        oRouter.getRoute("taskList").attachPatternMatched(this.onRefresh, this);
      }
    },

    onRefresh: function () {
      var oTable = this.byId("tasksTable");
      if (oTable && oTable.getBinding("items")) {
        oTable.getBinding("items").refresh();
      }
    },

    onSearch: function (oEvent) {
      this._applyFilters();
    },

    onFilterChange: function (oEvent) {
      this._applyFilters();
    },

    _applyFilters: function () {
      var aFilters = [];
      var sQuery = this.byId("taskSearchField").getValue();
      var sStatusKey = this.byId("statusFilterSelect").getSelectedKey();

      if (sQuery && sQuery.length > 0) {
        var aSearchFilters = [
          new Filter("taskNumber", FilterOperator.Contains, sQuery),
          new Filter("material", FilterOperator.Contains, sQuery),
          new Filter("sourceBin", FilterOperator.Contains, sQuery),
          new Filter("destinationBin", FilterOperator.Contains, sQuery)
        ];
        aFilters.push(new Filter({ filters: aSearchFilters, AND: false }));
      }

      if (sStatusKey && sStatusKey !== "ALL") {
        aFilters.push(new Filter("status", FilterOperator.EQ, sStatusKey));
      }

      var oTable = this.byId("tasksTable");
      var oBinding = oTable.getBinding("items");
      if (oBinding) {
        oBinding.filter(aFilters);
      }
    },

    onTaskPress: function (oEvent) {
      var oItem = oEvent.getSource();
      var oContext = oItem.getBindingContext();
      if (oContext) {
        var sTaskNumber = oContext.getProperty("taskNumber");
        this.getOwnerComponent().getRouter().navTo("taskDetails", {
          taskId: sTaskNumber
        });
      }
    },

    onScanTask: function (oEvent) {
      var oItem = oEvent.getSource().getParent().getParent();
      var oContext = oItem.getBindingContext();
      if (oContext) {
        var oTaskData = oContext.getObject();
        var oAppState = this.getOwnerComponent().getModel("appState");
        if (oAppState) {
          oAppState.setProperty("/selectedTask", oTaskData);
        }
        MessageToast.show("Selected " + oTaskData.taskNumber + " for scanning.");
        this.getOwnerComponent().getRouter().navTo("scan");
      }
    }
  });
});
