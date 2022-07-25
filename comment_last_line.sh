# Work around for https://github.com/dfinity/sdk/issues/2240
# comments out the last line of the index.js declaration files created during the dfx generate command

for f in src/declarations/*/index.js; do \
  sed -i '' -e '$s/^/\/\//' "$f"; \
done