run:
	deno run --allow-read=./__fixtures__ --allow-write=./tmp \
		cli.ts --outputDir=./tmp ./__fixtures__/gate_api.yaml

debug:
	deno run --inspect-brk --allow-read=./__fixtures__ --allow-write=./tmp \
		cli.ts --outputDir=./tmp ./__fixtures__/gate_api.yaml

test:
	deno test --allow-read=./__fixtures__ $(file)

bundle:
	deno bundle mod.ts dist/gqlRefinery.js

lock:
	deno cache --lock=lock.json --lock-write deps.ts

install:
	deno cache --reload --lock=lock.json deps.ts
	