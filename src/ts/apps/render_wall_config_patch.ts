import { HookDefinitions } from "fvtt-hook-attacher";
import ApplicationV2 from "node_modules/fvtt-types/src/foundry/client/applications/api/application.mjs";
import { MODULE_ID } from "../constants";
import { DataField } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { LimitedAttenuationWallFlags, LimitedAttenuationWallFlagsDataModel, LIMITED_ATTENUATION_WALL_FLAG_NAMES } from "./limited_attenuation_wall_flags_data_model";

export const HOOKS_DEFINITIONS: Iterable<HookDefinitions> = [{
    on: [{
        name: "renderWallConfig",
        callback: renderWallConfig
    }]
}];

async function renderWallConfig(
    _application: WallConfig,
    element: HTMLElement,
    context: ApplicationV2.RenderContextOf<WallConfig>,
    _options: ApplicationV2.RenderOptionsOf<WallConfig>) {

    const content = element.querySelector(".window-content");
    if (!content) {
        console.error("Could not find .window-content element");
        return;
    }

    const fieldset = content.querySelector('fieldset:has(select[name="sight"])');
    if (!fieldset) {
        console.error('Could not find fieldset containing select[name="sight"]');
        return;
    }

    const sightSelect = content.querySelector('select[name="sight"]') as HTMLSelectElement;
    const isSightLimited = parseInt(sightSelect.value) === CONST.WALL_SENSE_TYPES.LIMITED;

    const dataModel = new LimitedAttenuationWallFlagsDataModel(context.document);
    const fieldNames: (keyof LimitedAttenuationWallFlags)[] = [
        LIMITED_ATTENUATION_WALL_FLAG_NAMES.hasLimitedAttenuation,
        LIMITED_ATTENUATION_WALL_FLAG_NAMES.limitedAttenuationRatio
    ];
    const fields = fieldNames.map(fieldName => {
        const field = dataModel.schema.fields[fieldName] as DataField<any, any>;
        return field.toFormGroup(
            { rootId: context.rootId },
            { value: dataModel[fieldName], disabled: !isSightLimited }
        );
    });

    fields.forEach(field => {
        fieldset.append(field);
    });

    sightSelect.addEventListener("change", () => {
        const enable = parseInt(sightSelect.value) === CONST.WALL_SENSE_TYPES.LIMITED;
        fieldset.querySelectorAll('[name^="flags.' + MODULE_ID + '."]').forEach(el => {
            (el as HTMLInputElement).disabled = !enable;
        });
    });
}
