import { MODULE_ID } from "../constants";
import { LimitedAttenuationWallFlags, LimitedAttenuationWallFlagsDataModel, LimitedAttenuationWallFlagNames } from "./limited_attenuation_wall_flags_data_model";
import { limitedAttenuationWallSettings } from "./limited_attenuation_wall_settings";
import { HookDefinitions } from "fvtt-hook-attacher";
import type ApplicationV2 from "fvtt-types/src/foundry/client/applications/api/application.mjs";
import type { DataField } from "fvtt-types/src/foundry/common/data/fields.mjs";

/**
 * Iterable of hook definitions for patching the WallConfig rendering.
 */
export const HOOKS_DEFINITIONS: Iterable<HookDefinitions> = [{
    on: [{
        name: "renderWallConfig",
        callback: renderWallConfig
    }]
}];

/**
 * Callback for the renderWallConfig hook, modifies the WallConfig UI to support limited attenuation wall flags.
 * @param application The WallConfig application instance.
 * @param element The root HTML element of the application.
 * @param context The render context for the application.
 * @param options The render options for the application.
 */
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
    sightSelect.addEventListener("change", () => {
        const enable = parseInt(sightSelect.value) === CONST.WALL_SENSE_TYPES.LIMITED;
        fieldset.querySelectorAll(`[name^="flags.${MODULE_ID}."]`).forEach(el => {
            (el as HTMLInputElement).disabled = !enable;
        });
    });
    const isSightLimited = parseInt(sightSelect.value) === CONST.WALL_SENSE_TYPES.LIMITED;

    const dataModel = new LimitedAttenuationWallFlagsDataModel(context.document);

    function toFormGroup(fieldName: keyof LimitedAttenuationWallFlags, inputConfig?: { value: any, disabled?: boolean }) {
        const field = dataModel.schema.fields[fieldName] as DataField<any, any>;
        return field.toFormGroup(
            { rootId: context.rootId },
            inputConfig ?? { value: dataModel[fieldName], disabled: !isSightLimited }
        );
    };

    const hasLimitedAttenuationFieldGroup = toFormGroup(LimitedAttenuationWallFlagNames.hasLimitedAttenuation);
    fieldset.append(hasLimitedAttenuationFieldGroup);

    if (dataModel.hasLimitedAttenuation && !dataModel.limitedAttenuationRatio)
        dataModel.limitedAttenuationRatio = limitedAttenuationWallSettings.defaultLimitedAttenuationRatio();

    if (dataModel.limitedAttenuationRatio)
        hasLimitedAttenuationFieldGroup.after(toFormGroup(LimitedAttenuationWallFlagNames.limitedAttenuationRatio));
    else {
        const hasLimitedAttenuationField = hasLimitedAttenuationFieldGroup.querySelector("input[type='checkbox']") as HTMLInputElement;
        if (!hasLimitedAttenuationField) throw new Error("Could not find hasLimitedAttenuationField");
        hasLimitedAttenuationField.addEventListener("change", () => {
            if (!hasLimitedAttenuationField.checked)
                return;
            if (fieldset.querySelector(`[name^="flags.${MODULE_ID}.${LimitedAttenuationWallFlagNames.limitedAttenuationRatio}"]`))
                return;
            hasLimitedAttenuationFieldGroup.after(toFormGroup(
                LimitedAttenuationWallFlagNames.limitedAttenuationRatio,
                { value: limitedAttenuationWallSettings.defaultLimitedAttenuationRatio() }
            ));
        });
    }
}
