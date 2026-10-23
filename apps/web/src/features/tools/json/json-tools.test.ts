import { describe, expect, it } from "vitest";
import { csvToJson, diffEnv, jsonToCsv, jsonToYaml, tomlToJson, xmlToJson, yamlToJson } from "./conversions";
import { findDuplicateKeys, formatJson, jsonToTypeScript, minifyJson, parseJson, queryJsonPath } from "./json-tools";
import { validateJsonSchema } from "./schema";

describe("json tools", () => {
  it("formats, minifies, and sorts keys", () => {
    expect(formatJson('{"b":1,"a":[2]}', 2)).toBe('{\n  "b": 1,\n  "a": [\n    2\n  ]\n}');
    expect(minifyJson('{\n  "a": 1\n}')).toBe('{"a":1}');
    expect(formatJson('{"b":1,"a":2}', 2, true)).toContain('"a": 2');
  });

  it("reports the location of invalid JSON and accepts a top-level array", () => {
    expect(() => parseJson('{\n  "a": \n}')).toThrow(/line 3/);
    expect(parseJson("[1, 2]")).toEqual([1, 2]);
    expect(() => parseJson("")).toThrow(/Paste JSON/);
  });

  it("finds duplicate keys and evaluates a small JSONPath", () => {
    expect(findDuplicateKeys('{"a":1,"a":2}')).toEqual([{ path: "/", key: "a" }]);
    const value = { user: { name: "Ada" }, items: [{ name: "Lin" }] };
    expect(queryJsonPath(value, "$.user.name").map((node) => node.value)).toEqual(["Ada"]);
    expect(queryJsonPath(value, "$..name").map((node) => node.value).sort()).toEqual(["Ada", "Lin"]);
  });

  it("converts CSV, YAML, XML, and TOML", () => {
    const csv = 'name,note\n"Ada","hello, world"\nLin,"line\nbreak"';
    const json = csvToJson(csv);
    expect(JSON.parse(json)[0]).toEqual({ name: "Ada", note: "hello, world" });
    expect(jsonToCsv(json)).toContain("Ada");
    expect(JSON.parse(yamlToJson("name: Ada\ncount: 1"))).toEqual({ name: "Ada", count: 1 });
    expect(jsonToYaml('{"name":"Ada"}')).toContain("name: Ada");
    expect(JSON.parse(xmlToJson('<user id="1">Ada</user>'))).toEqual({ user: { "@_id": "1", "#text": "Ada" } });
    expect(JSON.parse(tomlToJson('name = "Ada"\ncount = 1'))).toEqual({ name: "Ada", count: 1 });
  });

  it("masks env secrets and writes TypeScript", () => {
    const diff = diffEnv("SECRET=supersecretvalue123\nNAME=ada", "SECRET=othersecretvalue1234\nNAME=ada");
    expect(diff).toEqual([
      expect.objectContaining({ key: "SECRET", change: "changed", left: "••••••", right: "••••••", sensitive: true }),
    ]);
    expect(jsonToTypeScript('{"name":"Ada","count":1}', "User")).toContain("name: string;");
    expect(validateJsonSchema('{"name":"Ada"}', '{"type":"object","required":["name"]}')).toMatchObject({
      valid: true,
    });
  });
});
