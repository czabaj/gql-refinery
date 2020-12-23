import { color, log, stringify } from "./log.ts";
import { toGraphQL } from "./openApiV3.destillery.ts";
import { AnyObject, OpenAPIV3 } from "./types.d.ts";
import { loadFile } from "./utils.ts";

enum ApiSpecificationFormats {
  OpenAPI_v3,
}

const inferType = (specContent: AnyObject) => {
  if (
    typeof specContent.openapi === "string" &&
    specContent.openapi.startsWith("3")
  ) {
    return {
      document: specContent as unknown as OpenAPIV3.Document,
      format: ApiSpecificationFormats.OpenAPI_v3,
    };
  }
  throw new Error(
    `Unsupported file format. Currently, only OpenAPI v3 is supported. Received:
    
    ${stringify(specContent, { maxDepth: 1 })}`,
  );
};

export const processSpecificationFile = async (specFile: string) => {
  log(color.blue(`Loading file: ${specFile}`));
  const content = await loadFile(specFile);
  const { document, format } = inferType(content);
  log(
    color.blue(
      `File is of type ${ApiSpecificationFormats[format]}`,
    ),
  );
  switch (format) {
    case ApiSpecificationFormats.OpenAPI_v3:
      await toGraphQL(document);
      break;
  }
};
