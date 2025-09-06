import { HookDefinitions } from "fvtt-hook-attacher";
import { MODULE_ID, UPPER_MODULE_ID } from "../constants";
import { BooleanField, DataSchema, NumberField } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";

export const LIMITED_ATTENUATION_RATIO_FIELD_OPTIONS = { min: 0.05, max: 0.95, step: 0.05, nullable: true };

class LimitedAttenuationWallFlagNames {
    readonly hasLimitedAttenuation = "hasLimitedAttenuation" as const;
    readonly limitedAttenuationRatio = "limitedAttenuationRatio" as const;
}

export const LIMITED_ATTENUATION_WALL_FLAG_NAMES = new LimitedAttenuationWallFlagNames();

export interface LimitedAttenuationWallFlags {
    [LIMITED_ATTENUATION_WALL_FLAG_NAMES.hasLimitedAttenuation]: boolean
    [LIMITED_ATTENUATION_WALL_FLAG_NAMES.limitedAttenuationRatio]: number
};

declare module "fvtt-types/configuration" {
    interface FlagConfig {
        Wall: {
            [MODULE_ID]?: LimitedAttenuationWallFlags
        };
    }
}

interface LimitedAttenuationFlagsSchema extends DataSchema {
    [LIMITED_ATTENUATION_WALL_FLAG_NAMES.hasLimitedAttenuation]: BooleanField,
    [LIMITED_ATTENUATION_WALL_FLAG_NAMES.limitedAttenuationRatio]: NumberField
}

export class LimitedAttenuationWallFlagsDataModel extends foundry.abstract.DataModel<LimitedAttenuationFlagsSchema> {

    static readonly HOOKS_DEFINITIONS: Iterable<HookDefinitions> = [{
        on: [{
            name: "i18nInit",
            callback: LimitedAttenuationWallFlagsDataModel.i18nInit
        }]
    }];

    static override LOCALIZATION_PREFIXES = [`${UPPER_MODULE_ID}.LimitedAttenuationWallFlags`];

    static i18nInit() {
        foundry.helpers.Localization.localizeDataModel(LimitedAttenuationWallFlagsDataModel);
    }

    constructor(wallDocument: WallDocument) {
        super(wallDocument.flags[MODULE_ID]);
        this.schema.name = MODULE_ID;
        this.schema.parent = wallDocument.schema.fields.flags;
    }

    static override defineSchema() {
        return {
            [LIMITED_ATTENUATION_WALL_FLAG_NAMES.hasLimitedAttenuation]: new foundry.data.fields.BooleanField(
                { initial: false },
                { name: LIMITED_ATTENUATION_WALL_FLAG_NAMES.hasLimitedAttenuation }),
            [LIMITED_ATTENUATION_WALL_FLAG_NAMES.limitedAttenuationRatio]: new foundry.data.fields.NumberField(
                LIMITED_ATTENUATION_RATIO_FIELD_OPTIONS,
                { name: LIMITED_ATTENUATION_WALL_FLAG_NAMES.limitedAttenuationRatio })
        }
    }
}
