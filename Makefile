all:
	zip -r cloudevent.zip *
	wsk action update cloudevent cloudevent.zip --kind nodejs:default --web true

