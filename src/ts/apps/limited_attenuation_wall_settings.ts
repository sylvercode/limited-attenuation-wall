import { MODULE_ID, UPPER_MODULE_ID } from "../constants";
import { LIMITED_ATTENUATION_RATIO_FIELD_OPTIONS } from "./limited_attenuation_wall_flags_data_model";

declare module "fvtt-types/configuration" {
    interface SettingConfig {
        "limited-attenuation-wall.defaultLimitedAttenuationRatio": foundry.data.fields.NumberField<typeof LIMITED_ATTENUATION_RATIO_FIELD_OPTIONS>;
    }
}

/**
 * Enum for setting names used in the Limited Attenuation Wall module.
 */
enum LimitedAttenuationWallSettingNames {
    DefaultLimitedAttenuationRatio = "defaultLimitedAttenuationRatio"
}

/**
 * Enum for default values of settings in the Limited Attenuation Wall module.
 */
export enum LimitedAttenuationWallSettingDefaults {
    DefaultLimitedAttenuationRatio = 0.5
}

/**
 * Registers the settings for the Limited Attenuation Wall module.
 */
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

/**
 * onInit callback for registering module settings.
 */
export const onInitHandle = registerLimitedAttenuationWallSettings;

/**
 * Class for accessing Limited Attenuation Wall settings.
 */
class LimitedAttenuationWallSetting {

    /**
     * Gets the default limited attenuation ratio from settings.
     * @returns {number} The default limited attenuation ratio.
     */
    defaultLimitedAttenuationRatio(): number {
        if (!game.settings)
            throw new Error("Game settings not initialized");

        return game.settings.get(MODULE_ID, LimitedAttenuationWallSettingNames.DefaultLimitedAttenuationRatio) ?? LimitedAttenuationWallSettingDefaults.DefaultLimitedAttenuationRatio;
    }
}

/**
 * Singleton instance for accessing Limited Attenuation Wall settings.
 */
export const limitedAttenuationWallSettings = new LimitedAttenuationWallSetting();
