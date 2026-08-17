sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, MessageToast) {
  "use strict";

  return Controller.extend("onescanpicker.ui5.controller.History", {
    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      if (oRouter) {
        oRouter.getRoute("history").attachPatternMatched(this.onRefresh, this);
      }
    },

    onRefresh: function () {
      var oTable = this.byId("historyTable");
      if (oTable && oTable.getBinding("items")) {
        oTable.getBinding("items").refresh();
        MessageToast.show("Pick scan history refreshed.");
      }
    },

    onSearch: function (oEvent) {
      var oSearchField = this.byId("historySearchField");
      var sQuery = oEvent.getParameter("query") || (oSearchField ? oSearchField.getValue() : "");
      var aFilters = [];

      if (sQuery && sQuery.trim().length > 0) {
        var sTrimmed = sQuery.trim();
        var aSearchFilters = [
          new Filter("scanValue", FilterOperator.Contains, sTrimmed),
          new Filter("parsedBin", FilterOperator.Contains, sTrimmed),
          new Filter("material", FilterOperator.Contains, sTrimmed),
          new Filter("handlingUnit", FilterOperator.Contains, sTrimmed),
          new Filter("serialNumber", FilterOperator.Contains, sTrimmed),
          new Filter("message", FilterOperator.Contains, sTrimmed)
        ];
        aFilters.push(new Filter({ filters: aSearchFilters, and: false }));
      }

      var oTable = this.byId("historyTable");
      if (oTable) {
        var oBinding = oTable.getBinding("items");
        if (oBinding) {
          oBinding.filter(aFilters);
        }
      }
    }
  });
});