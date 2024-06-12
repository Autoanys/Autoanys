from fastapi import APIRouter
import importlib.util
import json

def load_plugins():
    with open("plugins.json", "r") as f:
        plugins_config = json.load(f)
    
    router = APIRouter()

    for plugin in plugins_config["plugins"]:
        method = plugin["method"].lower()
        endpoint = plugin["endpoint"]
        coding = plugin.get("coding", "")
        return_value = plugin.get("return", "")
        arguments = plugin.get("arguments", {})

        def plugin_handler(**kwargs):
            exec(coding, globals(), locals())
            return eval(return_value)
        
        if method == "get":
            router.add_api_route(endpoint, plugin_handler, methods=["GET"])
        elif method == "post":
            # Extract additional parameters from arguments dictionary
            response_model = arguments.pop("response_model", None)
            dependencies = arguments.pop("dependencies", None)
            router.add_api_route(endpoint, plugin_handler, methods=["POST"], response_model=response_model, dependencies=dependencies, **arguments)
        # Add more methods as needed
        
    return router

router = load_plugins()
