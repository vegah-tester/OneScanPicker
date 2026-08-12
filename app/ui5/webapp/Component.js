sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("onescanpicker.ui5.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);

      const dashboardModel = new JSONModel({
        openTasks: 0,
        confirmedTasks: 0,
        failedTasks: 0,
        connectionStatus: "Connected",
        mode: "mock",
        endpoint: "local-sqlite"
      });
      this.setModel(dashboardModel, "dashboard");

      const appStateModel = new JSONModel({
        selectedRoute: "dashboard",
        selectedTask: null
      });
      this.setModel(appStateModel, "appState");

      if (window.__ONESCAN_DASHBOARD_DATA__) {
        dashboardModel.setData(window.__ONESCAN_DASHBOARD_DATA__);
      }

      this.getRouter().initialize();
    }
  });
});