import { HookDefinitions } from "fvtt-hook-attacher";
import { MODULE_ID, UPPER_MODULE_ID } from "../constants";
import { BooleanField, DataSchema, NumberField } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";

export interface LimitedAttenuationWallFlags {
    hasLimitedAttenuation: boolean
    limitedAttenuationRatio: number
};

declare module "fvtt-types/configuration" {
    interface FlagConfig {
        Wall: {
            [MODULE_ID]?: LimitedAttenuationWallFlags
        };
    }
}

interface LimitedAttenuationFlagsSchema extends DataSchema {
    hasLimitedAttenuation: BooleanField,
    limitedAttenuationRatio: NumberField
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
        super(wallDocument.flags["sylvercode-enhance-limited-wall"]);
        this.schema.name = "sylvercode-enhance-limited-wall";
        this.schema.parent = wallDocument.schema.fields.flags;
    }

    static override defineSchema() {
        return {
            hasLimitedAttenuation: new foundry.data.fields.BooleanField(
                { initial: false },
                { name: "hasLimitedAttenuation" }),
            limitedAttenuationRatio: new foundry.data.fields.NumberField(
                { initial: 0.5, min: 0, max: 1, step: 0.1 },
                { name: "limitedAttenuationRatio" })
        }
    }
}
