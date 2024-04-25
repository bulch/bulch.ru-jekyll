build:
	docker build -t bulch.ru-jekyll -f docker/Dockerfile .
up:
	docker run -p 8080:8080 --name bulch.ru-jekyll bulch.ru-jekyll