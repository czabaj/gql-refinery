run:
	deno run --allow-read=./__fixtures__ --allow-write=./tmp \
		mod.ts --outputDir=./tmp ./__fixtures__/gate_api.yaml

test:
	deno test --allow-read=./__fixtures__ $(file)
	