NAME = reply-guard
VERSION = $(shell jq -r .version manifest.json)
ZIP = $(NAME)-$(VERSION).zip

FILES = manifest.json content.js styles.css icon128.png

$(ZIP): $(FILES)
	rm -f $@
	zip $@ $(FILES)

.PHONY: clean
clean:
	rm -f $(NAME)-*.zip
