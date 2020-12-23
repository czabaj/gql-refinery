run:
	deno run --allow-read=./__fixtures__ \
		mod.ts --outputDir=./tmp ./__fixtures__/petstore.yaml

test:
	deno test --allow-read=./__fixtures__ --import-map=import_map.json --unstable $(file)
	