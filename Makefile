
export PATH := node_modules/.bin:$(PATH)
# git tag things
export TIME_RELEASE := $(shell /bin/date "+%Y-%m-%d_%H-%M-%S")

testing: 
	mocha --timeout --exit

release: 
	echo $(TIME_RELEASE) > .last_release
	git add . ; 
	git commit -m 'release $(TIME_RELEASE)' ; 
	git tag v$(TIME_RELEASE) ; 
	git push origin v$(TIME_RELEASE) ;
	git push origin master ; 
	npm publish ; 

