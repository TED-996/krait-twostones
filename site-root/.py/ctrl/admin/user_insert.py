import krait

def get_response(request):
	# insert logic using request.query["..."] (campuri setate din form)

	return krait.Response("HTTP/1.1", 302, ...) # TODO