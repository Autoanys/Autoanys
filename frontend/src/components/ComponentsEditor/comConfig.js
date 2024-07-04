// comConfig.js
const comConfig = {
  // header: {
  //   label: "Header",
  //   value: "@router.get('/test/test')",
  //   icon: "/images/components/header_icon.png",
  // },
  function: {
    label: "Function",
    value: "async def test_test():",
    icon: "/images/components/function_icon.png",
  },
  return: {
    label: "Return",
    value: "return {'message': 'Endpoint return data'}",
    icon: "/images/components/return_icon.png",
  },
  simpleRun: {
    label: "Simple Run",
    value: "async def simple_run():\n    return {'message': 'Simple Run'}",
    icon: "/images/components/get_icon.png",
  },
  openGoogle: {
    label: "Open Google",
    value:
      "async def open_google():\n    try:\n        driver.get('https://www.google.com')\n        return {'message': 'Google Opened'}\n    except Exception as e:\n        return {'message': f'Error Occured {e}'}",
    icon: "/images/components/google_icon.png",
  },
};

export default comConfig;
