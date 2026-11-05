import assert from "node:assert/strict";
import { test } from "node:test";
import { CATEGORY_ICONS } from "../src/components/category-icon";
import { FieldOptions, NewUseCase } from "../src/types";
import { DEFAULT_USE_CASE_MAP_SETTINGS, resolveUseCaseMapSettings } from "../src/lib/map-settings";
import {
  fieldFormDefaultValues as fieldDefaults,
  toApiData as fieldToApiData,
} from "../src/app/admin/organizations/[id]/use_cases/[useCaseId]/fields/_components/field-form";
import {
  fieldFormDefaultValues as typeFieldDefaults,
  toApiData as typeFieldToApiData,
} from "../src/app/admin/organizations/[id]/use_cases/[useCaseId]/location-types/_components/field-form";

test("category icons survive field option parsing and both editor serializers", () => {
  const options = {
    choices: ["Cafe"],
    choiceIcons: { Cafe: "coffee" },
    choiceColors: { Cafe: "#123456" },
    choiceInfo: { Cafe: "Coffee and snacks" },
  };
  assert.deepEqual(FieldOptions.parse(options), options);
  const values = {
    ...fieldDefaults,
    name: "Services",
    field_type: "multi_select" as const,
    choices: [{ value: "Cafe" }],
    choiceIcons: options.choiceIcons,
    choiceColors: options.choiceColors,
    choiceInfo: options.choiceInfo,
  };
  assert.deepEqual(fieldToApiData(values).options, options);
  assert.deepEqual(typeFieldToApiData({ ...typeFieldDefaults, ...values }).options, options);
});

test("default category icons do not add overrides to saved options", () => {
  const values = { ...fieldDefaults, field_type: "multi_select" as const, choices: [{ value: "Cafe" }] };
  assert.deepEqual(fieldToApiData(values).options, { choices: ["Cafe"] });
  assert.deepEqual(typeFieldToApiData({ ...typeFieldDefaults, ...values }).options, { choices: ["Cafe"] });
});

test("custom map marker survives parsing and resolution without changing other settings", () => {
  const marker_icon_url = "data:image/png;base64,aWNvbg==";
  const map_settings = { ...DEFAULT_USE_CASE_MAP_SETTINGS, marker_icon_url };
  const parsed = NewUseCase.parse({ name: "Services", description: "", map_settings });
  assert.deepEqual(resolveUseCaseMapSettings(parsed.map_settings), map_settings);
  assert.equal(resolveUseCaseMapSettings(null).marker_icon_url, undefined);
  assert.equal(resolveUseCaseMapSettings({ marker_icon_url: "" }).marker_icon_url, "");
});

test("icon catalog uses unique identifiers and valid localized names", () => {
  assert.equal(new Set(CATEGORY_ICONS.map((entry) => entry.id)).size, CATEGORY_ICONS.length);
  assert.ok(CATEGORY_ICONS.some((entry) => entry.id === "coffee"));
  assert.ok(CATEGORY_ICONS.some((entry) => entry.id === "recycle"));
  for (const entry of CATEGORY_ICONS) {
    assert.ok(entry.fi.length > 0 && entry.en.length > 0);
    assert.ok(!entry.fi.includes("\0"));
  }
});