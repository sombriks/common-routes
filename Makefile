# root makefile
export PATH := node_modules/.bin:$(PATH)
export TIME_RELEASE := $(shell /bin/date "+%Y-%m-%d_%H-%M-%S")
export VERSION := $(shell node -e "console.log(require('./package.json').version)")

testing: 
	nyc mocha --timeout 10000 --exit

release: 
	echo $(TIME_RELEASE) > .latest_release ; 
	sleep 1 ;
	git add . ; 
	git commit -m 'release $(TIME_RELEASE) version $(VERSION)' ; 
	git tag $(VERSION) ; 
	git push origin $(VERSION) ;
	git push origin master ;
	npm publish ; 

