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
        oRouter.getRoute("taskList").attachPatternMatched(this._onRouteMatched, this);
      }
    },

    _onRouteMatched: function () {
      var oAppState = this.getOwnerComponent().getModel("appState");
      var sInitialFilter = oAppState ? oAppState.getProperty("/initialStatusFilter") : null;

      var oSelect = this.byId("statusFilterSelect");
      if (oSelect) {
        if (sInitialFilter) {
          oSelect.setSelectedKey(sInitialFilter);
          if (oAppState) {
            oAppState.setProperty("/initialStatusFilter", null);
          }
        }
      }

      this._applyFilters();
    },

    onRefresh: function () {
      var oTable = this.byId("tasksTable");
      if (oTable && oTable.getBinding("items")) {
        oTable.getBinding("items").refresh();
        MessageToast.show("Warehouse tasks refreshed.");
      }
    },

    onSearch: function () {
      this._applyFilters();
    },

    onFilterChange: function () {
      this._applyFilters();
    },

    _applyFilters: function () {
      var aFilters = [];
      var oSearchField = this.byId("taskSearchField");
      var sQuery = oSearchField ? oSearchField.getValue() : "";
      var oSelect = this.byId("statusFilterSelect");
      var sStatusKey = oSelect ? oSelect.getSelectedKey() : "ALL";

      if (sQuery && sQuery.trim().length > 0) {
        var sTrimmed = sQuery.trim();
        var aSearchFilters = [
          new Filter("taskNumber", FilterOperator.Contains, sTrimmed),
          new Filter("material", FilterOperator.Contains, sTrimmed),
          new Filter("sourceBin", FilterOperator.Contains, sTrimmed),
          new Filter("destinationBin", FilterOperator.Contains, sTrimmed),
          new Filter("handlingUnit", FilterOperator.Contains, sTrimmed),
          new Filter("serialNumber", FilterOperator.Contains, sTrimmed)
        ];
        aFilters.push(new Filter({ filters: aSearchFilters, and: false }));
      }

      if (sStatusKey && sStatusKey !== "ALL") {
        aFilters.push(new Filter("status", FilterOperator.EQ, sStatusKey));
      }

      var oTable = this.byId("tasksTable");
      if (oTable) {
        var oBinding = oTable.getBinding("items");
        if (oBinding) {
          oBinding.filter(aFilters);
        }
      }
    },

    onTaskPress: function (oEvent) {
      var oItem = oEvent.getSource();
      var oContext = oItem.getBindingContext();
      if (oContext) {
        var sTaskNumber = oContext.getProperty("taskNumber") || oContext.getProperty("ID");
        this.getOwnerComponent().getRouter().navTo("taskDetails", {
          taskId: sTaskNumber
        });
      }
    },

    onTaskSelect: function (oEvent) {
      var oItem = oEvent.getParameter("listItem");
      if (oItem) {
        var oContext = oItem.getBindingContext();
        if (oContext) {
          var sTaskNumber = oContext.getProperty("taskNumber") || oContext.getProperty("ID");
          this.getOwnerComponent().getRouter().navTo("taskDetails", {
            taskId: sTaskNumber
          });
        }
      }
    },

    onScanTask: function (oEvent) {
      var oButton = oEvent.getSource();
      var oItem = oButton.getParent().getParent();
      var oContext = oItem.getBindingContext();
      if (oContext) {
        var oTaskData = oContext.getObject();
        var oAppState = this.getOwnerComponent().getModel("appState");
        if (oAppState) {
          oAppState.setProperty("/selectedTask", oTaskData);
        }
        MessageToast.show("Selected Task " + oTaskData.taskNumber + " for 1-Scan verification.");
        this.getOwnerComponent().getRouter().navTo("scan");
      }
    },

    onGoToGenericScan: function () {
      this.getOwnerComponent().getRouter().navTo("scan");
    }
  });
});
