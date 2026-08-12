sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("onescanpicker.ui5.controller.App", {
    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.attachRouteMatched(this.onRouteMatched, this);
    },

    onRouteMatched: function (oEvent) {
      var sRouteName = oEvent.getParameter("name");
      var oAppState = this.getOwnerComponent().getModel("appState");
      if (oAppState) {
        oAppState.setProperty("/selectedRoute", sRouteName);
      }
    },

    onSideNavButtonPress: function () {
      var oToolPage = this.byId("toolPage");
      oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
    },

    onItemSelect: function (oEvent) {
      var oItem = oEvent.getParameter("item");
      var sKey = oItem.getKey();
      if (sKey) {
        this.getOwnerComponent().getRouter().navTo(sKey);
      }
    },

    onHelpPress: function () {
      MessageToast.show("OneScan Intelligent Picking v0.1.0 - Local Mock Mode");
    }
  });
});