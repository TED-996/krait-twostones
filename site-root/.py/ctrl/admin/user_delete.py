import krait

def get_response(request):
	# delete logic using request.query["..."] ("id" cel mai probabil)

	return krait.Response("HTTP/1.1", 302, ...) # TODO