const dictionaries: any = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  cn: () => import("./dictionaries/cn.json").then((module) => module.default),
};
