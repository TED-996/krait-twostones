import krait
import json


def get_response():
    data = json.loads(krait.request.body)

    return krait.ResponseRedirect("/dashboard")
