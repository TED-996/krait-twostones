import sys

def printf(format, *args):
	sys.stdout.write(format % args)

def printException(exception):
	error, = exception.args
	printf("Erros code = %s\n", error.code)
	printf("Error message = %s\n", error.message)