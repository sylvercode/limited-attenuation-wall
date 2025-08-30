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

    const dataModel = new LimitedAttenuationWallFlagsDataModel(context.document);
    const fieldsNames: (keyof LimitedAttenuationWallFlags)[] = [
        LIMITED_ATTENUATION_WALL_FLAG_NAMES.hasLimitedAttenuation,
        LIMITED_ATTENUATION_WALL_FLAG_NAMES.limitedAttenuationRatio
    ];
    const fields = fieldsNames.map(fieldName => {
        const field = dataModel.schema.fields[fieldName] as DataField<any, any>;
        return field.toFormGroup(
            { rootId: `${context.rootId}-${MODULE_ID}-${fieldName}` },
            { value: dataModel[fieldName] }
        );
    });

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

    fields.forEach(field => {
        fieldset.append(field);
    });
}
