SHELL:=/bin/bash

NBIN=./node_modules/.bin


help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


dev: start
start: ## Run the dev server
	$(NBIN)/squarespace-server https://redbadger-blog.squarespace.com


.PHONY: \
	help \
	start
