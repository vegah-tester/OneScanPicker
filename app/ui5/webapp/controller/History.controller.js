sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
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
      }
    },

    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("query") || this.byId("historySearchField").getValue();
      var aFilters = [];

      if (sQuery && sQuery.length > 0) {
        var aSearchFilters = [
          new Filter("scanValue", FilterOperator.Contains, sQuery),
          new Filter("parsedBin", FilterOperator.Contains, sQuery),
          new Filter("material", FilterOperator.Contains, sQuery),
          new Filter("message", FilterOperator.Contains, sQuery)
        ];
        aFilters.push(new Filter({ filters: aSearchFilters, AND: false }));
      }

      var oTable = this.byId("historyTable");
      var oBinding = oTable.getBinding("items");
      if (oBinding) {
        oBinding.filter(aFilters);
      }
    }
  });
});