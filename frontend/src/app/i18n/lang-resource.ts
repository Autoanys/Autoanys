// i18n/lang-resource
import enSidebar from "./en/sidebar/sidebar";
import cnSidebar from "./cn/sidebar/sidebar";
import zhSidebar from "./zh-CN/sidebar/sidebar";
import enDashboard from "./en/dashboard/dashboard";
import cnDashboard from "./cn/dashboard/dashboard";
import zhDashboard from "./zh-CN/dashboard/dashboard";
import enSetting from "./en/setting/setting";
import cnSetting from "./cn/setting/setting";
import zhSetting from "./zh-CN/setting/setting";
import cnCommon from "./cn/common/common";
import enCommon from "./en/common/common";
import zhCommon from "./zh-CN/common/common";
import enFlow from "./en/flow/flow";
import cnFlow from "./cn/flow/flow";
import zhFlow from "./zh-CN/flow/flow";
import cnFlowCanva from "./cn/flowCanvas/flowCanvas";
import enFlowCanva from "./en/flowCanvas/flowCanvas";
import zhFlowCanva from "./zh-CN/flowCanvas/flowCanvas";

const resources = {
  en: {
    common: enCommon,
    sidebar: enSidebar,
    dashboard: enDashboard,
    setting: enSetting,
    subflow: enFlow,
    flowCanvas: enFlowCanva,
  },
  cn: {
    common: cnCommon,
    sidebar: cnSidebar,
    dashboard: cnDashboard,
    setting: cnSetting,
    subflow: cnFlow,
    flowCanvas: cnFlowCanva,
  },
  "zh-CN": {
    common: zhCommon,
    sidebar: zhSidebar,
    dashboard: zhDashboard,
    setting: zhSetting,
    subflow: zhFlow,
    flowCanvas: zhFlowCanva,
  },
};

export default resources;
