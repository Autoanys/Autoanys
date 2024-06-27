// i18n/lang-resource
import enSidebar from "./en/sidebar/sidebar";
import cnSidebar from "./cn/sidebar/sidebar";
import zhSidebar from "./zh-CN/sidebar/sidebar";
import enDashboard from "./en/dashboard/dashboard";
import cnDashboard from "./cn/dashboard/dashboard";
import zhDashboard from "./zh-CN/dashboard/dashboard";

const resources = {
  en: {
    common: {},
    sidebar: enSidebar,
    dashboard: enDashboard,
  },
  cn: {
    common: {},
    sidebar: cnSidebar,
    dashboard: cnDashboard,
  },
  "zh-CN": {
    common: {},
    sidebar: zhSidebar,
    dashboard: zhDashboard,
  },
};

export default resources;
