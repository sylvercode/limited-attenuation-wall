import { MODULE_ID, UPPER_MODULE_ID } from "../constants";
import { LIMITED_ATTENUATION_RATIO_FIELD_OPTIONS } from "./limited_attenuation_wall_flags_data_model";

declare module "fvtt-types/configuration" {
    interface SettingConfig {
        "limited-attenuation-wall.defaultLimitedAttenuationRatio": foundry.data.fields.NumberField<typeof LIMITED_ATTENUATION_RATIO_FIELD_OPTIONS>;
    }
}

enum LimitedAttenuationWallSettingNames {
    DefaultLimitedAttenuationRatio = "defaultLimitedAttenuationRatio"
}

export enum LimitedAttenuationWallSettingDefaults {
    DefaultLimitedAttenuationRatio = 0.5
}

function registerLimitedAttenuationWallSettings() {
    if (!game.settings) throw new Error("Game settings not initialized");
    if (!game.i18n) throw new Error("Game i18n not initialized");

    const defaultRatioFieldOptions = Object.assign({}, LIMITED_ATTENUATION_RATIO_FIELD_OPTIONS, { initial: LimitedAttenuationWallSettingDefaults.DefaultLimitedAttenuationRatio });
    game.settings.register(MODULE_ID, LimitedAttenuationWallSettingNames.DefaultLimitedAttenuationRatio, {
        name: game.i18n.localize(`${UPPER_MODULE_ID}.settings.${LimitedAttenuationWallSettingNames.DefaultLimitedAttenuationRatio}.name`),
        hint: game.i18n.localize(`${UPPER_MODULE_ID}.settings.${LimitedAttenuationWallSettingNames.DefaultLimitedAttenuationRatio}.hint`),
        scope: "world",
        config: true,
        type: new foundry.data.fields.NumberField(defaultRatioFieldOptions),
        input: (field, config) => field.toInput(config)
    });
}

export const onInitHandle = registerLimitedAttenuationWallSettings;

class LimitedAttenuationWallSetting {

    defaultLimitedAttenuationRatio(): number {
        if (!game.settings) throw new Error("Game settings not initialized");

        return game.settings.get(MODULE_ID, LimitedAttenuationWallSettingNames.DefaultLimitedAttenuationRatio) ?? LimitedAttenuationWallSettingDefaults.DefaultLimitedAttenuationRatio;
    }
}

export const limitedAttenuationWallSettings = new LimitedAttenuationWallSetting();
